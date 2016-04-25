var LogReader = require('hearthstone-log-reader');
var reader = new LogReader();

reader.on('game-start', function(game) {
  console.log('Starting game:\n', game);
});
reader.on('turn-start', function(turn, player) {
  console.log('Starting turn', turn, '(player ' + player.name + ')');
});
reader.on('draw-card', function(player, cardId, cardName) {
  console.log(player.name, 'drew', cardName);
});
reader.on('mulligan-card', function(player, cardId, cardName) {
  console.log(player.name, 'mulliganed', cardName);
});
reader.on('play-card', function(player, cardId, cardName) {
  console.log(player.name, 'played', cardName);
});
reader.on('discard-card', function(player, cardId, cardName) {
  console.log(player.name, 'discarded', cardName);
});
reader.on('game-complete', function(game) {
  console.log('Game Complete:\n', game);
});

reader.start();
