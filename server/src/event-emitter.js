class EventEmitter {
  constructor(){
    this.handlers = {};
  }
}

EventEmitter.prototype.on = function(name, handler){
  if(!this.handlers[name]) this.handlers[name] = new Map();

	this.handlers[name].set(handler, handler);
};

EventEmitter.prototype.off = function(name, handler){
	const handlers = this.handlers[name];

  if(handlers) handlers.delete(handler);
};

EventEmitter.prototype.emit = function(name, ...args){
	const handlers = this.handlers[name];

  if(handlers) handlers.forEach(handler => handler(...args));
};

module.exports = EventEmitter;