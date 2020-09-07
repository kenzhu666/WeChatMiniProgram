let userInfo = {}
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String,
    blog:Object
  },
  externalClasses:['iconfont','icon-pinglun','icon-plus-share'],
  /**
   * 组件的初始数据
   */
  data: {
    // 登录组件是否显示
    loginShow:false,

    // 底部弹出层是否显示
    modalShow:false,
    content:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment(){
      wx.getSetting({
        success:(res)=>{
          if(res.authSetting['scope.userInfo']){
            wx.getUserInfo({
              success: (res)=>{
                userInfo = res.userInfo
                console.log(userInfo)
                // 如果授权成功，显示评论弹出层 
                this.setData({
                  modalShow:true
                })
              },
            })
          }else{
            this.setData({
              loginShow:true
            })
          }
        }
      })
    },

    loginSuccess(event){
      userInfo = event.detail
      // 登录成功，授权框消失
      this.setData({
        loginShow:false
      },()=>{
        this.setData({
          modalShow:true
        })
      })
    },

    loginFail(){
      // 登录失败，弹窗提示登录
      wx.showModal({
        title: '授权用户才能评价',
        content:''
      })
    },


    onSubmit(event){
      let content = event.detail.value.content
      let formId = event.detail.formId
      console.log(event)
      
      if(content.trim() == ''){
        wx.showModal({
          title: '评论内容不能为空',
          content:''
        })
        return
      }
      wx.showLoading({
        title: '评论中',
        mask:true
      })
      db.collection('blog-comment').add({
        data:{
          content,
          blogId: this.properties.blogId,
          createTime: db.serverDate(),
          nickName: userInfo.nickName,
          avatarUrl:userInfo.avatarUrl
        }
      }).then(res=>{

        wx.cloud.callFunction({
          name:'sendMessage',
          data:{
            content,
            formId,
            blogId: this.properties.blogId,
            createTime: db.serverDate()
          }
        }).then(res=>{
          console.log(res)
        })

        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
        })

        this.setData({
          modalShow:false,
          content:''
        })

        this.triggerEvent('refreshCommentList')
      })
    }
  }
})
