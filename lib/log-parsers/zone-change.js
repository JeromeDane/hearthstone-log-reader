function getClass(heroStr) {

  var className = 'unknown',
      heroes = [null, 'Warrior', 'Shaman', 'Rogue', 'Paladin', 'Hunter', 'Druid', 'Warlock', 'Mage', 'Priest'];

  var parts = heroStr.match(/^HERO_0(\d)/);
  if(parts)
    className = heroes[parseInt(parts[1])];

  return className;
}

module.exports = function(line, reader) {

  var game = reader._games.current;

  function updateCardCount(cardAction, data, decrement) {

    // store playerId if necessary
    if(!game.playerId && cardAction === 'drew')
      game.set('playerId', data.playerId);

    var player = game.getPlayerById(data.playerId),
        mulligan = cardAction === 'mulligan',
        cardSlot = mulligan ? 'drew' : cardAction,
        cardActionToEvent = {
          'mulligan': 'mulligan-card',
          'drew': 'draw-card',
          'created': 'create-card',
          'played': 'play-card',
          'discarded': 'discard-card'
        };

    // couldn't find the player yet, so just return
    if(!player) return;

    player[cardSlot] = player[cardSlot] || {};
    player[cardSlot][data.cardId] = player[cardSlot][data.cardId] || {
      name: data.cardName,
      count: 0,
      turns: []
    };
    if(mulligan) {
      player[cardSlot][data.cardId].count--;
      if(player[cardSlot][data.cardId].count < 1)
        delete player[cardSlot][data.cardId];
    }
    else {
      player[cardSlot][data.cardId].count++;
      player[cardSlot][data.cardId].turns.push(game.turn ? game.turn : 0)
    }

    var player = game.getPlayerById(data.playerId);
    if(player.name)
      reader.emit(cardActionToEvent[cardAction], player, data.cardId, data.cardName, game);
  }

  // Check if a card is changing zones.
  var zoneChangeRegex = /^\[Zone\] ZoneChangeList.ProcessChanges\(\) - id=\d* local=.* \[name=(.*) id=(\d*) zone=.* zonePos=\d* cardId=(.*) player=(\d)\] zone from ?(FRIENDLY|OPPOSING)? ?(.*)? -> ?(FRIENDLY|OPPOSING)? ?(.*)?$/
  if (zoneChangeRegex.test(line)) {
    var parts = zoneChangeRegex.exec(line);
    var data = {
      cardName: parts[1],
      entityId: parseInt(parts[2]),
      cardId: parts[3],
      playerId: parseInt(parts[4]),
      fromTeam: parts[5],
      fromZone: parts[6],
      toTeam: parts[7],
      toZone: parts[8]
    };

    // check for the coin
    if(data.cardId === 'GAME_005') {
      game.updatePlayer({
        id: data.toTeam === 'FRIENDLY' ? 1 : 2,
        coin: true
      });
    }

    // check for player details
    if(data.toZone === 'PLAY (Hero)') {
      game.updatePlayer({
        id: data.playerId,
        hero: data.cardName,
        heroId: data.cardId,
        class: getClass(data.cardId),
      });
    }

    else {

      if((!game.step || !game.step.match(/MAIN_/))) {

        // initial draw
        if(!data.fromTeam && data.toTeam === 'FRIENDLY' && data.toZone === 'HAND')
          updateCardCount('drew', data);

        // return to deck (mulligan)
        if(data.fromTeam === 'FRIENDLY' && data.fromZone === 'HAND' && data.toZone === 'DECK')
          updateCardCount('mulligan', data);
      }

      // play a card
      if(data.fromZone === 'HAND' && data.toZone !== 'GRAVEYARD' && data.toZone !== 'DECK')
        updateCardCount('played', data);

      // draw a card
      if(data.fromZone === 'DECK' && data.fromZone !== 'HAND')
        updateCardCount('drew', data);

      // discard a card
      if(data.fromZone === 'HAND' && data.toZone === 'GRAVEYARD')
        updateCardCount('discarded', data);

      // create card
      if(!data.fromZone && data.toTeam === 'FRIENDLY' && data.toZone === 'HAND' && game.step.match(/^MAIN/))
        updateCardCount('created', data);

      reader.emit('zone-change', data);
    }

  }
};
