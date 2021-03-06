<template>
  <div class="container">
    <SideSettings @reset="resetGame(true)" />
    <div class="highText">
      <div class="winStatus">
        <span v-if="highText">{{highText}}</span> <span :class="winnerClass !== '' ? (winnerClass+' cell') :'' "></span>
      </div>
        <div v-if="restartButton" @click="resetGame(true)" class="restart">Reset</div>
    </div>
    <div ref="main" class = "main">
      <div class="status">
        <p>Waiting for another player: </p>
        <p>Очередность: {{userOrder}}</p>
        <p>Players: <span style="color:green">{{players.length}}</span></p>
        <ul style="padding-left:70px;">
          <li v-for="(player, index) in players" :key="index">
            <span :style="{color:userColor(player.status)}">{{player.name || 'No Name'}}: {{player.id.slice(0,5)+'...'}}</span>
          </li>
        </ul>
        <p>Spectators: <span style="color:red">{{spectators.length}}</span></p>
        <ul style="padding-left:70px;">
          <li v-for="(spectator, index) in spectators" :key="index">
            <span :style="{color:userColor(spectator.status)}">{{spectator.name || 'No Name'}}: {{spectator.id.slice(0,5)+'...'}}</span>
          </li>
        </ul>
        <p>Link to share: {{origin}}/{{$route.params.id}}</p>
      </div>
      <Field :style="{float: fieldOverflow || 'none'}" ref = "field" :socket="socket" :gameOn="gameOn" :options="fieldSettings" @GameEnd="gameEnd" />
    </div>
  </div>
</template>

<script>
import Field from '@/components/Field.vue'
import SideSettings from '@/components/SideSettings.vue'
import io from 'socket.io-client'
import { EventBus } from '@/main.js'

