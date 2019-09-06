<template>
  <div class="field">
    <div v-for="(row, rowIndex) in matrix" :key="rowIndex" class="row">
        <div v-for="(cell, cellIndex) in matrix[rowIndex]" :key="cellIndex"
        :class="['cell',cellDisabled,cellStatus(rowIndex,cellIndex)]"
        @click="makeTurn(rowIndex,cellIndex)"
        :style="{width:`${options.cellSize}px`, height:`${options.cellSize}px`}"
        >
          <div class="line" :style="lineStyle(rowIndex, cellIndex)"></div>
        </div>
    </div>
  </div>
</template>
<script>
import io from 'socket.io-client'
import { EventBus } from '@/main.js'

export default {
  name: 'field',
  props: ['options'],
  data: function () {
    return {
      socket: io('localhost:3001'),
      matrix: [],
      crossLine: { line: [], direction: '' }
    }
  },

  mounted () {
    console.log('Filed')
    this.matrix = this.makeMatrix(this.options ? this.options.matrixSize : 3)
  },
  computed: {
    cellDisabled () {
      return this.options.disabled ? 'disabled' : ''
    },
    gameId(){
      return this.$store.state.gameId
    },
    id(){
      return this.$store.state.id
    }
  },
  methods: {
    defaultCellSize (matrixSize = 3) {
      let maxWithWidth = this.window.width / matrixSize - 10
      let maxWithHeight = (this.window.height - 140) / matrixSize
      maxWithWidth = maxWithWidth > 100 ? 100 : maxWithWidth < 20 ? 20 : maxWithWidth
      return Math.floor(Math.min(maxWithHeight, maxWithWidth))
    },
    restartGame (send) {
      this.matrix = this.makeMatrix(this.options ? this.options.matrixSize : 3)
      this.crossLine = { line: [], direction: '' }
      // this.turn = 2
      if(send){
        this.socket.emit('RESTART_GAME', this.gameId)
      }
    },
    cellStatus(i, j) {
      return ['', 'x', 'o'][this.matrix[i][j]]
    },
    lineStyle (i, j) {
      if (!this.crossLine.line.length) return
      let lineSize = this.options ? this.options.winRow : 3
      let cellSize = this.options.cellSize
      let center = this.crossLine.line[Math.floor(this.crossLine.line.length / 2)]
      let direction = this.crossLine.direction
      function PresetLineSize (width, rotate, height = cellSize / 8) {
        this.width = width - cellSize / 2 + 'px'
        this.height = height + 'px'
        this.backgroundColor = '#000'
        this.transform = `rotate(${rotate || 0}deg)`
        if (lineSize % 2 === 0) {
          let translate = {
            diagonalRight: `translate(-${cellSize / 2}px, ${cellSize / 2}px) rotate(${rotate || 0}deg)`,
            diagonalLeft: `translate(-${cellSize / 2}px, -${cellSize / 2}px) rotate(${rotate || 0}deg)`,
            row: `translateX(-${cellSize / 2}px)`,
            column: `translateY(-${cellSize / 2}px) rotate(90deg)`
          }
          this.transform = translate[direction]
        }
      }      
      if (center[0] === i && center[1] === j){
        let options = {
          diagonalRight: new PresetLineSize(Math.sqrt(2 * (cellSize * lineSize) ** 2), -45),
          diagonalLeft: new PresetLineSize(Math.sqrt(2 * (cellSize * lineSize) ** 2), 45),
          row: new PresetLineSize(cellSize * lineSize),
          column: new PresetLineSize(cellSize * lineSize, 90)
        }
        return options[direction]
      }
    },
    makeMatrix (n) {
      return Array(+this.options.matrixSize || 3).fill(null).map(() => Array(this.options.matrixSize || 3).fill(0))
    },
    makeTurn (i, j, thirdSideTurn) {
      const flat = (arr, depth = Infinity, arr2 = []) => {
        arr.forEach(e => {
          typeof e === 'object' && depth ? flat(e, depth - 1, arr2) : arr2.push(e);
        });
        return arr2;
      };

      if (this.cellStatus(i, j)) return
      if (this.options.disabled) return
      if(!this.options.turnToPlay) return 
      if(!thirdSideTurn){
        this.socket.emit('MAKE_TURN', {
          playerId: this.id,
          cell : [i,j],
          gameId : this.gameId,
        });
      }      
      this.matrix[i].splice(j, 1, this.options.turn)
      // this.turn = this.turn === 1 ? 2 : 1
      let winner = this.winStatus(i, j)
      if (winner || flat(this.matrix).every(x => (x === 1 || x === 2))) {
        this.$emit('GameEnd', winner)
      }
    },
    winStatus (i, j, n = this.options ? this.options.winRow : 3) {
      let win = {
        status: [ [], [], [], [] ],
        indexes: [ [], [], [], [] ]
      }
      const mfind = (matrix, i, j) => ((matrix[i] && matrix[i][j]) ? matrix[i][j] : -1) // Avoid undefined and 0 values
      if (mfind(this.matrix, i, j) === -1) return false

      const cell = mfind(this.matrix, i, j)
      const cellReg = new RegExp(Array(n).fill(cell).join(''))
      const arr = Array.from({ length: n * 2 - 1 })

      arr.forEach((x, index) => { win.indexes[0].push([i + (n - 1) - index, j - (n - 1) + index]) }) // diagonal 1
      arr.forEach((x, index) => { win.indexes[1].push([i - (n - 1) + index, j - (n - 1) + index]) }) // diagonal 2
      arr.forEach((x, index) => { win.indexes[2].push([i, j - (n - 1) + index]) }) // row
      arr.forEach((x, index) => { win.indexes[3].push([i - (n - 1) + index, j]) }) // column

      win.status[0] =
        arr.map((x, index) => mfind(this.matrix, i + (n - 1) - index, j - (n - 1) + index)).join('').replace(/-1/g, 'f') // diagonal 1
      win.status[1] =
        arr.map((x, index) => mfind(this.matrix, i - (n - 1) + index, j - (n - 1) + index)).join('').replace(/-1/g, 'f') // diagonal 2

      win.status[2] =
        arr.map((x, index) => mfind(this.matrix, i, j - (n - 1) + index)).join('').replace(/-1/g, 'f') // row

      win.status[3] =
        arr.map((x, index) => mfind(this.matrix, i - (n - 1) + index, j)).join('').replace(/-1/g, 'f') // column

      win.status.forEach((e, i) => {
        if (e.match(cellReg)) {
          this.crossLine.line = win.indexes[i].slice(e.match(cellReg).index, e.match(cellReg).index + n)
          this.crossLine.direction = ['diagonalRight', 'diagonalLeft', 'row', 'column'][i]
        }
      })
      return Object.values(win.status).find(x => x.match(cellReg)) ? cell : false
    }
  }

}
</script>

