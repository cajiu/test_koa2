const router = require('koa-router')()
const Message = require('../models/message.mongo')

router.prefix('/message')


router.get('/list', async (ctx, next) => {
    try {
        const query = ctx.request.query
        const current = query.currentPage ? Number(query.currentPage) : 1;
        const pageSize = Number(query.pageSize) || 10;
        const message = await Message.find()//{toUser:ctx.session.user._id}
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

module.exports = router
