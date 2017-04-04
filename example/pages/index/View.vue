<template>
 <div id="wrapper">
     
     <input type="input" v-model="userName">
     <p>

            hello joe {{userName}} ffff

            {{url}}

     </p>
  </div>
</template>
<script>
export default {

  data() {
    return {
      userName:'123'
    }
  },
  methods: {
    login() {
    
    }
  }

}

</script>