<style>
    /*Cell*/
    .cell{
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100px;
        height: 100px;
        /* will-change: width,height;s */
        background: #fff;
        outline: 1px solid #000;
        background-repeat: no-repeat;
        background-position: center;
        background-size: 100%, 100%, auto;
    }
    .cell:hover{
        background-color: #f7f7f7;
    }
    .disabled{
        cursor: not-allowed;
        background-color: #f7f7f7;
    }

    .field{
        -webkit-box-align: center;
        display: -webkit-box;
        flex-direction: column;
    }
    .row{
        display: flex;
    }
    .line{
      position: absolute;
    }

    .x{
        background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 48 48' version='1.1' width='48px' height='48px'%3E%3Cg id='surface1'%3E%3Cpath style=' fill:%23F44336;' d='M 36.019531 8.445313 L 39.558594 11.980469 L 11.980469 39.554688 L 8.445313 36.019531 Z '/%3E%3Cpath style=' fill:%23F44336;' d='M 39.554688 36.023438 L 36.019531 39.558594 L 8.445313 11.976563 L 11.980469 8.441406 Z '/%3E%3C/g%3E%3C/svg%3E%0A");
    }

    .o{
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle viewBox='0 0 100 100' cx='50%' cy='50%' r='40%' fill='none' stroke='green' stroke-width='8%' /%3E%3C/svg%3E");
    }

</style>
