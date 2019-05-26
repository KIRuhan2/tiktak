<template>
  <div id="app">
    <div class="container">
      <button @click="settingsClick()" :class="['settings', settings.status ? 'settings_active': '']">
        <div class="settings__icon"
          :style="{
            transform:`translateX(${settings.rotate/1.5}px) rotate(${settings.rotate}deg`,
          }"
        ></div>
        <div class="settings__icon_x"
          :style="{
            transform:`translate(${settings.rotate/1.5}px)`
          }"
        ></div>
      </button>
      <div :class="['sidepanel', settings.status ? 'sidepanel_active' : '']">
        <div class="sidepanel__content">
          <div class="sidepanel__option">
              <div class="sidepanel__option__item">Field Size<span class ="default" @click="predictMatrixSize = 3">Default</span></div>
              <div class="sidepanel__option__row">
                <input class = "numberValue" v-model.number="predictMatrixSize" type="number" min ="3" max="20" >
              </div>
          </div>
          <div class="sidepanel__option">
              <div class="sidepanel__option__item">WinCondition<span class ="default" @click="predictWinCondition = 3">Default</span></div>
              <div class="sidepanel__option__row">
                <input class = "numberValue" v-model.number="predictWinCondition" type="number" min ="3" max="10" >
              </div>
          </div>
          <button class="sidepanel__restart"
            @click="resetGame()"
            :style="{
              transform:`translateX(${settings.status ? 0 : 120}%)`,
          }"
          >Restart
          </button>
        </div>
      </div>
      <div class="highText">
        <div class="winStatus">
          <span v-if="highText">{{highText}}</span> <span :class="winnerClass !== '' ? (winnerClass+' cell') :'' "></span>
        </div>
          <div v-if="restartButton" @click="resetGame()" class="restart">Reset</div>
      </div>
      <div ref="main" class = "main">
        <div v-if="error.isError" class="status">
          <p>Error</p>
          <p>{{error.desc}}</p>
        </div>        
        <div v-if="gameAwait && !error.isError" class="status">
          <p>Waiting for another player: </p>
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
        <Field v-if="gameOn" :style="{float: fieldOverflow || 'none'}" ref = "field" :socket="socket" :options="fieldSettings" @GameEnd="gameEnd" />
      </div>
    </div>
  </div>
</template>

<script>
import Field from '@/components/Field.vue'
import io from 'socket.io-client'

export default {
  name: 'app',
  components: {
    Field
  },
  data: function () {
    return {
      socket: io('localhost:3001'),
      gameID: 0,
      settings: {
        status: false,
        rotate: 0
      },
      gameOn: false,
      gameAwait: false,
      users:[],
      error:{
        isError:false,
        desc:'404'
      },
      fieldSettings: {
        cellSize: 100,
        winRow: 3,
        matrixSize: 3,
        solo: false,
        disabled: false
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
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.settingsClick()
        document.querySelector('button.settings').focus()
      }
    })
    this.socket.emit('JOIN_GAME', {
      gameId : this.gameId, 
      name: localStorage.getItem('name'),
      id: localStorage.getItem('id')
    })

    this.socket.on('WRONG_ID_404', ()=>{
      this.error.isError = true
    })
    this.socket.on('JOINED', users=>{
      this.error.isError = false
      this.gameAwait = true
      this.users = users
      console.log('Am Joined')

    })
    this.socket.on('USER_DISCONNECTED', user=>{
      this.users.find(x=>x.id === user.id).status = 'disconnected'

    })
    this.socket.on('USER_JOIN', user=>{
      console.log('Someone Joined')
      this.users.push(user)
    })

  },
  computed:{
    origin(){
      return window.location.origin
    },
    players(){
      return this.users.filter(x=>x.role==='player')
    },
    spectators(){
      return this.users.filter(x=>x.role==='spectator')
    },

  },

  methods: {
    userColor(status){
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
    settingsClick () {
      this.settings.rotate += this.settings.status ? -90 : 90
      this.settings.status = !this.settings.status
    },
    resetGame () {
      this.highText = ''
      this.winnerClass = ''
      this.fieldSettings.disabled = false
      this.restartButton = false
      if (this.predictMatrixSize && this.predictMatrixSize <= 20 && this.predictMatrixSize >= 3) { this.fieldSettings.matrixSize = this.predictMatrixSize }
      if (this.predictWinCondition >= 3 && this.predictWinCondition <= 10) {
        this.fieldSettings.winRow = this.predictWinCondition
      }
      this.fieldSettings.cellSize = this.defaultCellSize()
      this.$refs.field.restartGame()
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

 /*Settings*/
.settings{
  border: none;
  touch-action: none;
  display: flex;
  z-index: 2;
  justify-content: center;
  align-items: center;
  position: fixed;
  left: 10px;
  top: 10px;
  bottom: 0;
  width: 60px;
  overflow: hidden;
  height:60px;
  background: linear-gradient(#fff, #eee);
  box-shadow: 0 0 0 1px #000;
  border-radius: 10px;
  cursor: pointer;
  transition: .2s;
}

.settings_active{
  background:#fff;
  box-shadow: none;

}

.settings__icon{
  transition: .4s;
  background-image: url("~@/assets/icons/settings.svg");
  background-position: center;
  position: absolute;
  width: 49px;
  height: 49px;
}

.settings__icon_x{
  transition: .3s;
  background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 48 48' version='1.1' width='48px' height='48px'%3E%3Cg id='surface1'%3E%3Cpath style=' fill:%23000;' d='M 36.019531 8.445313 L 39.558594 11.980469 L 11.980469 39.554688 L 8.445313 36.019531 Z '/%3E%3Cpath style=' fill:%23000;' d='M 39.554688 36.023438 L 36.019531 39.558594 L 8.445313 11.976563 L 11.980469 8.441406 Z '/%3E%3C/g%3E%3C/svg%3E%0A");
  fill:#000;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100%, 100%, auto;
  position: absolute;
  left:  -55px;
  width: 49px;
  height: 49px;
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

.sidepanel{
  z-index: 1;
  position: fixed;
  transform: translateX(-100%);
  overflow: hidden;
  padding-top: 100px;
  padding-left: 10px;
  top: 0;
  padding-right: 10px;
  transition: .3s;
  height: 100vh;
  width: 340px;
  background: #fff;
}

.sidepanel__option__item{
  font-size: 36px;
}

.sidepanel__restart{
  cursor: pointer;;
  transition: .3s;
  position: absolute;
  padding: 0 10px;
  display: flex;
  justify-content: center;
  right: 20px;
  top: 10px;
  border: 2px solid #000;
  border-radius: 8px;
  align-items: center;
  margin: 0 auto;
  font-size: 35px;
}

.sidepanel_active{
  box-shadow: 18px 0px 20px 2px rgba(191,191,191,1);
  transform: translateX(0);
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

.sidepanel__option{
  margin-bottom: 25px;
}

.sidepanel__option__row{
  margin-top: 10px;
  display: flex;
  align-items: center;
}

.sidepanel__option__row__value{
  margin-left: 20px;
  width: 3em;
}

.default{
  font-size: 20px;
  text-decoration: underline;
  cursor: pointer;
}

.cell{
  position: relative;
  margin-left: 15px;
  outline: none;
  background-color: transparent;
}

</style>
