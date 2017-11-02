import Vue from 'vue'

export default context => {
  const action = context.pageContext.pageAction

  const View = require('./' + action + '.vue').default
  console.log(View)

  View.mixins = [
    {
      data () {
        return context
      }
    }
  ]

  const app = new Vue(
    Object.assign(View, {
      // data:function(){
      //     return context;
      // },
      // mounted: function () {
      // }
    })
  )

  return Promise.resolve(app)
}
