const { ObservableObject } = require('./observables');
const Log = require('./log');

module.exports = class Game {
  constructor(socketServer){
    this.state = new ObservableObject({
      id: String(Math.random()).slice(2),
      users: {}
    });

    this.state.on('change', (event, property, value) => {
			Log()('Game state change - ', event, property, value, this.state);

			socketServer.broadcast({ type: 'gameState', state: { [property]: value } });
    });
  }
};