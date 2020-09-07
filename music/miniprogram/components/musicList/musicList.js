const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist:Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    playId:-1
  },

  // 页面的生命周期
  pageLifetimes:{
    // 每当此页面显示的时候执行的方法
    show(){
      this.setData({
        // 把全局中拿到的musicId赋值到playId
        playId:parseInt(app.getPlayingMusicId())
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    selected(event){
      const ds = event.currentTarget.dataset
      const musicId = ds.musicid
      this.setData({
        playId:musicId 
      })
      wx.navigateTo({
        url: `../../pages/player/player?musicid=${musicId}&index=${ds.index}`
      })
    }
  }
})
