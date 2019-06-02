<template>
    <main class="list">
        <SideSettings />
        <div class="container">
            <div class="table">
                <div class="table__item table__item--header">
                    <div class="table__item__field">Game</div>
                    <div class="table__item__field">Name</div>
                    <div class="table__item__field">Host</div>
                </div>
                <div v-for="game in gamesList" :key="game.id" @click="joinGame(game.id)" class="table__item">
                    <div class="table__item__field">TikTakToe</div>
                    <div class="table__item__field">{{game.hostName}}</div>
                    <div class="table__item__field">{{game.id}}</div>
                </div>
            </div>
        </div>
    </main>
</template>
<script>
import SideSettings from '@/components/SideSettings.vue'
import io from 'socket.io-client'

export default {
  name: 'List',
  components: {
    SideSettings
  },
  data () {
    return {
      gamesList: [],
      socket: io('localhost:3001')
    }
  },
  methods: {
    joinGame (gameId) {
      this.$router.push('/game/' + gameId)
    }
  },
  mounted () {
    this.socket.emit('GET_LIST')
    this.socket.on('LIST', gamesList => {
      this.gamesList.push(...gamesList)
      console.log(gamesList)
    })
  }
}
</script>
<style>

.table{
    padding-top: 60px;
    font-size: 36px;
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
}

.table__item{
    cursor: pointer;
    display: flex;
}

.table__item:hover{
    background: #ebebeb;
}

.table__item__field{
    padding: 10px 0;
    border-right: 2px solid #000;
    flex: 1;
}

.table__item--header{
    background: #ebebeb;
}

.table__item--header .table__item__field{
    padding: 0;

}

</style>
