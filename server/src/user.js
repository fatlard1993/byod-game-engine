//trigger events on: incoming connections, player joining, player leaving

const { ObservableObject } = require('./observables');
const uuid = require('uuid/v4');
const UsersMap = require('./usersMap');
const Log = require('./log');
const Constants = require('./constants');
const EventEmitter = require('events');

class User extends EventEmitter {
  constructor(socketServer, socket){
		super();

    this.state.on('change', (event, property, value) => {
			Log()('User state change - ', property, value);

      socket.reply('userState', { [property]: value });
		});

		socketServer.on(Constants.USER_STATE, ({ id }, state) => {
			if(this.id === id) Object.assign(this.state, state);
		});

		this.id = uuid();
		this.socket = socket;
		this.socket.id = this.id;

    this.state = new ObservableObject({
			name: `nameless #${this.id}`
		});

    UsersMap[this.id] = this;

		Log(1)('New user state:', this.state);
	}

	kill(){
		delete UsersMap[this.id];
	}
}

module.exports = User;