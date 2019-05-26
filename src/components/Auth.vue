<template>
    <div class="authForm">
        <fieldset>
            <legend>Login From</legend>
            <div class ="authForm__item">
                <label for="username">Username:</label>
                <input v-model="name" id="username" type="text" placeholder="Guest"/>
            </div>
            <button @click="submit()" class = "button button_small">Login</button>
        </fieldset>
    </div>
</template>
<script>
import {functions} from '@/mixins/functions'
export default {
    name:'Auth',
    mixins:[functions],
    data(){
        return{
            name: ''
        }
    },
    methods:{
        submit(){
            let id = this.createId()
            localStorage.setItem('name', this.name)
            localStorage.setItem('id', id)
            if(this.name === '') this.name = 'Guest#'+id
            this.$emit('Logined', {name, id})
        }
    }
}
</script>
<style scoped>

legend{
    position: absolute;
    clip: rect(0,0,0,0);
    width: 0;
    height: 0;
}
.authForm{
    background: #fff;
    box-shadow: 0 0 0 4px #000;
    padding: 40px;
    border-radius: 8px;
    font-size: 18px;
    width: 300px;

}

.authForm__item{
    font-size: 28px;
    flex-direction: column;
    display: flex;
    margin-bottom: 20px;
}

.authForm__item input{
    padding-left: 10px;
    margin-top: 10px;
    font-size: 18px;
    border: 1px solid #000;
    height: 2em;
}

.authForm button{
    font-size: 18px;
}
</style>

