module.exports = function(line, logWatcher) {
  // check for loading screen change.
  var gameStateRegex = /\[Power\] PowerTaskList.DebugPrintPower\(\) -\s+TAG_CHANGE Entity=GameEntity tag=(.+) value=(.+)/;
  if(gameStateRegex.test(line)) {
    var game = logWatcher._games.current,
        parts = gameStateRegex.exec(line);
    switch(parts[1]) {
      case 'STATE':
        game.set('state', parts[2]);
          if(game.changed('state') && game.state === 'RUNNING') {
            game.set('start', new Date());
            logWatcher.emit('game-start', game);
          }
        break;

      case 'STEP':
        game.set('step', parts[2]);
        break;

      // handle new turn
      case 'TURN':
        var turn = parseInt(parts[2]);
        game.set('turn', turn);
        if(game.changed('turn') && !isNaN(turn))
          logWatcher.emit('turn-start', turn, game.playerId);
        break;
    }
    logWatcher.emit('game-state', parts[1], parts[2]);
  }
};
