<template>
  <div id="app">
    <Auth/>
    <router-view/>
  </div>
</template>
<script>
import Auth from '@/components/Auth.vue'
export default {
  name: 'App',
  components: {
    Auth
  }
}
</script>
<style>

#app {

}
</style>
