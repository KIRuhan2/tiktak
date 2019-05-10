<template>
  <div id="app">
    <div @click="settingsClick()" :class="['settings', settings.status ? 'settings--active': '']">
      <div class="settings__icon"
        :style="{
          transform:`translateX(${settings.rotate/1.5}px) rotate(${settings.rotate}deg`,
        }"
      ></div>
      <div class="settings__icon--x"
        :style="{
          transform:`translate(${settings.rotate/1.5}px)`
        }"
      ></div>
    </div>
    <div :class="['sidepanel', settings.status ? 'sidepanel--active' : '']">
      <div class="sidepanel__option">
          <div class="sidepanel__option__item">Cell Size <span class ="default" @click="fieldSettings.cellSize = 100">Default</span></div>
          <div class="sidepanel__option__row">
            <input class = "cellSizeValue" v-model="fieldSettings.cellSize" type="range" min="20" max="200" value="100">
            <div class="sidepanel__option__row__value">{{ fieldSettings.cellSize }}</div>
          </div>
      </div>
    </div>
    <div class="highText">
      <div class="winStatus">
        <span v-if="highText">{{highText}}</span> <span :class="winnerClass !== '' ? (winnerClass+' cell') :'' "></span>
      </div>
        <div v-if="restartButton" @click="resetGame()" class="restart">Reset</div>
    </div>
    <field ref = "field" :options="fieldSettings" @GameEnd="gameEnd" />
  </div>
</template>

<script>
import field from '@/components/field.vue'

export default {
  name: 'app',
  components: {
    field
  },
  data: function () {
    return {
      settings: {
        status: false,
        rotate: 0
      },
      fieldSettings: {
        cellSize: 100,
        winRow: 4,
        matrixSize: 4,
        disabled: false
      },
      highText: '',
      winnerClass: '',
      restartButton: false
    }
  },

  methods: {
    settingsClick () {
      this.settings.rotate += this.settings.status ? -90 : 90
      this.settings.status = !this.settings.status
    },
    resetGame () {
      this.highText = ''
      this.winnerClass = ''
      this.fieldSettings.disabled = false
      this.restartButton = false
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

#app{
  font-family: sans-serif;
  font-size: 45px;
}
 /*Settings*/
.settings{
  display: flex;
  z-index: 2;
  justify-content: center;
  align-items: center;
  position: fixed;
  left: 10px;
  top: 10px;
  width: 60px;
  overflow: hidden;
  height:60px;
  background: linear-gradient(#fff, #eee);
  box-shadow: 0 0 0 1px #000;
  border-radius: 10px;
  cursor: pointer;
  transition: .2s;
}

.settings--active{
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

.settings__icon--x{
  transition: .4s;
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
  margin-top: 20px;
}

.sidepanel{
  z-index: 1;
  will-change: transform;
  position: fixed;
  transform: translateX(-100%);
  padding-top: 100px;
  top: 0;
  padding-right: 10px;
  transition: .3s;
  height: 100vh;
  width: 340px;
  background: #fff;
}

.sidepanel--active{
  box-shadow: 18px 0px 20px 2px rgba(191,191,191,1);
  transform: translateX(0);
}

.restart{
  width: 4em;
  height: 2em;
  margin: 0 auto;
  font-size: 20px;
  border: 2px solid #000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.restart:hover{
  cursor: pointer;
  background-color: #000;
  color: #fff;
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
  margin-left: 15px;
  outline: none;
  background-color: transparent;
}

</style>
