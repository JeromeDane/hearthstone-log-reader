# Hearthstone Log Reader

This node module takes care of the low-level monitoring of the [Hearthstone](http://us.battle.net/hearthstone/) log file and emits events based on what happens in the log file. Use this module if you want to build your own Hearthstonedeck tracker and don't want to do the work of parsing through the nasty log file yourself.

This is still in BETA. Please [report any issues or requests](https://github.com/JeromeDane/hearthstone-log-reader/issues).

- [Credits](#credits)
- [Prerequisites](#prerequisites)
- [Usage](#usage)
  - [Example](#example)
  - [Sample Output](#sample-output)
  - [Video](#video)
- [Methods](#methods)
  - [on()](#onevent-name-callback)
  - [start()](#start)
  - [stop()](#stop)
  - [parseBuffer(buffer)](#parse-buffer-buffer)
- [Events](#events)
  - [log-line](#log-line)
  - [game-start](#game-start)
  - [game-complete](#game-complete)
  - [draw-card](#draw-card)
  - [mulligan-card](#mulligan-card)
  - [play-card](#play-card)
  - [discard-card](#discard-card)
  - [create-card](#create-card)
  - [zone-change](#zone-change)
- [Testing](#testing)
- [Planned](#planned)
- [FAQ](#frequently-asked-questions)

## Credits

This project is based on [chevex-archived/hearthstone-log-watcher](https://github.com/chevex-archived/hearthstone-log-watcher), which I used to bootstrap my log file monitoring and initial parsing code. There is new functionality that may be beyond the scope of the original project. I also wanted to be able hack this as needed for my own work, and maintain my own issues, which is why a new repo was created instead of submitting pull requests. All credit for the base log file reading and initial parsing methods goes to the authors of the [original fork](https://github.com/chevex-archived/hearthstone-log-watcher).

## Prerequisites

This [Hearthstone](http://us.battle.net/hearthstone/) log reader is written as a node module, and assumes the following:

1. You know JavaScript.
2. You are familiar with [NodeJS](http://nodejs.org) and have it installed on your machine.
3. You understand what `npm install` does, etc.

If any of the statements above are not true, then ask Google for help before moving forward.

## Usage

Install this package in your app:

```bash
npm install hearthstone-log-reader --save
```
### Example

```javascript
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
```

### Sample output

```
Starting game:
 { mode: 'SOLO',
  playerId: 1,
  player:
   { id: 1,
     drew:
      { EX1_249: { name: 'Baron Geddon': count: 1 },
        EX1_085: { name: 'Mind Control Tech', count: 1 },
        BRM_006: { name: 'Imp Gang Boss', count: 1 } }
     hero: 'Gul\'dan',
     heroId: 'HERO_07',
     class: 'Warlock',
     isPlayer: true,
     name: 'Loki' },
  opponent:
   { id: 2,
     hero: 'Garrosh Hellscream',
     heroId: 'HERO_01',
     class: 'Warrior',
     name: 'The Innkeeper' },
  turn: 1,
  state: 'RUNNING',
  start: Mon Apr 25 2016 15:37:21 GMT-0400 (EDT) }
Loki drew Imp Gang Boss
Loki mulliganed Imp Gang Boss
Loki drew Zombie Chow
Loki mulliganed Mind Control Tech
Loki drew Dr. Boom
Loki mulliganed Baron Geddon
Starting turn 1 (Loki)
Loki drew Soulfire
Loki played Zombie Chow
Starting turn 2 (The Innkeeper)
The Innkeeper played Murloc Raider
Starting turn 3 (Loki)
Loki drew Fist of Jaraxxus
Loki played Soulfire
Loki discarded Dr. Boom
Game Complete:
 { mode: 'SOLO',
  playerId: 1,
  player:
   { id: 1,
     drew:
      { BRM_006: { name: 'Imp Gang Boss', count: 1 },
        FP1_001: { name: 'Zombie Chow', count: 1 },
        GVG_110: { name: 'Dr. Boom', count: 1 },
        EX1_308: { name: 'Soulfire', count: 1 },
        AT_022: { name: 'Fist of Jaraxxus', count: 1 } },
     hero: 'Gul\'dan',
     heroId: 'HERO_07',
     class: 'Warlock',
     isPlayer: true,
     name: 'Loki',
     played:
      { FP1_001: { name: 'Zombie Chow', count: 1 },
        EX1_308: { name: 'Soulfire', count: 1 }},
     discarded:
      { GVG_110: { name: 'Dr. Boom', count: 1 } },
     conceded: true,
     result: 'LOST' },
  opponent:
   { id: 2,
     hero: 'Garrosh Hellscream',
     heroId: 'HERO_01',
     class: 'Warrior',
     name: 'The Innkeeper',
     played:
      { CS2_168: { name: 'Murloc Raider', count: 1 } },
     result: 'WON' },
  turn: 3,
  state: 'COMPLETE',
  start: Mon Apr 25 2016 15:37:21 GMT-0400 (EDT),
  end: Mon Apr 25 2016 15:38:21 GMT-0400 (EDT) }
```

### Video
Here's a little demo video as well: (Video from [original project](https://github.com/chevex-archived/hearthstone-log-watcher). Needs to be updated for this project, but it'll give you an idea of what this can do.)

[![](http://i.imgur.com/tKtxS8L.png)](http://www.youtube.com/watch?v=ccXEcKrZxu4)

### Parse an existing log file

`reader.start()` begins reading any updates to the Hearthstone log file that occur after it has begun watching. If you need to parse a log from the beginning, you can use `parseBuffer`.

```javascript
var fs = require('fs');

fs.readFile('./my-old-player-log.log', function(err, buffer) {
  if (err) return console.error(err);
  reader.parseBuffer(buffer);
});
```

## Methods

### on([event-name], [callback])

Listen for an event. `event-name` is a string representing the name of the event you want to listen for. `callback` is a function that takes several callback arguments. See [Events](#events) section below for available events and their callback arguments.

### start()

Starts watching the log file and parses any changes to it.

### stop()

Stops the watcher.

### parseBuffer(buffer)

Parses a buffer (log file).

Useful if you have log files that you want to parse without watching them. See the usage example above for how to get the buffer from existing files.

## Events

Events can be listened to as in the following example:

```javascript
reader.on('log-line', function(line, game) {
  // do stuff
})
```

### **log-line**

The `log-line` event fires every time a new line is read from the Hearthstone event logs.

Callback Arguments:

- **line** - String of the line that was read from the hearthstone event logs
- **game** - Object representing the current state of the game

### **game-start**

The `game-start` event fires at the beginning of a match when the watcher has gathered enough data from the log to determine which of the two players is the local player.

Callback Arguments:

- **game** - An object representing the current game.

Example game object:

```javascript
{
  player: {
    drew: {
      GVG_110: { name: 'Dr. Boom', count: 1 },
      NEW1_030: { name: 'Deathwing', count: 1 },
      EX1_308: { name: 'Soulfire', count: 1 },
      EX1_249: { name: 'Baron Geddon', count: 1 },
      GAME_005: { name: 'The Coin', count: 1 }
    },
    id: 1,
    hero: 'Gul\'dan',
    heroId: 'HERO_07',
    class: 'Warlock',
    coin: true,
    name: 'Loki'
  },
  opponent: {
    id: 2,
    hero: 'Malfurion Stormrage',
    heroId: 'HERO_06',
    class: 'Druid',
    name: 'The Innkeeper'
  },
  turn: 1,
  playerId: 1,
  state: 'RUNNING',
  start: 'Sun Apr 24 2016 09:09:24 GMT-0400 (EDT)'
}
```

See `game-complete` event documentation below for more details about the `game` object.

### **game-complete**

The `game-complete` event fires at the end of a match and includes additional data showing who won and who lost.

Callback Arguments:

- **game** - the same game object from the `game-start` event with additional, final results.

Example game object at the end of the game:

```javascript
{
  player: {
    drew: {
      GVG_110: { name: 'Dr. Boom', count: 1 },
      EX1_308: { name: 'Soulfire', count: 2 },
      EX1_249: { name: 'Baron Geddon', count: 1 },
      GAME_005: { name: 'The Coin', count: 1 }
    },
    id: 1,
    hero: 'Gul\'dan',
    heroId: 'HERO_07',
    class: 'Warlock',
    coin: true,
    name: 'Loki',
    result: 'LOST',
    conceded: true,
    opponent: {
      EX1_308: { name: 'Soulfire', count: 1 }
    },
    discarded: {
      EX1_249: { name: 'Baron Geddon', count: 1 }
    }
  },
  opponent: {
    id: 2,
    hero: 'Malfurion Stormrage',
    heroId: 'HERO_06',
    class: 'Druid',
    name: 'The Innkeeper',
    played: {
      CS1_042: { name: 'Goldshire Footman', count: 1 }
    },
    result: 'WON'
  },
  turn: 3,
  playerId: 1,
  state: 'COMPLETE',
  start: 'Sun Apr 24 2016 09:09:24 GMT-0400 (EDT)',
  end: 'Sun Apr 24 2016 09:12:31 GMT-0400 (EDT)'
}
```

The `player` and `opponent` properties each have `played` and `discarded` properties that shows all cards each player played or discarded throughout the entire game. The `player` property also has a `drew` property that shows all of the cards the user drew throughout the game.

This log watcher includes card names as they are written in the user's Hearthstone logs. If your application needs to be able to translate card names across locales, use the [Hearthstone JSON files](https://hearthstonejson.com/) to look up the localized names of cards by their ID.

### **draw-card**

The `draw-card` event fires whenever a player draws a card.

Callback Arguments:

- **player** - object representing the player that drew the card
- **cardId** - Hearthstone card ID as found in the [Hearthstone JSON files](https://hearthstonejson.com/)
- **cardName** - the localized name of the card as it appears in the user's log files
- **game** - Object representing the current state of the game

```javascript
reader.on('draw-card', function(player, cardId, cardName) {
  console.log('Player', player.name, 'drew', cardName, '(' + cardId + ')');
});
```

### **mulligan-card**

The `mulligan-card` event fires whenever a player mulligans a card.

Callback Arguments:

- **player** - object representing the player that mulliganed the card
- **cardId** - Hearthstone card ID as found in the [Hearthstone JSON files](https://hearthstonejson.com/)
- **cardName** - the localized name of the card as it appears in the user's log files
- **game** - Object representing the current state of the game

Example:

```javascript
reader.on('mulligan-card', function(player, cardId, cardName) {
  console.log('Player', player.name, 'mulliganed', cardName, '(' + cardId + ')');
});
```

Sample output:

> Player 1 mulliganed Dr. Boom (GVG_110)

Sample output:

> Player 1 drew Dr. Boom (GVG_110)

### **play-card**

The `play-card` event fires whenever a player plays a card.

Callback Arguments:

- **player** - object representing the player that played the card
- **cardId** - Hearthstone card ID as found in the [Hearthstone JSON files](https://hearthstonejson.com/)
- **cardName** - the localized name of the card as it appears in the user's log files
- **game** - Object representing the current state of the game

Example:

```javascript
reader.on('play-card', function(player, cardId, cardName) {
  console.log('Player', player.name, 'played', cardName, '(' + cardId + ')');
});
```

Sample output:

> Player 1 played Dr. Boom (GVG_110)

### **discard-card**

The `discard-card` event fires whenever a player discards a card.

Callback Arguments:

- **player** - object representing the player that discarded the card
- **cardId** - Hearthstone card ID as found in the [Hearthstone JSON files](https://hearthstonejson.com/)
- **cardName** - the localized name of the card as it appears in the user's log files
- **game** - Object representing the current state of the game

Example:

```javascript
reader.on('discard-card', function(player, cardId, cardName) {
  console.log('Player', player.name, 'discarded', cardName, '(' + cardId + ')');
});
```

Sample output:

> Player 1 discarded Dr. Boom (GVG_110)

### **create-card**

The `create-card` event fires whenever a player gains a card that was not drawn from their deck such as when using the discover mechanic or cards like [Thoughtsteal](http://hearthstone.gamepedia.com/Thoughtsteal).

Callback Arguments:

- **player** - object representing the player that created the card
- **cardId** - Hearthstone card ID as found in the [Hearthstone JSON files](https://hearthstonejson.com/)
- **cardName** - the localized name of the card as it appears in the user's log files
- **game** - Object representing the current state of the game

Example:

```javascript
reader.on('create-card', function(player, cardId, cardName) {
  console.log('Player', player.name, 'created', cardName, '(' + cardId + ')');
});
```

Sample output:

> Player 1 created Dr. Boom (GVG_110)

### **zone-change**

The `zone-change` event fires whenever a game entity moves from one zone to another. Most entities are cards, but heroes and hero powers are also considered game entities and will show up in these events as well. I'm working on a way to filter those out, but they don't cause any problems currently other than just being useless data most of the time.

Hearthstone has 8 zones (that I'm aware of):

- DECK
- HAND
- PLAY
- PLAY (Hero)
- PLAY (Hero Power)
- PLAY (Weapon)
- SECRET
- GRAVEYARD

The "PLAY (Hero)" and "PLAY (Hero Power)" zones are pretty useless to us because the heroes and hero powers go into their respective play zones at the beginning of the game and don't usually go to the GRAVEYARD zone until the game is over. There is one exception that I'm aware of and that is Jaraxxus. Jaraxxus sends the Gul'dan hero and the Life Tap hero power to the GRAVEYARD zone when he is played, and then the Jaraxxus entity himself and his INFERNO! hero power enter the respective play zones.

The other zones are pretty straightforward. Cards in your deck are in the DECK zone. Cards in your hand are in the HAND zone. Minions on the board are in the PLAY zone. Secrets and weapons are in the SECRET and PLAY (Weapon) zones respectively. When writing a deck tracker UI it usually makes the most sense to consider PLAY, SECRET, and PLAY (Weapon) as a single zone; that way you can show visually whether a card is in your deck, your hand, in play, or destroyed.

The `zone-change` event receives an object as an argument with data that describes the event. It contains the card name, the card ID, the entity ID for that match, the team and zone the card came from, and the team and zone the card is moving to.

Example zone change data object:

```javascript
{
  cardName: 'Knife Juggler',
  cardId: 'NEW1_019',
  entityId: 37,
  fromTeam: 'OPPOSING',
  fromZone: 'PLAY',
  toTeam: 'OPPOSING',
  toZone: 'GRAVEYARD'
}
```

Don't be confused by the `entityId` field. The ID is not consistent across games. Rather, the entity ID is an identifier that is assigned to that specific card for the duration of just that match. It is what you need in order to track a card's status as the game progresses. For example, if you have two Knife Jugglers in your deck, you need to be able to tell which one is which. The entity ID is the only way to track changes to a specific card during that game. The `cardId` field never changes however, and you may use it to look up card data in a card database such as the one found at [HearthstoneJSON.com](http://hearthstonejson.com).

## Testing

Tests need to be updated for this fork. Coming soon.

## Planned

There are a lot more events in the Hearthstone log that could theoretically be pulled out like using hero powers, attaching with minions, target spells, etc. Will add more event parsing as possible.

## Frequently Asked Questions

#### Q. How do I see all the cards in my deck?

A. This module doesn't provide any functionality like that. This is just a log watcher that emits events that describe what it sees happening in the log. If you're building a deck tracker, you'll want to provide some kind of *deck builder* where users can fill out their deck beforehand. One helpful tool for this is [HearthstoneJSON.com](http://hearthstonejson.com/) where you can get a JSON blob of all the Hearthstone card data. You could use that JSON data to do a card name autocomplete input, making it super easy for users to build their deck in your tool.

#### Q. Did you build a deck tracker that uses your own log watcher module?

From the original authors before this fork:

> A. Why yes I did! You can find my Hearthpal Tracker [here](http://github.com/hearthpal/hearthpal-tracker).

#### Q. Why do some events seem to happen out of order?

A. This is not the fault of the log watcher. Hearthstone performs many things asynchronously even though the game appears to be very synchronous where things happen in a certain order. Unfortunately, Hearthstone does not always write to its own log file in the order in which things actually happened. For example, you may receive a game over event seconds before a card transition event, even if the transition occurred before the game ended. It's usually not a big deal but it's something to be aware of.
