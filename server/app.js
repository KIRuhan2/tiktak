const express = require('express')
const app = express()


const server = app.listen(process.env.PORT || 3001, ()=>{
    console.log('Server works on localhost:3001')
})
const io = require('socket.io')(server)

class Game{
    constructor(data){
        this.matrix = Game.makeMatrix(data.fieldSize || 3)
        this.winCondition = data.winCondition
        this.crossLine = { line: [], direction: '' }
        this.turn = 2
        this.playerToTurn = ''
        this.id = data.gameId
        this.hostId = data.hostId
        this.hostName = data.hostName
        this.players = []
    }

    static makeMatrix(size) {
      return  Array(+size || 3).fill(null).map(() => Array(+size || 3).fill(0))   
    }

    cellStatus(i, j){
      return ['', 'x', 'o'][this.matrix[i][j]]
    }

    winStatus (i, j, n = this.options ? this.options.winRow : 3) {
        let win = {
          status: [ [], [], [], [] ],
          indexes: [ [], [], [], [] ]
        }
        const mfind = (matrix, i, j) => ((matrix[i] && matrix[i][j]) ? matrix[i][j] : -1) // Avoid undefined and 0 values
        if (mfind(this.matrix, i, j) === -1) return false
  
        const cell = mfind(this.matrix, i, j)
        const cellReg = new RegExp(Array(n).fill(cell).join(''))
        const arr = Array.from({ length: n * 2 - 1 })
  
        arr.forEach((x, index) => { win.indexes[0].push([i + (n - 1) - index, j - (n - 1) + index]) }) // diagonal 1
        arr.forEach((x, index) => { win.indexes[1].push([i - (n - 1) + index, j - (n - 1) + index]) }) // diagonal 2
        arr.forEach((x, index) => { win.indexes[2].push([i, j - (n - 1) + index]) }) // row
        arr.forEach((x, index) => { win.indexes[3].push([i - (n - 1) + index, j]) }) // column
  
        win.status[0] =
          arr.map((x, index) => mfind(this.matrix, i + (n - 1) - index, j - (n - 1) + index)).join('').replace(/-1/g, 'f') // diagonal 1
        win.status[1] =
          arr.map((x, index) => mfind(this.matrix, i - (n - 1) + index, j - (n - 1) + index)).join('').replace(/-1/g, 'f') // diagonal 2
  
        win.status[2] =
          arr.map((x, index) => mfind(this.matrix, i, j - (n - 1) + index)).join('').replace(/-1/g, 'f') // row
  
        win.status[3] =
          arr.map((x, index) => mfind(this.matrix, i - (n - 1) + index, j)).join('').replace(/-1/g, 'f') // column
  
        win.status.forEach((e, i) => {
          if (e.match(cellReg)) {
            this.crossLine.line = win.indexes[i].slice(e.match(cellReg).index, e.match(cellReg).index + n)
            this.crossLine.direction = ['diagonalRight', 'diagonalLeft', 'row', 'column'][i]
          }
        })
        return Object.values(win.status).find(x => x.match(cellReg)) ? cell : false
      }    
    restart(){
      this.matrix = Game.makeMatrix(this.options ? this.options.matrixSize : 3)
      this.crossLine = { line: [], direction: '' }
      this.turn = 2
      io.to(this.id).emit('GAME_RESTARTED')

    }
    makeTurn (playerId, i, j) {
        if(playerId !== this.playerToTurn) return
        const flat = (arr, depth = Infinity, arr2 = []) => {
          arr.forEach(e => {
            typeof e === 'object' && depth ? flat(e, depth - 1, arr2) : arr2.push(e);
          });
          return arr2;
        };
        this.matrix[i].splice(j, 1, this.turn)
            

        let playersIndex = this.players.findIndex(player=> player.id === this.playerToTurn)
        playersIndex = playersIndex === this.players.length-1 ? -1 : playersIndex
        this.playerToTurn = this.players[playersIndex+1].id
        io.to(this.id).emit('TURN', {
          matrix: this.matrix,
          position: [i,j],
          nextPlayer: this.playerToTurn ,
          side: this.turn,
        })       
        this.turn = this.turn === 1 ? 2 : 1             
        let winner = this.winStatus(i, j)
        if (winner || flat(this.matrix).every(x => (x === 1 || x === 2))) {
          io.to(this.id).emit('GAME_END', winner)
        }
    }    
}

class User{
    constructor(id, name, role, orderOf){
        this.name = name
        this.id = id
        this.status = 'online'
        this.role = role
        this.orderOf = orderOf
        this.firstTurn = false
    }
    disconencted(){
        this.status = 'disconnected'
    }
    reconnected(){
        this.status = 'online'
    }
}

let rooms = []

io.on('connection', socket=>{
    socket.on('JOIN_GAME', connectionData=>{
        socket.join(connectionData.gameId)
        const currentRoom = rooms.find(room=>room.game.id === connectionData.gameId)
        if(!currentRoom){
            socket.emit('ERROR', '404')
            return
        }
        socket.join(currentRoom[connectionData.gameId])
        let joinedUserA
        let players = currentRoom.users.filter(user=>user.role === 'player')
        if(players.length < 2){
            joinedUser = new User(connectionData.hostId, connectionData.hostName, 'player', players.length)
            if(currentRoom.game.playerToTurn === ''){
              currentRoom.game.playerToTurn = joinedUser.id
              joinedUser.firstTurn = true
            }
        }else{
            joinedUser = new User(connectionData.hostId, connectionData.hostName, 'spectator', players.length)
        }
        
        if(!currentRoom.users.find(x=>x.id === joinedUser.id)){
            currentRoom.users.push(joinedUser)
            if (joinedUser.role === 'player'){
              currentRoom.game.players.push(joinedUser)
            }

            socket.to(connectionData.gameId).emit('USER_JOIN', joinedUser)
        }else{
            socket.to(connectionData.gameId).emit('USER_RETURNED', joinedUser)
            currentRoom.users.find(x=>x.id === joinedUser.id).status = 'online'
        }
        socket.emit('JOINED', {
            users: currentRoom.users,
            matrix: currentRoom.game.matrix,
            gameId: connectionData.gameId,
            playerToTurn: currentRoom.game.playerToTurn,
            turn: currentRoom.game.turn, 
            joinedUser,
        })
        socket.on('disconnect', ()=>{
            currentRoom.users.find(x=>x.id === joinedUser.id).status = 'disconnected'
            // if(currentRoom.game.playerToTurn === joinedUser.id){
            //   currentRoom.game.playerToTurn = ''
            // }
            socket.to(connectionData.gameId).emit('USER_DISCONNECTED', joinedUser)
        })
    })

    socket.on('CREATE_GAME', gameData=>{
        rooms.push({game:new Game(gameData), users:[], room : gameData.gameId})
    })
    socket.on('GET_LIST', ()=>{
        socket.emit('LIST', rooms.map(x=>x.game))
    })
    socket.on('MAKE_TURN', turnData =>{
        let currentRoom = rooms.find(room => turnData.gameId === room.game.id)
        currentRoom.game.makeTurn(turnData.playerId , turnData.cell[0], turnData.cell[1])
    })
    socket.on('RESTART_GAME', gameId=>{
      let currentRoom = rooms.find(room => gameId === room.game.id)
      try{
        currentRoom.game.restart()
      }catch(error){
        console.log(error)
      }
    })
})