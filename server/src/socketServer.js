const WebSocket = require('ws');
const Url = require('url');
const Log = require('./log');

module.exports = class SocketServer extends WebSocket.Server {
	constructor({ server, socketPath = '/api', ...settings }){
		super({ noServer: !!server, ...settings });

		if(!server) return Log.error()('socketServer requires a server!');

		server.on('upgrade', (request, socket, head) => {
			const pathname = Url.parse(request.url).pathname;

			if(pathname === socketPath){
				this.handleUpgrade(request, socket, head, ws => {
					this.emit('connection', ws, request);
				});
			}

			else socket.destroy();
		});

		this.on('connection', (clientConnection) => {
			clientConnection.on('message', (data) => {
				try{ data = JSON.parse(data); }
				catch(e){ data = { type: data }; }

				if(data.type === 'knock') this.emit('userConnection', clientConnection, data.user);
			});
		});
	}

	broadcast(data){
		data = JSON.stringify(data);

		Log.warn()(`Websocket broadcast: ${data}`);

		this.clients.forEach(function eachClient(client){
			if(client.readyState === WebSocket.OPEN) client.send(data);
		});
	}
};