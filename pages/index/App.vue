<template >
    <div id="page">
        <h1>hello! {{ msg }}</h1>

        <h2>{{ text }}</h2>
    </div>
</template>

<script>
    // import HeaderComponent from './components/header.vue'

    var data = {};

    export default{
        data() {
            return {
                msg: '',
                text: ''
            };
        },
        methods: {
            doSomething: function (event) {
                console.log(this.ek);
                alert('Hello ' + this.ek + '!')
            }
        }

    }
</script>