module.exports = function(line, reader) {

  var game = reader._games.current;

  // Check for players entering play and track their team IDs.
  var newPlayerRegex = /\[Power\] GameState\.DebugPrintPower\(\) - TAG_CHANGE Entity=(.*) tag=PLAYER_ID value=(.)$/;
  if(newPlayerRegex.test(line)) {
    var parts = newPlayerRegex.exec(line),
        player = game.getPlayerById(parseInt(parts[2]));
    player.name = parts[1]
    game.updatePlayer(player);
    // delete game step incase it persisted from starting the logger in the middle of a game
    delete game.step;
    reader.emit('player-detected', player);
  }

}
