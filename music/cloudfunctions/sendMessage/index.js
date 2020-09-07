// 云函数入口文件
const cloud = require('wx-server-sdk')

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext

  const result = await cloud.openapi.templateMessage.send({
      touser: OPENID,
      page:`/pages/find/find?blogId=${event.blogId}`,
      data:{
        time1:{
          value:event.createTime
        },
        thing3:{
          value:'评论完成'
        },
        phrase2:{
          value:event.content
        }
      },
      templateId:'Yp0n-8cN1fR8ieu5zn_peqJyBr0mwy1n_YpHQ4aAV5Q',
      formId:event.formId
    })

    return result
}