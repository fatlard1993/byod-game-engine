const WebSocket = require('ws');
const Url = require('url');
const Log = require('./log');
const Constants = require('./constants');

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

		this.on('connection', (socket) => {
			socket.reply = (type, payload) => {
				var message = JSON.stringify({ type, payload });

				Log.warn()('Send to client socket: ', message);

				if(socket.readyState === WebSocket.OPEN) socket.send(message);
				else Log.error()('Client not connected');
			};

			socket.on('message', (data) => {
				Log()('(socketServer) Client socket message: ', data);

				try{ data = JSON.parse(data); }

				catch(e){
					Log.error()(data);

					throw e;
				}

				const { type, payload } = data;

				this.emit(type, payload, socket);
			});

			socket.on('close', () => {
				this.emit(Constants.USER_DISCONNECT, socket.id);
			});
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

	createEndpoint(name, getResponse){
		const handler = (payload) => {
			Log()('Endpoint handler: ', name, payload);

			var res = getResponse(payload);

			this.broadcast(name, res);

			// const promise = Promise.resolve();

			// promise.then(() => getResponse(payload));
			// // promise.then((data) => this.emit(name, data));
			// promise.catch((error) => Log.error()(error));
		};

		Log()('Applying handler: ', name);

		this.on(name, handler);

		return { destroy: () => this.removeListener(name, handler) };
	}
};