const MAX_LIMIT = 15
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperList:[
      {
        url: 'http://p1.music.126.net/oeH9rlBAj3UNkhOmfog8Hw==/109951164169407335.jpg',
      },
      {
        url: 'http://p1.music.126.net/xhWAaHI-SIYP8ZMzL9NOqg==/109951164167032995.jpg',
      },
      {
        url: 'http://p1.music.126.net/Yo-FjrJTQ9clkDkuUCTtUg==/109951164169441928.jpg',
      }
    ],

    playListArr:[]
  },
  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    this._getPlayList()
    //this._getSwiper()
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
      playListArr:[]
    })
    this._getPlayList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._getPlayList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  _getPlayList(){
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name:'music',
      data:{
        start:this.data.playListArr.length,
        count:MAX_LIMIT,
        $url:'playList'
      }
    }).then(res=>{
      this.setData({
        playListArr:this.data.playListArr.concat(res.result.data)
      })
      wx.hideLoading()
    }).catch(err=>{
      console.log(err)
      wx.hideLoading()
    })
  }
})