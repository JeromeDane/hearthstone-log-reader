var Game = function() {};

Game.prototype._changed = {};

Game.prototype.changed = function(key) {
  return this._changed[key];
};

Game.prototype.hasEnded = function() {
  return (this.player1 && this.player1.result && this.player2.result);
};

Game.prototype.hasStarted = function() {
  return (typeof this.state !== 'undefined' && this.player1 && this.player2);
};

Game.prototype.set = function(key, val) {
  if(this[key] !== val) {
    this[key] = val;
    this._changed[key] = true;
  }
  else
    this._changed[key] = false;
};

Game.prototype.updatePlayer = function(data) {

  // look up player ID by name if not found
  // TODO: What happens if both players have the exact same name?
  if(!data.id && data.name && this.hasStarted())
    data.id = data.name === this.player1.name ? this.player1.id : this.player2.id;

  if(!data.id) return;

  var player = this['player' + data.id] || {};
  for(var x in data)
    player[x] = data[x];
  this['player' + data.id] = player;
};

module.exports = Game;
