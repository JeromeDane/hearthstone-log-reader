var Game = function() {};

Game.prototype._changed = {};

Game.prototype.changed = function(key) {
  return this._changed[key];
};

Game.prototype.nameToId = function(name) {
  if(!this.player) return null;
  return this.player.name === name ? this.player.id : this.opponent.id;
};

Game.prototype.hasEnded = function() {
  return (this.player && this.player.result && this.opponent.result);
};

Game.prototype.hasStarted = function() {
  return (typeof this.state !== 'undefined' && this.player && this.opponent);
};

Game.prototype.getPlayerById = function(id) {
  this.player = this.player || {};
  this.opponent = this.opponent || {};
  return id === this.playerId ? this.player : this.opponent;
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
    data.id = data.name === this.player.name ? this.player.id : this.opponent.id;

  // couldn't determine player ID from player name, so do nothing
  if(!data.id) return;

  var player = this.getPlayerById(data.id);
  for(var x in data)
    player[x] = data[x];
};

module.exports = Game;