export default {
  name: 'Game',
  components: {
    Field,
    SideSettings
  },
  data: function () {
    return {
      socket: io('localhost:3001'),
      gameID: 0,
      gameOn: false, 
      users: [],
      userOrder: undefined,
      userRole: undefined,
      error: {
        isError: false,
        desc: ''
      },
      fieldSettings: {
        cellSize: 100,
        winRow: 3,
        turnToPlay: false,
        turn: 2,
        matrixSize: 3,
        solo: false,
        disabled: false,
        matrix: []
      },
      window: {
        width: 0,
        height: 0
      },
      highText: '',
      winnerClass: '',
      predictMatrixSize: 0,
      predictWinCondition: 0,
      restartButton: false,
      fieldOverflow: false
    }
  },
  mounted () {
    console.log('Game')
    this.gameId = this.$route.params.id
    if (this.gameId === 'solo') {
      this.fieldOverflowHandle.solo = true
      this.gameOn = true
    }
    this.window.width = window.innerWidth
    this.window.height = window.innerHeight - 25
    this.window.href = window.location.origin
    this.predictMatrixSize = this.fieldSettings.matrixSize
    this.predictWinCondition = this.fieldSettings.winRow
    this.fieldSettings.cellSize = this.defaultCellSize()
    window.addEventListener('resize', this.resizeHandler)

    if (this.id) {
      this.joinGame()
    } else {
      EventBus.$on('Logined', this.joinGame)
    }
    this.socket.on('GAME_RESTARTED', data=>{
      this.resetGame()
    })

    this.socket.on('ERROR', errorDesc => {
      if (errorDesc === '404' && this.$route.params.id === 'solo') return
      this.error.isError = true
      this.error.desc = errorDesc
    })
    this.socket.on('JOINED', gameData => {
      this.$nextTick(()=>{
        this.userOrder = gameData.joinedUser.orderOf
        this.fieldSettings.turn = gameData.turn
        this.fieldSettings.turnToPlay = gameData.joinedUser.firstTurn
        if(gameData.playerToTurn === this.id){
          this.fieldSettings.turnToPlay = true
        }
        console.log(gameData)
        this.error.isError = false
        console.log(gameData.matrix)
        gameData.matrix.forEach((row,i)=>{
          row.forEach((cell,j)=>{
            this.$refs.field.matrix[i].splice(j, 1, cell)
          })
        })
        this.users = [...gameData.users]
        if(this.users.length >=2){
          this.gameOn = true
        }
        this.userRole = gameData.joinedUser.role
        this.$store.commit('setGameId', gameData.gameId)
      })

    })
    this.socket.on('USER_DISCONNECTED', user => {
      this.users.find(x => x.id === user.id).status = 'disconnected'
    })
    this.socket.on('USER_RETURNED', user => {
      console.log('Someone is back')
      this.users.find(x => x.id === user.id).status = 'online'
    })
    this.socket.on('USER_JOIN', user => {
      console.log('Someone Joined')
      this.users.push(user)
      if(this.users.length >= 2){
        this.gameOn = true
      }      
    })
    this.socket.on('TURN', data=>{
      this.$nextTick(()=>{
        if(data.nextPlayer === this.id){
          this.fieldSettings.turnToPlay = true
          this.$refs.field.makeTurn(data.position[0], data.position[1], true)
        }else{
          this.fieldSettings.turnToPlay = false     
        }
        this.fieldSettings.turn = this.fieldSettings.turn === 1 ? 2 : 1
        // }
      })

    })
  },
  computed: {
    origin () {
      return window.location.origin
    },
    players () {
      return this.users.filter(x => x.role === 'player')
    },
    spectators () {
      return this.users.filter(x => x.role === 'spectator')
    },
    name () {
      return this.$store.state.name
    },
    id () {
      return this.$store.state.id
    },
    settings () {
      return this.$store.state.settings
    },
    // gameOn (){
    //   return  this.users.length >= 2
    // }

  },

  methods: {
    joinGame () {
      this.socket.emit('JOIN_GAME', {
        gameId: this.gameId,
        hostId: this.id,
        hostName: this.name
      })
    },
    userColor (status) {
      return status === 'disconnected' ? 'red' : 'black'
    },
    fieldOverflowHandle () {
      if (this.$refs.main) {
        return this.$refs.main.innerWidth > window.width ? 'left' : 'none'
      } else {
        return 'none'
      }
    },
    defaultCellSize () {
      let maxWithWidth = this.window.width / this.fieldSettings.matrixSize - 10
      let maxWithHeight = (this.window.height - 140) / (this.fieldSettings.matrixSize + 1)
      maxWithWidth = maxWithWidth > 100 ? 100 : maxWithWidth < 20 ? 20 : maxWithWidth
      return Math.floor(Math.min(maxWithHeight, maxWithWidth))
    },
    resizeHandler () {
      this.window.width = window.innerWidth
      this.window.height = window.innerHeight - 25
    },

    resetGame (send) {
      this.highText = ''
      this.winnerClass = ''
      this.fieldSettings.disabled = false
      this.restartButton = false
      let predictMatrixSize = this.settings.field.matrixSize
      let predictWinCondition = this.settings.field.winCondition
      if (predictMatrixSize && predictMatrixSize <= 20 && predictMatrixSize >= 3) {
        this.fieldSettings.matrixSize = predictMatrixSize
      }
      if (predictWinCondition >= 3 && predictWinCondition <= 10) {
        this.fieldSettings.winRow = predictWinCondition
      }
      this.fieldSettings.cellSize = this.defaultCellSize()
      this.$refs.field.restartGame(send)
    },
    gameEnd (winner) {
      this.highText = winner === false ? 'Draw!' : 'Win!'
      this.winnerClass = ['', 'x', 'o'][winner || 0]
      this.fieldSettings.disabled = true
      this.restartButton = true
    }
  }
}
</script>

<style scoped>
 body{
   margin: 0;
 }
#app{
  font-size: 45px;
}

.sidepanel__content{
  overflow: hidden;
}

button{
  background-color: transparent;
  display: block;
}

 .restart:focus{
  outline: none;
}

.restart{
  width: 4em;
  height: 2em;
  cursor: pointer;
  margin: 0 auto;
  font-size: 20px;
  background-color: none;
  box-sizing: unset;
  border: 2px solid #000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.highText{
  height: 140px;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  display: flex;
}

.winStatus{
  height: 100px;
  font-size: 48px;
  align-items: center;
  display: flex;
}

.field{
  padding: 5px;
  margin-top: 20px;
}

.status{
  padding-left: 10px;
  font-size: 48px;
}

.cellSizeValue:focus{
  outline: none
}
.cellSizeValue:focus::-webkit-slider-thumb{
  background: red;
}
.cellSizeValue{
  appearance: none;
  width: 100%;
  height: 10px;
  background: #d3d3d3;
  border-radius: 10px;
  opacity: 0.7;
  transition: opacity .2s;
}

.cellSizeValue::-webkit-slider-thumb{
  appearance: none;
  width: 25px;
  height: 25px;
  background: #000;
  border-radius: 50%;
}

.cellSizeValue::-webkit-range-thumb {
  width: 25px; /* Set a specific slider handle width */
  height: 15px; /* Slider handle height */
  background: #000; /* Green background */
  cursor: pointer; /* Cursor on hover */
}

.cell{
  position: relative;
  margin-left: 15px;
  outline: none;
  background-color: transparent;
}

</style>
