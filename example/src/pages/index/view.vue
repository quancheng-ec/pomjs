<template>
  <div id="wrapper">
    <widget :show="true" :msg="msg"></widget>
    <h1>hello! {{ msg }} 测试更新!!!</h1>

    <h2>{{ text }}</h2>
  </div>
</template>

<script>
  import widget from '../../components/widget.vue'

  export default{
    components: { widget },
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

<style lang="stylus" rel="stylesheet/stylus">
  body
    background #444
</style>
