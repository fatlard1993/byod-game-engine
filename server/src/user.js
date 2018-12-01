//trigger events on: incoming connections, player joining, player leaving

const { ObservableObject } = require('./observables');
const uuid = require('uuid/v4');
const UsersMap = require('./usersMap');
const Log = require('./log');
const Constants = require('./constants');
const EventEmitter = require('events');

class User extends EventEmitter {
  constructor(socketServer, socket, game){
		super();

		this.id = uuid();
		this.socket = socket;
		this.socket.id = this.id;

    UsersMap[this.id] = this;

		Log(1)('New user state:', this.state);

		this.state = new ObservableObject({
			name: `nameless #${this.id}`,
			gameId: game.id
		});

    this.state.on('change', (event, property, value) => {
			Log()('User state change - ', property, value);

      socket.reply('userState', { [property]: value });
		});

		socketServer.on(Constants.USER_STATE, (state, socket) => {
			if(this.id === socket.id) Object.assign(this.state, state);
		});
	}

	kill(){
		delete UsersMap[this.id];
	}
}

module.exports = User;