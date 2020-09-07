let musicList = []
let currentIndex = 0
const backgroundAudioManager = wx.getBackgroundAudioManager()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    backgroundImg:'',
    isPlaying:false,
    showLyric:false,
    lyric:'',
    isSame: false, // 是否为同一首歌
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /*
    wx.showLoading({
      title: '歌曲加载中',
    })
    */
    currentIndex = options.index
    musicList = wx.getStorageSync('musiclist')
    this._loadMusicDetail(options.musicid)
  },

  _loadMusicDetail(musicId){
    if (musicId == app.getPlayingMusicId()) {
      this.setData({
        isSame: true
      })
    } else {
      this.setData({
        isSame: false
      })
    }
    if (!this.data.isSame) {
      backgroundAudioManager.stop()
    }
    let music = musicList[currentIndex]
    wx.setNavigationBarTitle({
      title: music.name
    })
    this.setData({
      backgroundImg:music.al.picUrl,
      isPlaying:false
    })
    app.setPlayingMusicId(musicId)
    wx.showLoading({
      title: '歌曲加载中',
    })
    wx.cloud.callFunction({
      name:'music',
      data:{
        musicId,
        $url:'musicURL'
      }
    })
    .then(res=>{
      let result = res.result
      if (result.data[0].url == null) {
        wx.showToast({
          title: '无权限播放',
        })
        return
      }
      if(!this.data.isSame){
        backgroundAudioManager.src = result.data[0].url
        backgroundAudioManager.title = music.name
        backgroundAudioManager.coverImgUrl = music.al.picUrl
        backgroundAudioManager.singer = music.ar[0].name
        backgroundAudioManager.epname = music.al.name

        //保存播放历史
        this.savePlayHistory()
      }
      
      this.setData({
        isPlaying:true
      })
      wx.hideLoading()
      
    })


    // 加载歌词
    wx.cloud.callFunction({
      name:'music',
      data:{
        musicId,
        $url:'lyric'
      }
    })
    .then(res=>{
      //默认为没有歌词
      let lyric = "暂无歌词"
      const lrc = res.result.lrc
      if(lrc){
        lyric = lrc.lyric
      }
      this.setData({
        lyric
      })
      console.log(lyric)
    })
  },

  togglePlay(){
    if(this.data.isPlaying){
      backgroundAudioManager.pause()
    }else{
      backgroundAudioManager.play()
    }
    this.setData({
      isPlaying:!this.data.isPlaying
    })
  },
  
  prevSong(){
    currentIndex--
    if(currentIndex < 0){
      currentIndex = musicList.length-1
    }
    this._loadMusicDetail(musicList[currentIndex].id)
  },

  nextSong(){
    currentIndex++
    if(currentIndex === musicList.length){
      currentIndex = 0
    }
    this._loadMusicDetail(musicList[currentIndex].id)
  },

  switchView(){
    this.setData({
      showLyric:!this.data.showLyric
    })
  },

  timeUpdate(event){
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },

  onPlay(){
    this.setData({
      isPlaying:true
    })
  },

  onPause(){
    this.setData({
      isPlaying:false
    })
  },

  savePlayHistory(){
    const thisMusic = musicList[currentIndex]
    const openid = app.globalData.openid
    const history = wx.getStorageSync(openid)
    let duplicate = false
    for(let i=0; i<history.length; i++){
      if(history[i].id == thisMusic.id ){
        duplicate = true
        break
      }
    }
    if(!duplicate){
      history.unshift(thisMusic)
      wx.setStorage({
        key:openid,
        data:history
      })
    }
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

  }
})