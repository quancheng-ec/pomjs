<template>
    <div id="wrapper">

        <h1>hello! {{ msg }} 测试更新!!!</h1>

        <h2>{{ text }}</h2>
    </div>
</template>

<script>
    // import HeaderComponent from './components/header.vue'

    var data = {};

    export default{

        methods: {

            fetchAPI: function (data) {
                this.msg = data.msg;
                this.text = data.text;
            },

            doSomething: function (event) {
                console.log(this.ek);
                alert('Hello ' + this.ek + '!')
            }
        }

    }
</script>

<style lang="stylus">
  body
    background #444

</style>
