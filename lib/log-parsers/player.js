module.exports = function(line, logWatcher) {

  var game = logWatcher._games.current;

  // Check for players entering play and track their team IDs.
  var newPlayerRegex = /\[Power\] GameState\.DebugPrintPower\(\) - TAG_CHANGE Entity=(.*) tag=PLAYER_ID value=(.)$/;
  if (newPlayerRegex.test(line)) {
    var parts = newPlayerRegex.exec(line),
        player = {
          name: parts[1],
          id: parseInt(parts[2])
        };
    game.updatePlayer(player);
    // delete game step incase it persisted from starting the logger in the middle of a game
    delete game.step;
    logWatcher.emit('player-detected', player);
  }

  // Check for the current player's ID
  var currentPlayerRegex = /TAG_CHANGE Entity=(\w+) tag=CURRENT_PLAYER value=1$/;
  if (currentPlayerRegex.test(line)) {
    var parts = currentPlayerRegex.exec(line)
    game.set('currentPlayerName', parts[1]);
    game.set('currentPlayerId', game.nameToId(parts[1]));
    logWatcher.emit('current-player', parts[1]);
  }

  // TODO: figure out the user's player ID

}
