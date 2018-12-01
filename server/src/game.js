const EventEmitter = require('events');

const uuid = require('uuid/v4');

const Log = require('./log');
const { ObservableObject } = require('./observables');

class Game extends EventEmitter {
  constructor(socketServer){
		super();

    this.id = uuid();
    this.state = new ObservableObject({});
    this.users = {};

    this.state.on('change', (event, property, value) => {
			Log(1)('Game state change - ', event, property, value, this.state);

			socketServer.broadcast('gameState', { [property]: value });
		});

		this.on(this.id, (socket, data) => {
			this.emit(data.type, socket, data.payload);
		});

		socketServer.on('clientMessage', (socket, data) => {
			Log()('Client socket message: ', data.type, data.payload);

			this.emit(this.id, socket, data);
		});
  }
}

module.exports = Game;