const WebSocket = require('ws');
const Url = require('url');
const Log = require('./log');
const Constants = require('./constants');
const User = require('./user');
const UsersMap = require('./usersMap');

module.exports = class SocketServer extends WebSocket.Server {
	constructor({ server, socketPath = '/api', ...settings }){
		super({ noServer: !!server, ...settings });

		if(!server) return Log.error()('socketServer requires a server!');

		server.on('upgrade', (request, socket, head) => {
			const pathname = Url.parse(request.url).pathname;

			if(pathname === socketPath){
				this.handleUpgrade(request, socket, head, (ws) => {
					this.emit('connection', ws, request);
				});
			}

			else socket.destroy();
		});

		this.on('connection', (clientSocket) => {
			clientSocket.reply = (type, payload) => {
				var message = JSON.stringify({ type, payload });

				Log.warn()('Send to client socket: ', message);

				clientSocket.send(message);
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

		this.on(Constants.USER_JOIN_GAME, (socket, userId) => {
			let user;

			if(userId && UsersMap[userId]){
				user = UsersMap[userId];
				user.socket = socket;
				user.id = userId;
				// Join existing game if still active
			}

			else{
				user = new User(this, socket);

				userId = user.id;

				UsersMap[userId] = user;
			}

			UsersMap[userId].socket.id = userId;

			socket.reply(Constants.USER_STATE_UPDATE, { id: userId });

			Log.info()(`User ${userId} joined`);

			socket.reply(Constants.USER_STATE_UPDATE, user.state);
		});
	}

	broadcast(type, payload){
		if(!this.clients.size) return Log.warn(1)('No clients to broadcast to');

		var message = JSON.stringify({ type, payload });

		Log.warn()(`Websocket broadcast: ${message}`);

		this.clients.forEach(function eachClient(client){
			if(client.readyState === WebSocket.OPEN) client.send(message);
		});
	}
};