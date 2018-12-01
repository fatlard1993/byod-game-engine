const EventEmitter = require('events');

const uuid = require('uuid/v4');

const Log = require('./log');
const UsersMap = require('./usersMap');
const { ObservableObject } = require('./observables');

class Game extends EventEmitter {
  constructor(socketServer, state){
		super();

    this.id = uuid();
    this.state = new ObservableObject(Object.assign({}, state));
    this.users = {};

    this.state.on('change', (event, property, value) => {
			Log(1)('(game) Game state change - ', event, property, value, this.state);

			socketServer.broadcast('gameState', { [property]: value });
		});

		// this.on(this.id, (socket, data) => {
		// 	this.emit(data.type, socket, data.payload);
		// });

		// socketServer.on('clientMessage', (socket, data) => {
		// 	Log()('Client socket message: ', data.type, data.payload);

		// 	this.emit(this.id, socket, data);
		// });

		socketServer.on('clientMessage', (socket, data) => {
			Log()('(game) Client socket message: ', data.type, data.payload);

			if(data.type === 'knock' && data.payload.gameId === this.id) this.emit(data.type, socket, data.payload);

			else if(!socket.id || !UsersMap[socket.id] || !UsersMap[socket.id].state || !UsersMap[socket.id].state.gameId) socket.reply('reconnect');

			else if(UsersMap[socket.id].state.gameId === this.id) this.emit(data.type, socket, data.payload);
		});
  }
}

module.exports = Game;