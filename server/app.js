const app = require('express')()
const server = app.listen(3001, ()=>{
    console.log('Server is running on localhost:3001')
})

const io = require('socket.io')(server)

class Game{
    constructor(data){
        this.matrix = Array(+data.fieldSize || 3).fill(null).map(() => Array(data.fieldSize || 3).fill(0))
        this.winCondition = data.winCondition
        this.turn = 2
        this.id = data.id
    }
}

class User{
    constructor(id, name, role){
        this.name = name
        this.id = id
        this.status = 'online'
        this.role = role
    }
    disconencted(){
        this.status = 'disconnected'
    }
    reconnected(){
        this.status = 'online'
    }
}

let games = []

io.on('connection', socket=>{
    socket.on('JOIN_GAME', connectionData=>{
        socket.join(connectionData.gameId)
        const gameToJoin = games.find(x=>x.game.id === connectionData.gameId)
        if(!gameToJoin){
            socket.emit('ERROR', '404')
            return
        }
        socket.join(gameToJoin[connectionData.gameId])
        let joinedUser
        if(gameToJoin.users.filter(user=>user.role === 'player').length < 2){
            joinedUser = new User(connectionData.id, connectionData.name, 'player')
        }else{
            joinedUser = new User(connectionData.id, connectionData.name, 'spectator')
        }
        if(!gameToJoin.users.find(x=>x.id === joinedUser.id)){
            gameToJoin.users.push(joinedUser)
            socket.to(connectionData.gameId).emit('USER_JOIN', joinedUser)
        }else{
            socket.to(connectionData.gameId).emit('USER_RETURNED', joinedUser)
            gameToJoin.users.find(x=>x.id === joinedUser.id).status = 'online'
        }
        socket.emit('JOINED', gameToJoin.users)
        socket.on('disconnect', ()=>{
            gameToJoin.users.find(x=>x.id === joinedUser.id).status = 'disconnected'
            socket.to(connectionData.gameId).emit('USER_DISCONNECTED', joinedUser)
        })

    })
    socket.on('CREATE_GAME', gameData=>{
        games.push({game:new Game(gameData), users:[] })
    })
    console.log(socket.id.slice(0,5)+'... '+'connected')
})