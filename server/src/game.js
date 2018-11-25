const EventEmitter = require('events');

const uuid = require('uuid/v4');

const { ObservableObject } = require('./observables');
const Log = require('./log');

module.exports = class Game extends EventEmitter {
  constructor(socketServer){
		super();

    this.id = uuid();
    this.state = new ObservableObject({});
    this.users = {};

    this.state.on('change', (event, property, value) => {
			Log(1)('Game state change - ', event, property, value, this.state);

			socketServer.broadcast('gameState', { [property]: value });
    });
  }

};