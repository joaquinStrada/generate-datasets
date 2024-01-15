import '@babel/polyfill'
import app from './app'
import http from 'http'
import { Server as SocketServer } from 'socket.io'
import { config } from './lib/config'
import { socketServer } from './socket'
import { createConnection } from './lib/database'
import initializing from './lib/initializing'

createConnection()
initializing()
const server = http.createServer(app)
const io = new SocketServer(server, {
	cors: config.cors
})
socketServer(io)

server.listen(app.get('port'), () => {
	console.log('Server on port', app.get('port'))
})