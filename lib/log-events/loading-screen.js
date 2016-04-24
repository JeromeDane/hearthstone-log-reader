module.exports = function(line, logWatcher) {
  // check for loading screen change.
  var loadingScreenRegex = /\[LoadingScreen\] LoadingScreen\.OnSceneLoaded\(\) - prevMode=(\w+) currMode=(\w+)/
  if(loadingScreenRegex.test(line)) {
    var game = logWatcher._games.current,
        parts = loadingScreenRegex.exec(line),
        translation = {
          TOURNAMENT: 'PLAY',
          TAVERN_BRAWL: 'BRAWL',
          DRAFT: 'ARENA',
          ADVENTURE: 'SOLO'
        };
    if(typeof translation[parts[2]] !== 'undefined') {
      game.set('mode', translation[parts[2]])
      if(game.changed('mode'))
        logWatcher.emit('game-mode', game.mode);
    }
  }
};
