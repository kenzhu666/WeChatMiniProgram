let keyword = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalShow:false,
    blogList:[]
  },


  onPublish(){
    wx.getSetting({
      success:(res) => {
        // 授权了直接拿到用户信息
        if(res.authSetting['scope.userInfo']){
          wx.getUserInfo({
            // *注意：只要后面有用到this, 就一定要箭头函数
            success:(res)=>{
              // 如果已经授权了，那就直接调用授权成功的方法，并把用户信息传过去
              this.loginSuccess({detail:res.userInfo})
            }
          })
        }else{
          // 未授权才弹出底部弹出层
          this.setData({
            modalShow:true
          })
        }
      }
    })
  },

  loginSuccess(event){
    const { detail } = event
    console.log(detail)
    wx.navigateTo({
      url: `../blogPage/blogPage?nickName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`
    })
  },

  loginFail(){
    wx.showModal({
      title: '用户授权才能登录',
      content:'',
    })
  },
  goComment(event){
    wx.navigateTo({
      url: `../../pages/blogComment/blogComment?blogId=${event.target.dataset.blogid}`,
    })
  },

  onSearch(event){
    keyword = event.detail.keyword
    console.log(keyword)
    this.setData({
      blogList:[]
    })
    this._loadBlog(0)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._loadBlog()
  },  
  _loadBlog(start=0){
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name:'find',
      data:{
        keyword,
        start,
        count:10,
        $url:'list'
      }
    }).then(res=>{
      this.setData({
        blogList:this.data.blogList.concat(res.result)
      })
      wx.hideLoading()
      wx.stopPullDownRefresh()
    }).catch(err=>{
      console.log(err)
      wx.hideLoading()
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      blogList:[]
    })
    this._loadBlog(0)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._loadBlog(this.data.blogList.length)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (event) {
    console.log(event)
    let blogObj = event.target.dataset.blog
    return{
      title:blogObj.content,
      path:`/pages/blogComment/blogComment?blogId=${blogObj._id}`
    }
  }
})