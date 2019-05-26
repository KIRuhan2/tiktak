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
    constructor(id, role,name){
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
    socket.on('JOIN_GAME', game_id=>{
        socket.join(game_id)
        const gameToJoin = games.find(x=>x.game.id===game_id)
        if(!gameToJoin){
            socket.emit('WRONG_ID_404')
            return
        }
        socket.join(gameToJoin[game_id])
        let joinedUser
        if(gameToJoin.users.filter(user=>user.role==='player').length < 2){
            joinedUser = new User(socket.id, 'player')
        }else{
            joinedUser = new User(socket.id, 'spectator')
        }
        gameToJoin.users.push(joinedUser)
        socket.emit('JOINED', gameToJoin.users)
        socket.to(game_id).emit('USER_JOIN', joinedUser)

        socket.on('disconnect', ()=>{
            gameToJoin.users.find(x=>x.id === joinedUser.id).disconencted()
            socket.to(game_id).emit('USER_DISCONNECTED', joinedUser)
        })

    })
    socket.on('CREATE_GAME', data=>{
        games.push({game:new Game(data), users:[] })
    })
    console.log(socket.id.slice(0,5)+'... '+'connected')
})