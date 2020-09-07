import formatTime from '../../utils/formatTime.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    blog:{},
    comments:[],
    blogId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      blogId:options.blogId
    })
    this._getBlogDetail()
  },

  _getBlogDetail(){
    wx.cloud.callFunction({
      name:"find",
      data:{
        blogId: this.data.blogId,
        $url:'detail'
      }
    }).then(res=>{
      let comments = res.result.commentList.data
      for(let i=0; i<comments.length; i++){
        comments[i].createTime = formatTime(new Date(comments[i].createTime))
      }
      this.setData({
        comments,
        blog:res.result.detail[0]
      })
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let blogObj = event.target.dataset.blog
    return{
      title:blogObj.content,
      path:`/pages/blogComment/blogComment?blogId=${blogObj._id}`
    }
  }
})