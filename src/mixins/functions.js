export const functions = {
  methods: {
    createId () {
      const abc = 'abcdefghijklmnopqrstuvw1234567890'
      return Array(8).fill().map(x => abc[Math.floor(Math.random() * (abc.length - 1))]).join('')
    }
  }
}
