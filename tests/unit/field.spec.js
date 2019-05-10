import field from '@/components/field.vue'

const data = field.data()
const r = Math.round(Math.random() + 1) // random Unit (1 or 2) as ("x" or "O")
const n = r === 1 ? 2 : 1 // reversed random Unit

describe('Valid', () => {
  it('If Data Matrix Valid', () => {
    const flat = (arr, depth = Infinity, arr2 = []) => {
      arr.forEach(e => {
        typeof e === 'object' && depth ? flat(e, depth - 1, arr2) : arr2.push(e)
      })
      return arr2
    }
    expect(!!flat(data.matrix).find(x => ![0, 1, 2].includes(x))).toBe(false)
  })
})

describe('field', () => {
  it('Cell Status Test', () => {
    data.matrix = [
      [0, 1, 2],
      [0, 1, 2], // 0: "", 1: "x", 2: "o".
      [0, 0, 2]
    ]
    expect(field.methods.cellStatus.apply(data, [1, 1])).toBe('x')
    expect(field.methods.cellStatus.apply(data, [0, 0])).toBe('')
    expect(field.methods.cellStatus.apply(data, [1, 2])).toBe('o')
  })
})

describe('Field Win Status', () => {
  it('Diagonal status win', () => {
    data.matrix = [
      [r, 0, 0],
      [0, r, 0],
      [0, 0, r]
    ]
    expect(field.methods.winStatus.apply(data, [0, 0])).toBe(r)
    expect(field.methods.winStatus.apply(data, [1, 1])).toBe(r)
    expect(field.methods.winStatus.apply(data, [2, 2])).toBe(r)

    // Test win trace detect correctly.
    field.methods.winStatus.apply(data, [2, 2])
    expect(data.crossLine.line).toEqual([[0, 0], [1, 1], [2, 2]])
    expect(data.crossLine.direction).toEqual('diagonalLeft')

    data.matrix = [
      [0, 0, r],
      [0, r, 0],
      [r, 0, 0]
    ]
    expect(field.methods.winStatus.apply(data, [0, 2])).toBe(r)
    expect(field.methods.winStatus.apply(data, [1, 1])).toBe(r)
    expect(field.methods.winStatus.apply(data, [2, 0])).toBe(r)

    field.methods.winStatus.apply(data, [0, 2])
    expect(data.crossLine.line).toEqual([[2, 0], [1, 1], [0, 2]])
    expect(data.crossLine.direction).toEqual('diagonalRight')

    data.matrix = [
      [0, 0, r],
      [0, 0, 0],
      [r, 0, 0]
    ]
    expect(field.methods.winStatus.apply(data, [0, 2])).toBe(false)

    data.matrix = [
      [n, r, r],
      [0, r, 0],
      [0, 0, r]
    ]
    expect(field.methods.winStatus.apply(data, [0, 0])).toBe(false)

    data.matrix = [
      [r, 0, 0],
      [0, r, 0],
      [0, 0, r]
    ]
    expect(field.methods.winStatus.apply(data, [0, 0, 4])).toBe(false)

    data.matrix = [
      [r, 0, 0, 0],
      [0, r, 0, 0],
      [0, 0, r, 0],
      [0, 0, 0, r]
    ]
    expect(field.methods.winStatus.apply(data, [0, 0, 4])).toBe(r)

    field.methods.winStatus.apply(data, [0, 0, 4])
    expect(data.crossLine.line).toEqual([[0, 0], [1, 1], [2, 2], [3, 3]])
    expect(data.crossLine.direction).toEqual('diagonalLeft')

    data.matrix = [
      [0, 0, n, r],
      [0, n, r, 0],
      [n, r, 0, 0],
      [r, 0, 0, 0]
    ]
    expect(field.methods.winStatus.apply(data, [0, 3, 4])).toBe(r)
    field.methods.winStatus.apply(data, [2, 1, 4])
    expect(data.crossLine.line).toEqual([[ 3, 0 ], [ 2, 1 ], [ 1, 2 ], [ 0, 3 ]])
  })

  it('Row Status win', () => {
    data.matrix = [
      [r, r, r],
      [0, 0, 0],
      [0, 0, 0]
    ]
    expect(field.methods.winStatus.apply(data, [0, 0])).toBe(r)
    expect(field.methods.winStatus.apply(data, [0, 1])).toBe(r)
    expect(field.methods.winStatus.apply(data, [0, 2])).toBe(r)

    expect(field.methods.winStatus.apply(data, [1, 1])).toBe(false)

    data.matrix = [
      [r, r, r],
      [0, 0, 0],
      [0, 0, 0]
    ]
    expect(field.methods.winStatus.apply(data, [[0, 0, 4]])).toBe(false)

    data.matrix = [
      [r, r, r, r],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]
    expect(field.methods.winStatus.apply(data, [0, 0, 4])).toBe(r)

    field.methods.winStatus.apply(data, [0, 0, 4])
    expect(data.crossLine.line).toEqual([[ 0, 0 ], [ 0, 1 ], [ 0, 2 ], [ 0, 3 ]])
    expect(data.crossLine.direction).toEqual('row')
  })

  it('Column Status win', () => {
    data.matrix = [
      [r, 0, 0],
      [r, 0, 0],
      [r, 0, 0]
    ]
    expect(field.methods.winStatus.apply(data, [0, 0])).toBe(r)
    expect(field.methods.winStatus.apply(data, [1, 0])).toBe(r)
    expect(field.methods.winStatus.apply(data, [2, 0])).toBe(r)

    data.matrix = [
      [r, 0, 0],
      [r, 0, 0],
      [r, 0, 0],
      [r, 0, 0]
    ]
    expect(field.methods.winStatus.apply(data, [0, 0, 4])).toBe(r)

    data.matrix = [
      [r, 0, 0],
      [n, 0, 0],
      [r, 0, 0],
      [r, 0, 0],
      [n, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ]

    expect(field.methods.winStatus.apply(data, [2, 0])).toBe(false)
  })
})
