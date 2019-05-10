<template>
    <div class="field">
        <div v-for="(row, rowIndex) in matrix" :key="rowIndex" class="row">
            <div v-for="(cell, cellIndex) in matrix[rowIndex]" :key="cellIndex"
            :class="['cell',cellDisabled,cellStatus(rowIndex,cellIndex)]"
            @click="makeTurn(rowIndex,cellIndex)"
            :style="{width:`${options.cellSize}px`, height:`${options.cellSize}px`}"
            >
            <div class="vertical line"></div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
  name: 'field',
  props: ['options'],
  data: function () {
    return {
      turn: 2,
      matrix: [],
      crossLine: []
    }
  },

  created () {
    this.matrix = this.makeMatrix(this.options ? this.options.winRow : 3)
  },
  computed: {
    cellDisabled () {
      return this.options.disabled ? 'disabled' : ''
    }
  },
  methods: {
    restartGame () {
      this.matrix = this.makeMatrix(this.options ? this.options.winRow : 3)
      this.crossLine = []
      this.turn = 2
    },
    cellStatus (i, j) {
      return ['', 'x', 'o'][this.matrix[i][j]]
    },
    makeMatrix (n) {
      return Array(this.options.matrixSize || 3).fill(null).map(() => Array(this.options.matrixSize || 3).fill(0))
    },
    makeTurn (i, j) {
      const flat = (arr, depth = Infinity, arr2 = []) => {
        arr.forEach(e => {
          typeof e === 'object' && depth ? flat(e, depth - 1, arr2) : arr2.push(e)
        })
        return arr2
      }

      if (this.cellStatus(i, j)) return
      if (this.options.disabled) return
      this.matrix[i].splice(j, 1, this.turn)
      this.turn = this.turn === 1 ? 2 : 1
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
      const mfind = (matrix, i, j) => ((matrix[i] && matrix[i][j]) ? matrix[i][j] : false) // Avoid undefined and 0 values
      if (!mfind(this.matrix, i, j)) return false

      const cell = mfind(this.matrix, i, j)
      const cellReg = new RegExp(Array(n).fill(mfind(this.matrix, i, j)).join(''))
      const arr = Array.from({ length: n * 2 - 1 })

      arr.forEach((x, index) => { win.indexes[0].push([i + (n - 1) - index, j - (n - 1) + index]) }) // diagonal 1
      arr.forEach((x, index) => { win.indexes[1].push([i - (n - 1) + index, j - (n - 1) + index]) }) // diagonal 2
      arr.forEach((x, index) => { win.indexes[2].push([i, j - (n - 1) + index]) }) // row
      arr.forEach((x, index) => { win.indexes[3].push([i - (n - 1) + index, j ]) }) // column

      win.status[0] =
        arr.map((x, index) => mfind(this.matrix, i + (n - 1) - index, j - (n - 1) + index)).join('').replace(/false/g, 'f')
      win.status[1] =
        arr.map((x, index) => mfind(this.matrix, i - (n - 1) + index, j - (n - 1) + index)).join('').replace(/false/g, 'f')

      win.status[2] =
        arr.map((x, index) => mfind(this.matrix, i, j - (n - 1) + index)).join('').replace(/false/g, 'f')

      win.status[3] =
        arr.map((x, index) => mfind(this.matrix, i - (n - 1) + index, j)).join('').replace(/false/g, 'f')

      win.status.forEach((e, i) => {
        if (e.match(cellReg)) {
          this.crossLine = win.indexes[i].slice(e.match(cellReg).index, e.match(cellReg).index + n)
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
        display: flex;
        align-items: center;
        flex-direction: column;
    }
    .row{
        display: flex;
    }
    .vertical{
      background-color: #000;
      width: 200%;
      transform: rotate(-45deg);
    }
    .horiz{

    }
    .diagLeft{

    }
    .diagRight{

    }
    .x{
        background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 48 48' version='1.1' width='48px' height='48px'%3E%3Cg id='surface1'%3E%3Cpath style=' fill:%23F44336;' d='M 36.019531 8.445313 L 39.558594 11.980469 L 11.980469 39.554688 L 8.445313 36.019531 Z '/%3E%3Cpath style=' fill:%23F44336;' d='M 39.554688 36.023438 L 36.019531 39.558594 L 8.445313 11.976563 L 11.980469 8.441406 Z '/%3E%3C/g%3E%3C/svg%3E%0A");
    }

    .o{
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle viewBox='0 0 100 100' cx='50%' cy='50%' r='40%' fill='none' stroke='green' stroke-width='8%' /%3E%3C/svg%3E");
    }

</style>
