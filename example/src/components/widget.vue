<template>
  <div v-if="show">
    this is a {{ msg }}
  </div>
</template>

<script>
  export default {
    props: ['show', 'msg']
  }
</script>