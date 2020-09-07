// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db=cloud.database()
const axios = require('axios')
const URL = 'https://apis.imooc.com/personalized?icode=25D0AE82B0A50C8E'
const playListCollection = db.collection('playList')
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  // 1. ------------------- 数据多次获取 ------------------------
  const totalData = await playListCollection.count()
  const total = totalData.total
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  const promiseArr = []
  for(let i=0; i<batchTimes; i++){
    let promise = playListCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    promiseArr.push(promise)
  }
  let getData = {
    data:[]
  }
  if(promiseArr.length>0){
    getData = (await Promise.all(promiseArr)).reduce((acc, cur) => {
      return{
        data:acc.data.concat(cur.data)
      }
    })
  }


  // 2. ------------------- 从接口中往云数据库传入动态数据 ------------------------
  // 获取当前服务器端最新的歌单信息
  const { data } = await axios.get(URL)

  // 如果请求的url有问题
  if(data.code >= 1000){
    console.log(data.msg)
    return 0
  }
  // 最新的歌单信息
  const playList = data.result

  // playlist集合中已有的歌单信息
  //const getData = await playListCollection.get()
  const newData = []


  // 3. ------------------- 数据去重 ------------------------
  for(let i=0; i<playList.length; i++){
    let flag = true
    for(let j=0; j<getData.data.length; j++){
      if(playList[i].id === getData.data[j].id){
        flag = false
        break
      }
    }
      if(flag){
        let pl=playList[i]
        pl.createTime = db.serverDate()
        newData.push(pl)
      }
  }

  console.log(newData)

  if(newData.length>0){
    await playListCollection.add({
      // 只添加一次，把playList整个这个数组添加到playList集合中
      data:[...newData]
    }).then(res=>{
      console.log('插入成功')
    })
    .catch(err=>{
      console.log(err)
      console.error('插入失败')
    })
  }

  return newData.length
}