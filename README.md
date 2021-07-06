# byod-game-engine

```
Game ({ rootFolder, port, verbosity, homePath = '/lobby', ...options }') {
	id: nanoid(7),
	options,
	rooms: { GameRoom.id, ... },
	rootFolder,
	port,
	httpServer: HttpServer(port, rootFolder, homePath),
	sockets: WebsocketServer
}
```

```
GameRoom ({ name, ...options }) {
	id: nanoid(7),
	options,
	name,
	players: { GameRoom.id, ... },
	playerIds,
	state
}
```
