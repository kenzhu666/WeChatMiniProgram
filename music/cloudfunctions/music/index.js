// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router') 

const BASE_URL = 'https://apis.imooc.com'
const ICODE = 'icode=25D0AE82B0A50C8E'
const axios = require('axios')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  app.router('playList', async(ctx,next) => {
    ctx.body = await cloud.database().collection('playList')
    .skip(event.start)
    .limit(event.count)
    .orderBy('createTime', 'desc')
    .get()
    .then((res)=>{
      return res
    })
    
  })

  app.router('musicList', async(ctx,next) => {
    const res = await axios.get(`${BASE_URL}/playlist/detail?id=${parseInt(event.playlistId)}&${ICODE}`)
    ctx.body = res.data
  })

  app.router('musicURL', async(ctx,next)=>{
    const res = await axios.get(`${BASE_URL}/song/url?id=${event.musicId}&${ICODE}`)
    ctx.body=res.data
  })

  app.router('lyric', async(ctx,next)=>{
    const res = await axios.get(`${BASE_URL}/lyric/url?id=${event.musicId}&${ICODE}`)
    ctx.body=res.data
  })

  return app.serve()
}