//trigger events on: incoming connections, player joining, player leaving

// clientConnection.on('message', user.onSocketMessage);

// clientConnection.send('Welcome aboard, heres something good to eat');

const { ObservableObject } = require('./observables');
const Log = require('./log');

module.exports = class User {
  constructor(socketServer, clientConnection){
		var id = String(Math.random()).slice(2);

    this.state = new ObservableObject({
      id: id,
			name: `nameless #${id.slice(0, 2)}`,
			socket: clientConnection
		});

		Log(1)('New user state:', this.state);

    this.state.on('change', (event, property, value) => {
			Log()('User state change - ', event, property, value);

      socketServer.broadcast({ type: 'userState', state: { [property]: value } });
		});

		clientConnection.on('message', this.onSocketMessage.bind(this));
	}

	onSocketMessage(data){
		Log()(`${this.state.name} sent: ${data}`);//data = '{ type: 'updateState', state: { name: "bonbon", race: "fairy" }  }'

		try{ data = JSON.parse(data); }
		catch(e){ data = { type: data }; }

		if(data.type === 'updateState') this.state = Object.assign(this.state, data.state);

		else Log()('unknown command');
	}
};