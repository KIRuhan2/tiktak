import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    id: undefined,
    name: undefined,
    gameId: undefined,
    settings: {
      field: {
        matrixSize: 3,
        winCondition: 3
      }
    }
  },
  mutations: {
    setName (state, name) {
      state.name = name
    },
    setGameId(state, gameId){
      state.gameId = gameId
    },
    setId (state, id) {
      state.id = id
    },
    setMatrixSize (state, size) {
      state.settings.field.matrixSize = size
    },
    setWinCondition (state, winCondition) {
      state.settings.field.winCondition = winCondition
    }
  },
  actions: {

  }
})
