<template>
  <div class="home">
    <SideSettings />
    <div class="title">
      <h1>TikTakToe</h1>
      <div class="image"></div>
    </div>
    <nav>
      <ul>
        <li>
          <button @click="newGameOptions = !newGameOptions" class = "button">Create game</button>
        </li>
        <li>
          <button @click="$router.push('/list')" class = "button">Search for game</button>
        </li>
        <li>
          <button @click="$router.push('game/solo')" class = "button">Take a game</button>
        </li>
      </ul>
    </nav>
    <div class="container">
      <div class="newGameOptions" v-if="newGameOptions">
        <div class = "newGameOptions__item">
            <label for="fieldSize">Field Size</label>
            <input v-model="fieldSize" id="fieldSize" class = "numberValue" type="number" min ="3" max="20" >
        </div>
        <div class = "newGameOptions__item">
            <label for="winCondition">Row Length to win</label>
            <input v-model="winCondition" id="winCondition" class = "numberValue" type="number" min ="3" max="10" >
        </div>
        <div class = "newGameOptions__item">
            <label for="gameType">Access</label>
            <select v-model="gameType" class = "select" name="gameType" id="">
              <option value="open">Open</option>
              <option value="close">Invitation Only</option>
            </select>
        </div>
        <button @click="createGame" class="button button_small">Create</button>
      </div>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client'

import SideSettings from '@/components/SideSettings.vue'
import { functions } from '@/mixins/functions'

export default {
  name: 'home',
  components: {
    SideSettings
  },
  mixins: [functions],
  data () {
    return {
      gameType: 'open',
      fieldSize: 3,
      winCondition: 3,
      newGameOptions: false,
      socket: io('localhost:3001')

    }
  },
  computed: {
    // Think i dont neet it yet
    // validate(){
    //   function validateParam(num){
    //     if (typeof num === 'number' && num >= 3)
    //       return Math.floor(this.num)
    //     else
    //       return false
    //   }
    //   if(!validateParam(this.fieldSize) || validateParam(this.winCondition)) return false
    //   return {
    //     gameType: 'open',
    //     fieldSize: validateParam(this.fieldSize),
    //     winCondition: validateParam(this.winCondition),
    //   }

    // }
  },

  methods: {
    createGame () {
      if (this.fieldSize < 3 || this.winCondition < 3) return

      const id = this.createId()
      console.log(id)
      this.socket.emit('CREATE_GAME', {
        fieldSize: this.fieldSize,
        winCondition: this.winCondition,
        hostName: this.$store.state.name,
        gameId: id,
        hostId: this.$store.state.id
      })
      this.socket.close()
      this.$router.push('game/' + id)
    }
  }
}
</script>
<style scoped>

  .home ul{
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    list-style: none;
  }
  nav .button{
    font-size: 24px;
    width: 10em;
    margin-bottom: .5em;
  }

  .title{
    margin: 0 auto;
  }

  h1{
    text-align: center;
    font-size: 48px;
    margin-bottom: .5em;
  }

  .container{
    padding: 10px;
  }

  .newGameOptions{
    max-width: 500px;
    padding: 25px;
    border: 1px solid #000;
    margin: 0 auto  ;
    border-radius: 8px;
  }

  .newGameOptions__item{
    font-size: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #000;
  }

  .newGameOptions button{
    margin: 0 auto;
  }
  .newGameOptions__item label{
    margin-right: 15px;
    display: flex;
    align-items: center;
  }
</style>
