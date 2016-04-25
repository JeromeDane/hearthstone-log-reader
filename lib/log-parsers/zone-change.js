function getClass(heroStr) {

  var className = 'unknown',
      heroes = [null, 'Warrior', 'Shaman', 'Rogue', 'Paladin', 'Hunter', 'Druid', 'Warlock', 'Mage', 'Priest'];

  var parts = heroStr.match(/^HERO_0(\d)/);
  if(parts)
    className = heroes[parseInt(parts[1])];

  return className;
}


module.exports = function(line, logWatcher) {

  var game = logWatcher._games.current;

  function updateCardCount(cardAction, data, decrement) {
    var player = game.getPlayerById(data.playerId),
    cardActionToEvent = {
      'drew': 'draw-card',
      'played': 'play-card',
      'discarded': 'discard-card'
    };
    player[cardAction] = player[cardAction] || {};
    player[cardAction][data.cardId] = player[cardAction][data.cardId] || {
      name: data.cardName,
      count: 0
    };
    if(decrement) {
      player[cardAction][data.cardId].count--;
      if(player[cardAction][data.cardId].count < 1)
      delete player[cardAction][data.cardId];
    }
    else {
      player[cardAction][data.cardId].count++;
      logWatcher.emit(cardActionToEvent[cardAction], game.getPlayerById(ata.playerId), data.cardId, data.cardName);
    }
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
        if(!data.fromTeam && data.toTeam === 'FRIENDLY' && data.toZone === 'HAND') {
          // remember the user's player ID
          game.set('playerId', data.playerId);
          updateCardCount('drew', data);
        }
        // return to deck (mulligan)
        if(data.fromTeam === 'FRIENDLY' && data.fromZone === 'HAND' && data.toZone === 'DECK') {
          updateCardCount('drew', data, true);
        }
      }

      // play a card
      if(data.fromZone === 'HAND' && data.toZone !== 'GRAVEYARD' && data.toZone !== 'DECK') {
        updateCardCount('played', data);
      }

      // draw a card
      if(data.fromZone === 'DECK' && data.fromZone !== 'HAND') {
        updateCardCount('drew', data);
      }

      // discard a card
      if(data.fromZone === 'HAND' && data.toZone === 'GRAVEYARD') {
        updateCardCount('discarded', data);
      }

      logWatcher.emit('zone-change', data);
    }

  }
};
