// components/login/login.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modalShow:Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onBindUserInfo(event){
      const { userInfo } = event.detail
      console.log(userInfo)
      // 允许授权
      if(userInfo){
        this.setData({
          modalShow:false
        })
        this.triggerEvent("loginSuccess", userInfo)
      }
      // 授权失败
      else{
        this.triggerEvent("loginFail")
      }
    }
  }
})
