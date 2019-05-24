const app = require('express')()
const server = app.listen(3001, function(){
    console.log('Server is running on localhost:3001')
})

const io = require('socket.io')(server)

io.on('connection', function(socket){
    console.log(socket.id)
})