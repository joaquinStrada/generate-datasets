let socketIO = null

export const socketServer = io => {
	socketIO = io
    
	io.on('connection', socket => {
		console.log('Nuevo cliente conectado:', socket.id)
	})
}

export const sendMessage = (channel, message) => socketIO.emit(channel, message)