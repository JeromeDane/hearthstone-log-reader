var Game = function() {
  this.players = [];
  this.step = '';
};

Game.prototype._changed = {};
Game.prototype._previous = {};

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
  var self = this;

  // move players into their roles if possible
  if(self.playerId && self.players && self.players.length === 2) {
    var playerIndex = self.players[0].id === self.playerId ? 0 : 1;
    self.player = self.players[playerIndex];
    self.player.isPlayer = true;

    // reate card count containers
    self.player.played = self.player.played || {};
    self.player.discarded = self.player.discarded || {};
    self.player.created = self.player.created || {};

    self.opponent = self.players[playerIndex === 0 ? : 1 : 0];
    if(self.opponent) {
      self.opponent.played = self.opponent.played || {};
      self.opponent.discarded = self.opponent.discarded || {};
    }
    delete self.players;
  }

  // first check for the player and opponent properties
  if(self.player && self.opponent) {
    return id === self.playerId ? self.player : self.opponent;
  }

  // otherwise get the players from the bucket
  else {
    var player;

    // ckeck the player slots
    self.players.forEach(function(p) {
      if(p.id == id)
        player = p;
    });

    // player with given ID doesn't exist yet and needs to be created
    if(!player) {
      player = { id: id };
      self.players.push(player);
    }

    return player;
  }


  if(!this.playerId) {
    if(!this.players || this.players.length !== 2) return;
    var playerIndex = this.players[0].id === id ? 0 : 1;
    return this.players[playerIndex]
  };
  return id === this.playerId ? this.player : this.opponent;
};

Game.prototype.previous = function(key) {
  return this._previous[key];
};

Game.prototype.set = function(key, val) {
  this._previous[key] = this[key];
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
