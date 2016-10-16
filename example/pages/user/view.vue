<template>
    <div id="wrapper">

        <h1>登陆页面! {{ msg }}</h1>

        <img src="/logo.png"/>

        <img src="../../static/logo.png"/>


        <h2><a href="#" @click.stop.prevent="doSomething">{{ text }}</a></h2>
    </div>
</template>

<script>

    export default{

        methods: {
            doSomething: function (event) {
                console.log(this.msg);
                alert('Hello ' + this.msg + '!')
            }
        }

    }
</script>

<style scoped>

    h1 {
        color: red;
    }
</style>