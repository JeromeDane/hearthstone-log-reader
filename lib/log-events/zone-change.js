function getClass(heroStr) {

  var className = 'unknown',
      heroes = [null, 'Warrior', 'Shaman', 'Rogue', 'Paladin', 'Hunter', 'Druid', 'Warlock', 'Mage', 'Priest'];

  var parts = heroStr.match(/^HERO_0(\d)/);
  if(parts)
    className = heroes[parseInt(parts[1])];

  return className;
}

function updateCardCount(game, container, data, decrement) {
  game['player' + data.playerId] = game['player' + data.playerId] || {};
  var subContainer = game['player' + data.playerId][container] || {};
  subContainer[data.cardId] = subContainer[data.cardId] || {
    name: data.cardName,
    count: 0
  };
  if(decrement)
    subContainer[data.cardId].count--;
  else
    subContainer[data.cardId].count++;
  if(subContainer[data.cardId].count < 1)
    delete subContainer[data.cardId];
  game['player' + data.playerId][container] = subContainer;
}

module.exports = function(line, logWatcher) {

  // Check if a card is changing zones.
  var zoneChangeRegex = /^\[Zone\] ZoneChangeList.ProcessChanges\(\) - id=\d* local=.* \[name=(.*) id=(\d*) zone=.* zonePos=\d* cardId=(.*) player=(\d)\] zone from ?(FRIENDLY|OPPOSING)? ?(.*)? -> ?(FRIENDLY|OPPOSING)? ?(.*)?$/
  if (zoneChangeRegex.test(line)) {
    var game = logWatcher._games.current,
        parts = zoneChangeRegex.exec(line);
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
          updateCardCount(game, 'drew', data);
        }
        // return to deck (mulligan)
        if(data.fromTeam === 'FRIENDLY' && data.fromZone === 'HAND' && data.toZone === 'DECK') {
          updateCardCount(game, 'drew', data, true);
        }
      }

      // make sure played and drew containers exist for both players to avoid errors
      game.player1 = game.player1 || {};
      game.player2 = game.player2 || {};

      // play a card
      if(data.fromZone === 'HAND' && data.toZone !== 'GRAVEYARD' && data.toZone !== 'DECK') {
        updateCardCount(game, 'played', data);
        logWatcher.emit('play-card', data.playerId, data.cardId, data.cardName);
      }

      // draw a card
      if(data.fromZone === 'DECK' && data.fromZone !== 'HAND') {
        updateCardCount(game, 'drew', data);
        logWatcher.emit('draw-card', data.playerId, data.cardId, data.cardName);
      }

      // discard a card
      if(data.fromZone === 'HAND' && data.toZone === 'GRAVEYARD') {
        updateCardCount(game, 'discarded', data);
        logWatcher.emit('discard-card', data.playerId, data.cardId, data.cardName);
      }

      logWatcher.emit('zone-change', data);
    }

  }
};
