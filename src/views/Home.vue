<template>
  <div class="home">
    <div class="title">
      <h1>TikTakToe</h1>
      <div class="image"></div>
    </div>
    <nav>
      <ul>
        <li>
          <button class = "button">Create game</button>
        </li>
        <li>
          <button class = "button">Search for game</button>
        </li>
        <li>
          <button @click="$router.push('/solo')" class = "button">Take a game</button>
        </li>        
      </ul>
    </nav>
  </div>
</template>

<script>

export default {
  name: 'home',
  data () {
    return {

    }
  }
}
</script>
<style scoped>
  .home{
    font-family: sans-serif;
  }
  .home ul{
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    list-style: none;
  }
  button{
    font-size: 24px;
    width: 10em;
    margin-bottom: .5em;
  }

  button:focus{
    box-shadow: 0 0 0 4px #fefefe;

  }

  .title{
    margin: 0 auto;
  }
  h1{
    text-align: center;
    font-size: 48px;
    margin-bottom: .5em;
  }
</style>

