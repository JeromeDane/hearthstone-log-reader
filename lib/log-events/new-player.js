module.exports = function(line, logWatcher) {
  // Check for players entering play and track their team IDs.
  var newPlayerRegex = /\[Power\] GameState\.DebugPrintPower\(\) - TAG_CHANGE Entity=(.*) tag=PLAYER_ID value=(.)$/;
  if (newPlayerRegex.test(line)) {
    var game = logWatcher._games.current,
        parts = newPlayerRegex.exec(line);
    game.updatePlayer({
      name: parts[1],
      id: parseInt(parts[2])
    });
    return true;
  }
}
