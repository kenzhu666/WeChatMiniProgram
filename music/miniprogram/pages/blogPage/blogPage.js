const MAX_LENGTH = 140
const MAX_IMG = 9
const db = wx.cloud.database()
let content = ''
let userInfo = {}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordCount:0,
    footerbottom: 0, 
    selectPhoto:true,
    images:[]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    userInfo = options
  },

  onInput(event){
    const currentWords = event.detail.value.length
    if(currentWords >= MAX_LENGTH){
      console.log(`最大字数限制为${MAX_LENGTH}`)
    }
    this.setData({
      wordCount:currentWords
    })
    content = event.detail.value
  },

  onFocus(event){
    this.setData({
      footerbottom:event.detail.height
    })
  },

  onBlur(){
    this.setData({
      footerbottom:0
    })
  },

  chooseImg(){
    let imgCount = MAX_IMG - this.data.images.length
    wx.chooseImage({
      count: imgCount,
      sizetype: ['original', 'compressed'],
      sourcetype:['album', 'camera'],
      success:(res)=>{
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })

        // 还剩几张可以选
        imgCount = MAX_IMG - this.data.images.length
        this.setData({
          selectPhoto:imgCount <=0 ? false : true
        })
      } 
    })
  },

  delImage(event){
    this.data.images.splice(event.target.dataset.index, 1)
    this.setData({
      images:this.data.images
    })
    if(this.data.images.length == MAX_IMG - 1){
      this.setData({
        selectPhoto:true
      })
     
    }
  },

  previewImage(event){
    wx.previewImage({
      urls: this.data.images,
      current: event.target.dataset.imgSrc
    })
  },

  onUpload(){
    if(content.trim() === ''){
      wx.showModal({
        title:'请输入内容',
        content:''
      })
      return
    }

    wx.showLoading({
      title: '发布中...',
      mask: true
    })

    let promiseArr = []
    let fileIds = []
    
    // 图片上传
    for(let i=0; i<this.data.images.length; i++){
      let p = new Promise((resolve, reject) => {
        let item = this.data.images[i]
        // 正则表达式获取图片后缀
        let suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({
          cloudPath:'blog/' + Date.now() + '-' + Math.random() * 1000000 + suffix,
          filePath:item, 
          success:(res) => {
            console.log(res)
            fileIds = fileIds.concat(res.fileID)
            resolve()
          },
          fail:(err)=>{
            console.log(err)
            reject()
          }
        })
      })
      promiseArr.push(p)
    }
    Promise.all(promiseArr).then(res => {
      db.collection('blog').add({ 
        data:{
          ...userInfo,
          content,
          img:fileIds,
          createTime: db.serverDate()
        }
      }).then(res=>{
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })
        wx.navigateBack()
        

        const pages = getCurrentPages()        
        const find = pages[pages.length - 2]
        find.onPullDownRefresh()
      
      })
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
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

  }
})