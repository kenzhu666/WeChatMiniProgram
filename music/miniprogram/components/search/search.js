let keyword = ''
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder: {
      type: String, 
      value: '请输入关键字'
    }
  },

  externalClasses: [
    // 这要和等号左边的相等
    'iconfont',
    'icon-sousuo'
  ],

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onInput(event){
      keyword = event.detail.value
    },  
    onSearch(){
      this.triggerEvent('search', {keyword})
    }
  }
})