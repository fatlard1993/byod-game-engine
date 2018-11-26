//trigger events on: incoming connections, player joining, player leaving

const { ObservableObject } = require('./observables');
const uuid = require('uuid/v4');
const UsersMap = require('./usersMap');
const Log = require('./log');
const Constants = require('./constants');
const EventEmitter = require('events');

module.exports = class User extends EventEmitter {
  constructor(socketServer, socket){
		super();

		this.socket = socket;
		this.id = uuid();

    this.state = new ObservableObject({
			name: `nameless #${this.id}`
		});

		Log(1)('New user state:', this.state);

    this.state.on('change', (event, property, value) => {
			Log()('User state change - ', property, value);

      socket.emit({ type: 'userState', state: { [property]: value } });
		});

		socketServer.on(Constants.USER_STATE, ({ id }, state) => {
			if(this.id === id) Object.assign(this.state, state);
		});

    UsersMap[this.id] = this;
	}

	kill(){
		delete UsersMap[this.id];
	}
};