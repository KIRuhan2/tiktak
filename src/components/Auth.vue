<template>
    <div class="authForm">
        <fieldset>
            <legend>Login From</legend>
            <div class ="authForm__item">
                <label for="username">Username</label>
                <input id="username" type="text" placeholder="username"/>   
            </div>
            <button class = "button button_small">Login</button>
        </fieldset>
    </div>
</template>
<script>
export default {
    name:'Auth'
}
</script>
