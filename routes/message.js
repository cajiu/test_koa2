const router = require('koa-router')()
const Message = require('../models/message.mongo')
const User = require('../models/user.mongo')
const Team = require('../models/team.mongo')

router.prefix('/message')


router.get('/list', async (ctx, next) => {
    try {
        const query = ctx.request.query
        const current = query.currentPage ? Number(query.currentPage) : 1;
        const pageSize = Number(query.pageSize) || 10;
        const message = await Message.find({toUser:ctx.session.user._id})//
            .populate({
                path:'fromUser',
                select:'nickname'
            })
            .skip(pageSize*(current -1)).limit(pageSize)
        ctx.body = {
            message
        }
    }catch (e) {
        console.log(e)
        ctx.body = {
            error:true,
            msg:e
        }
    }
})

router.post('/applyRes', async (ctx, next) => {
    try {//1同意，2拒绝
        const body = ctx.request.body
        const message =  await Message.find({_id:body.messageId})
            .populate({
                path:'toUser',
                select:"team_id"
            })
        const team = await Team.findOne({_id:message[0].toUser.team_id})
        if(message[0].toUser._id != ctx.session.user._id){
            ctx.body = {
                error:true,
                msg:'无权操作'
            }
        }else if(message[0].type == 4){
                ctx.body = {
                    error:true,
                    msg:"该消息已处理"
                }
        }else {
            if (body.respond === '1'){
                const fUser = await User.find({_id:message[0].fromUser,team_id:{"$exists":true}})
                if(fUser.length>0){
                    await Message.updateOne({ _id:body.messageId },{ $set:{ type:4 } })
                    ctx.body = {
                        msg:'对方已加入其他团队'
                    }
                }else {
                    await User.updateOne({ _id:message[0].fromUser,deleted: false },{ $set:{team_id:team._id}})
                    await Message.create({
                        type:1,
                        msg:`你已成功加入${team.team_name}团队`,
                        fromUser: team.team_admin,
                        toUser: message[0].fromUser
                    })
                    await Message.updateOne({ _id:body.messageId },{ $set:{ type:4 } })
                    ctx.body = {
                        msg:'已同意'
                    }
                }
            }else if (body.respond === '2'){
                await Message.create({
                    type:1,
                    msg:`你申请加入${team[0].team_name}团队失败`,
                    fromUser: team[0].team_admin,
                    toUser: message[0].fromUser
                })
                await Message.updateOne({ _id:body.messageId },{ $set:{ type:4 } })
                ctx.body = {
                    msg:"已拒绝"
                }
            }
        }



    }catch (e) {
        console.log(e)
        ctx.body = {
            error:true,
            msg:e
        }
    }
})
module.exports = router
