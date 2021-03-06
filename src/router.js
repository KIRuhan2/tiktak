import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Game from '@/views/Game.vue'
import List from '@/views/List.vue'
Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/game/:id',
      name: 'game',
      component: Game,
      props: true
    },
    {
      path: '/list',
      name: 'list',
      component: List,
      props: true
    }

  ]
})
