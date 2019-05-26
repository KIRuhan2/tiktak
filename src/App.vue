<template>
  <div id="app">
    <div v-if="!authOk" class="modal">
      <div class="modal__close">
        <div class="modal__close__line"></div>
        <div class="modal__close__line"></div>
      </div>
      <Auth @Logined = "logined" class= "auth"/>
    </div>
    <router-view/>
  </div>
</template>
<script>
import Auth from '@/components/Auth.vue'
export default {
  name: 'App',
  components: {
    Auth
  },
  data(){
    return{
      authOk: false,
      name: undefined,
    }
  },
  methods:{
    logined(){
      this.name = localStorage.getItem('name')
      this.id = localStorage.getItem('id')
      this.authOk = true
    }
  },
  mounted(){
    this.name = localStorage.getItem('name')
    this.id = localStorage.getItem('id')
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
