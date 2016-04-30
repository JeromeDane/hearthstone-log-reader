module.exports = function(line, reader) {
  // check for loading screen change.
  var loadingScreenRegex = /\[LoadingScreen\] LoadingScreen\.OnSceneLoaded\(\) - prevMode=(\w+) currMode=(\w+)/
  if(loadingScreenRegex.test(line)) {
    var game = reader._games.current,
        parts = loadingScreenRegex.exec(line),
        translation = {
          TOURNAMENT: 'PLAY',
          TAVERN_BRAWL: 'BRAWL',
          DRAFT: 'ARENA',
          ADVENTURE: 'SOLO'
        };
    if(game.step === 'COMPLETE') {
      reader._games.push(game);
      delete reader._games.current;
      reader._games.current = new Game();
    }
    if(typeof translation[parts[2]] !== 'undefined') {
      game.set('mode', translation[parts[2]])
      if(game.changed('mode'))
        reader.emit('game-mode', game.mode);
    }
  }
};
