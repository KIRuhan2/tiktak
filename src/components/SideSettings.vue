<template>
    <div>
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
      <aside :class="['sidepanel', settings.status ? 'sidepanel_active' : '']">
        <div class="sidepanel__content">
          <div class="sidepanel__option">
              <div class="sidepanel__option__item">Field Size<span class ="default" @click="setMatrixSize(3)">Default</span></div>
              <div class="sidepanel__option__row">
                <input class = "numberValue" :value="predictMatrixSize"  @change="setMatrixSize(+$event.target.value)" type="number" min ="3" max="20" >
                <span v-if="(predictMatrixSize < 3 || predictMatrixSize > 20)" class = "numberValueError">*</span>
              </div>
          </div>
          <div class="sidepanel__option">
              <div class="sidepanel__option__item">WinCondition<span class ="default" @click="setWinCondition(3)">Default</span></div>
              <div class="sidepanel__option__row">
                <input class = "numberValue"  :value="predictWinCondition" @change="setWinCondition(+$event.target.value)" type="number" min ="3" max="10" >
                <span v-if="(predictWinCondition < 3 || predictWinCondition > 10)" class = "numberValueError">*</span>
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
      </aside>
    </div>
</template>
<script>
import { EventBus } from '../main';
export default {
    name:'sideSettings',
    data: function(){
        return{
            settings: {
                status: false,
                rotate: 0
            },
        }
    },
    computed: {
      predictMatrixSize(){
        return this.$store.state.settings.field.matrixSize
      },
      predictWinCondition(){
        return this.$store.state.settings.field.winCondition
      }
    },
    methods:{
        resetGame(){
          this.$emit('reset')
        },
        settingsClick () {
          this.settings.rotate += this.settings.status ? -90 : 90
          this.settings.status = !this.settings.status
        },
        setWinCondition(winCondition){
          this.$store.commit('setWinCondition', winCondition)
        },
        setMatrixSize(matrixSize){
          this.$store.commit('setMatrixSize', matrixSize)
        },

    },
    mounted(){
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.settingsClick()
          document.querySelector('button.settings').focus()
        }
      })
    }
}
</script>
<style scoped>
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
  transition: .3s;
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

.numberValueError{
  color: #ff0000;
  padding-left: 5px;
  font-size: 36px; 
}

button{
  background-color: transparent;
  display: block;
}

.default{
  padding-left: 10px;
  font-size: 20px;
  text-decoration: underline;
  cursor: pointer;
}


</style>

