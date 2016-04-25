module.exports = function(line, reader) {
  // check for loading screen change.
  var gameStateRegex = /\[Power\] PowerTaskList.DebugPrintPower\(\) -\s+TAG_CHANGE Entity=GameEntity tag=(.+) value=(.+)/;
  if(gameStateRegex.test(line)) {
    var game = reader._games.current,
        parts = gameStateRegex.exec(line);
    switch(parts[1]) {
      case 'STATE':
        game.set('state', parts[2]);
          if(game.changed('state') && game.state === 'RUNNING') {
            game.set('start', new Date());
            reader.emit('game-start', game);
          }
        break;

      case 'STEP':
        game.set('step', parts[2]);
        // check for start of first turn after mulligan phase
        if(game.step === 'MAIN_READY' && game.previous('step') === 'BEGIN_MULLIGAN') {
          reader.emit('turn-start', 1, game.player.coin ? game.opponent : game.player)
        }
        break;

      // handle new turn
      case 'TURN':
        var turn = parseInt(parts[2]);
        game.set('turn', turn);
        if(game.changed('turn') && !isNaN(turn) && turn > 1) {
          // figure out whose turn it is
          var player = game.getPlayerById(1);
          if(turn % 2 !== (player.coin ? 0 : 1))
            player = game.getPlayerById(2);
          reader.emit('turn-start', turn, player);
        }
        break;
    }
    reader.emit('game-state', parts[1], parts[2]);
  }
};
