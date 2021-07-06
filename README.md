# byod-game-engine

```
Game (rootFolder, port, homePath = '/lobby') {
	id: nanoid(7),
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
