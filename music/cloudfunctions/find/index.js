// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const TcbRouter = require('tcb-router')
const db = cloud.database()
const blogCollection = db.collection('blog')
const MAX_EACHTIME = 100

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({event})

  app.router('list', async(ctx,next)=>{
    const keyword = event.keyword
    let find = {}
    if(keyword.trim() != ''){
      find = {
        content: new db.RegExp({
          regexp:keyword, 
          options:'i'
        })
      }
    }
    let blogList = await blogCollection.where(find).skip(event.start).limit(event.count).orderBy('createTime', 'desc').get().then(res=>{
      return res.data
    })
    ctx.body = blogList
  })

  app.router('detail', async(ctx,next)=>{
    let blogId = event.blogId
    // 详情查询
    let detail = await blogCollection.where({
      _id: blogId
    }).get().then(res => {
      return res.data
    })

    // 评论查询
    const totalCount = await db.collection('blog-comment').where({ blogId }).count()
    const total = totalCount.total
    let commentList = {
      data:[]
    }

    if(total > 0){
      const tasks = []
      const fetchTimes = Math.ceil(total/MAX_EACHTIME)
      for(let i =0; i<fetchTimes; i++){
        let promise = await db.collection('blog-comment').skip(i*MAX_EACHTIME).limit(MAX_EACHTIME).where({
          blogId
        }).orderBy('createTime', 'desc').get()
        tasks.push(promise)
      }
      if(tasks.length > 0){
        commentList = (await Promise.all(tasks)).reduce((acc, cur) => {
          return{
            data:acc.data.concat(cur.data)
          }
        })
      }
    }

    ctx.body = {
      commentList,
      detail
    }
  })

  const wxContext = cloud.getWXContext()
  app.router('getBlogOpenid', async(ctx,next) => {
    ctx.body = await blogCollection.where({
      _openid:wxContext.OPENID
    }).skip(event.start).limit(event.count).orderBy('createTime', 'desc').get().then(res=>{
      return res.data
    })
  })

  return app.serve()
  
}