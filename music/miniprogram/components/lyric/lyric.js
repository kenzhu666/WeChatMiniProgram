let lineHeight = 0
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showLyric:{
      type:Boolean,
      value:false
    },
    lyric:String,
  },

  observers:{
    lyric(lyric){
      if(lyric === '暂无歌词'){
        this.setData({
          lyricList:[
            {
              lyricContent:lyric,
              time:0
            }
          ],
          nowIndex:-1
        })
      }else{
        this._lyricLogic(lyric)
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    lyricList:[],
    nowIndex: 0,
    scrollTop: 0
  },
  
  lifetimes:{
    ready(){
      wx.getSystemInfo({
        success(res){
          lineHeight = res.screenWidth / 750 * 65
        }
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    update(currentTime){
      console.log(currentTime)
      let lyricList = this.data.lyricList
      if(lyricList.length == 0){
        return
      }
      if(currentTime > lyricList[lyricList.length - 1].time){
        if(this.data.nowIndex != -1){
          this.setData({
            // 去除高亮显示
            nowIndex:-1,
            // 最后一行歌词的高度
            scrollTop:lyricList.length * lineHeight
          })
        }
      }
      for(let i=0; i<lyricList.length; i++){
        if(currentTime <= lyricList[i].time){
          this.setData({
            nowIndex:i - 1,
            scrollTop:(i - 1) * lineHeight
          })
          break
        }
      }
    },

    _lyricLogic(lyric){
      let _lyricStore = []
      let lineArr = lyric.split('\n')
      lineArr.forEach(eachLine => {
        let time = eachLine.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        if(time != null){
          let lyricContent = eachLine.split(time)[1]
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          // 把当前这行歌词所在的时间转换为秒
          let timeToSec = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3])/1000
          _lyricStore.push({
            lyricContent,
            time:timeToSec
          })
        }
      })
      this.setData({
        lyricList:_lyricStore
      })
    }
  }
})
