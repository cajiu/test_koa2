const router = require('koa-router')()
const Message = require('../models/message.mongo')

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
        console.log("message",message)
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
        if(body.respond==='1'){
           const message =  await Message.find({_id:body.messageId})
               .populate({
                   path:'toUser',
                   select:"team_id"
               })
            await User.updateOne({ _id:ctx.session.user._id,deleted: false },{ $set:{team_id:message[0].toUser.team_id}})
            const team = Team
            await Message.create({
                type:1,
                msg:`你已成功加入${team[0].team_name}团队`,
                fromUser: ctx.session.user._id,
                toUser: team[0].team_admin
            })
        }else{
            ctx.body = {
                msg:"请求成功"
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
