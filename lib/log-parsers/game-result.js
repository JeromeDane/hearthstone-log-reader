module.exports = function(line, reader) {

  // Check game results and see if the game is over.
  var gameResultRegex = /\[Power\] GameState\.DebugPrintPower\(\) - TAG_CHANGE Entity=(.*) tag=PLAYSTATE value=(LOST|WON|TIED|CONCEDED)$/;
  if (gameResultRegex.test(line)) {
    var game = reader._games.current,
        parts = gameResultRegex.exec(line),
        player = { name: parts[1] };
    if(parts[2] === 'CONCEDED')
      player.conceded = true;
    else
      player.result = parts[2];
    game.updatePlayer(player);

    reader.emit('game-result', player);

    if(game.hasEnded()) {
      game.set('state', 'COMPLETE');
      game.set('end', new Date());
      delete game.step;
      reader.emit('game-complete', game);
    }
  }

}
