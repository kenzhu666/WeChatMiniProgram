// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const result = await cloud.openapi.wxacode.getUnlimited({
    // 如果用户b扫了用户a的码买东西，用户a会有提成，这里通过openid判断是扫了用户a的码
    scene: wxContext.OPENID
  })
  const upload = await cloud.uploadFile({
    cloudPath:'qrcode/' + Date.now() + '-' + Math.random() + '.png',
    fileContent:result.buffer
  })
  return upload.fileID
}