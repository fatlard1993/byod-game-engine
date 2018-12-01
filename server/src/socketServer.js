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
				try{ data = JSON.parse(data); }

				catch(e){
					Log.error()(data);

					throw e;
				}

				this.emit('clientMessage', socket, data);
			});

			socket.on('close', () => {
				Log.warn()('Client socket disconnect: ', socket.id);

				this.emit(Constants.USER_DISCONNECT, socket);
			});

			// this.emit('clientConnection', socket);
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