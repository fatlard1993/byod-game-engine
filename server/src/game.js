const EventEmitter = require('events');

const WebSocket = require('ws');
const uuid = require('uuid/v4');

const Log = require('./log');
const Constants = require('./constants');
const { ObservableObject } = require('./observables');

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

		socketServer.on('connection', (clientSocket) => {
			clientSocket.reply = (type, payload) => {
				var message = JSON.stringify({ type, payload });

				Log.warn()('Send to client socket: ', message);

				if(clientSocket.readyState === WebSocket.OPEN) clientSocket.send(message);
				else Log.error()('Client not connected');
			};

			clientSocket.on('message', (data) => {
				try{ data = JSON.parse(data); }

				catch(e){
					Log.error()(data);

					throw e;
				}

				Log()('Client socket message: ', data.type, data.payload);

				this.emit(data.type, clientSocket, data.payload);
			});

			clientSocket.on('close', () => {
				Log.warn()('Client socket disconnect: ');

				this.emit(Constants.USER_DISCONNECT, clientSocket);
			});
		});
  }
};