const EventEmitter = require('events');

const uuid = require('uuid/v4');

const Log = require('./log');
const Constants = require('./constants');
const UsersMap = require('./usersMap');
const User = require('./user');
const { ObservableObject } = require('./observables');

class Game extends EventEmitter {
  constructor(socketServer, state){
		super();

		this.id = uuid();
		this.user = User;
		this.users = {};
    this.state = new ObservableObject(Object.assign({}, state));

    this.state.on('change', (event, property, value) => {
			Log(1)('(game) Game state change - ', event, property, value, this.state);

			this.broadcast('gameState', { [property]: value });
		});

		socketServer.on(Constants.USER_DISCONNECT, (id) => {
			if(this.users[id]) return;

			delete this.users[id];

			this.userIds = Object.keys(this.users);
			this.state.userCount = this.userIds.length;
		});

		socketServer.on(Constants.USER_JOIN_GAME, ({ userId, gameId }, socket) => {
			if(this.id !== gameId) return;

			let user;

			// Join existing game if still active
			if(this.id === gameId) Log.info()('Users game is still active');

			if(userId && UsersMap[userId]){
				user = UsersMap[userId];
				user.socket = socket;
				user.socket.id = userId;
			}

			else user = new this.user(socketServer, socket, this);

			this.users[user.id] = 1;
			this.userIds = Object.keys(this.users);
			this.state.userCount = this.userIds.length;

			this.emit(Constants.USER_JOIN_GAME, user.id);

			socket.reply(Constants.USER_STATE_UPDATE, { id: user.id });
			socket.reply(Constants.USER_STATE_UPDATE, user.state);

			socket.reply(Constants.GAME_STATE_UPDATE, this.state);

			Log.info()(`User ${user.id} joined Game ${this.id}`);

			socket.on('message', (data) => {//...args) => {
				// this.emit.apply(this, 'message', ...args);

				try{ data = JSON.parse(data); }

				catch(e){
					Log.error()(data);

					throw e;
				}

				const { type, payload } = data;

				this.emit(type, payload, socket);
			});
		});
	}

	broadcast(type, payload){
		var userIds = this.userIds;
		var userCount = this.state.userCount;

		if(!userCount) return Log.warn(1)('No users to broadcast to');

		Log.warn()(`(game) Websocket broadcast: `, type, payload);

		for(var x = 0; x < userCount; ++x){
			UsersMap[userIds[x]].socket.reply(type, payload);
		}
	}
}

module.exports = Game;