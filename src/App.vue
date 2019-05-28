<template>
  <div id="app">
    <div v-if="!authOk" class="modal">
      <div class="modal__close">
        <div class="modal__close__line"></div>
        <div class="modal__close__line"></div>
      </div>
      <Auth class= "auth"/>
    </div>
    <router-view/>
  </div>
</template>
<script>
import Auth from '@/components/Auth.vue'
import { EventBus } from './main.js'

export default {
  name: 'App',
  components: {
    Auth
  },
  data(){
    return{
      authOk: false,
    }
  },
  computed:{
    name(){
      return this.$store.state.name
    },
    id(){
      return this.$store.state.id
    }
  },
  mounted(){
    EventBus.$on('Logined', this.logined)
  },
  methods:{
    logined(){
      this.authOk = true
    }
  },
  created(){
    this.$store.commit('setName',localStorage.getItem('name') )
    this.$store.commit('setId',localStorage.getItem('id') )
    this.authOk = !!this.id && !!this.name
  }

}
</script>
<style>
.modal{
  position: fixed;
  background: rgba(0, 0, 0, .7);
  width: 100vw;
  height: 100vh;
}

.auth{
  position: relative;
  top: 10%;
  margin: 0 auto;
  z-index: 1;
}
</style>
