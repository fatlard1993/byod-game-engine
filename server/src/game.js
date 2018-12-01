const EventEmitter = require('events');

const uuid = require('uuid/v4');

const Log = require('./log');
const Constants = require('./constants');
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

		socketServer.on('clientConnection', (socket) => {
			socket.on('message', (data) => {
				try{ data = JSON.parse(data); }

				catch(e){
					Log.error()(data);

					throw e;
				}

				Log()('Client socket message: ', data.type, data.payload);

				this.emit(data.type, socket, data.payload);
			});

			socket.on('close', () => {
				Log.warn()('Client socket disconnect: ');

				this.emit(Constants.USER_DISCONNECT, socket);
			});
		});
  }
}

module.exports = Game;