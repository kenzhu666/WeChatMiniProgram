let movableAreaWidth = 0 //整个进度条的初始位置
let movableViewWidth = 0 //进度条上拖动的圆的初始位置
const backgroundAudioManager = wx.getBackgroundAudioManager()
let nowSec = -1 // 当前的时间(单位:秒)
let duration = 0 //当前歌曲的总时长(单位:秒)
let isMoving = false //当前进度条是否在拖拽

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    time:{
      currentTime:'00:00',
      totalTime:'00:00'
    },
    moveDistance:0,
    progress:0
  },

  // 自定义生命周期函数:
  lifetimes:{
    ready(){
      if (this.properties.isSame && this.data.time.totalTime == '00:00') {
        this._durationDefined()
      }
      this._getMoveDistance()
      this._bindBGMEvent()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange(event){
      if(event.detail.source == 'touch'){
        this.data.moveDistance = event.detail.x
        this.data.progress = event.detail.x/(movableAreaWidth-movableViewWidth)*100
        isMoving = true
      }
    },
    onTouchEnd(){
      const currentTime = this._timeFormat(Math.floor(backgroundAudioManager.currentTime))

      // 当滑动的手松开再赋值到界面，这样提升性能
      this.setData({
        moveDistance:this.data.moveDistance,
        progress:this.data.progress,
        ['time.currentTime']:`${currentTime.min}:${currentTime.sec}`
      })
      
      // 当前这首歌的音乐时间位置也随着progress的进度而改变
      backgroundAudioManager.seek(duration*this.data.progress / 100)
      isMoving = false
    },
    _getMoveDistance(){
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec(rect=>{
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
        console.log(movableAreaWidth, movableViewWidth)
      })
    },

    _bindBGMEvent() {
      backgroundAudioManager.onPlay(() => {
        isMoving = false
        console.log('onPlay')
        this.triggerEvent('onPlay')
      })
  
      backgroundAudioManager.onStop(() => {
        console.log('onStop')
      })
  
      backgroundAudioManager.onPause(() => {
        console.log('Pause')
        this.triggerEvent('onPause')
      })
  
      backgroundAudioManager.onWaiting(() => {
        console.log('onWaiting')
      })
  
      backgroundAudioManager.onCanplay(() => {
        console.log('onCanplay')
        // 这里有几率会让duration undefined，为了预防undefined，把duration赋值过程封装到_durationUndefined()
        if(typeof backgroundAudioManager.duration != 'undefined'){
          this._durationDefined()
        }else{
          // 如果undefined了，那等上1秒重新调用获取
          setTimeout(() => {
            this._durationDefined()
          }, 1000);
        }
        
      })
  
      backgroundAudioManager.onTimeUpdate(() => {
        if(!isMoving){
        const currentTime = backgroundAudioManager.currentTime
        const duration = backgroundAudioManager.duration
        const sec = currentTime.toString().split('.')[0]
        // 这样就是每秒才会更新currentTime
        if(sec != nowSec){
          const currentTimeFormat = this._timeFormat(currentTime)
          this.setData({
            moveDistance:(movableAreaWidth-movableViewWidth)*currentTime/duration,
            progress:currentTime/duration * 100,
            ['time.currentTime']:`${currentTimeFormat.min}:${currentTimeFormat.sec}`
          })
          nowSec = sec 
        
          this.triggerEvent('timeUpdate', {currentTime})
        }
      }
      })
  
      backgroundAudioManager.onEnded(() => {
        console.log("onEnded")
        this.triggerEvent('songEnd')
      })
  
      backgroundAudioManager.onError((res) => {
        console.error(res.errMsg)
        console.error(res.errCode)
        wx.showToast({
          title: '错误:' + res.errCode,
        })
      })
    },

    _durationDefined(){
      duration = backgroundAudioManager.duration
      const durationFormat = this._timeFormat(duration)
      console.log(durationFormat)
      this.setData({
        ['time.totalTime']:`${durationFormat.min}:${durationFormat.sec}`
      })
    },

    _timeFormat(sec){
      // 向下取整
      const min = Math.floor(sec/60)
      // 整除60之后剩下的秒数
      sec = Math.floor(sec % 60)
      return{
        'min':this._add0(min),
        'sec':this._add0(sec)
      }
    },

    _add0(sec){
      return sec < 10 ? '0' + sec : sec
    }
  },
})
