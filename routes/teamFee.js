const router = require('koa-router')()
const User = require('../models/user.mongo')
const TeamFee = require('../models/teamFee.mongo')

router.prefix('/teamFee')

router.get('/list', async (ctx, next) => {
    try {
        const query = ctx.request.query
        const current = query.currentPage ? Number(query.currentPage) : 1;
        const pageSize = Number(query.pageSize) || 10;
        const condition = {}
        if (query.type) {
            condition.type = query.type
        }
        const user = await User.findOne({_id:ctx.session.user._id},{team_id:1})
        const teamFee = await TeamFee.find({team_id:user.team_id,...condition}).sort({create_time:-1})
              .skip(pageSize*(current -1)).limit(pageSize)
        ctx.body = {
            teamFee
        }
    }catch (e) {
        ctx.body = {
            error:true,
            msg:e
        }
    }
})

router.post('/addRecord', async (ctx, next) => {
    try {
        const body = ctx.request.body
        if(ctx.session.user.isAdmin){
            const user = await User.findOne({_id:ctx.session.user._id},{team_id:1})
            let total = 0
            // user.team_id
            const teamFee = await TeamFee.find({team_id:user.team_id}).sort({create_time:-1})
            if(teamFee[0]&&teamFee[0].total){
                total = teamFee[0].total
            }
            if(body.type==1){
                await TeamFee.create({
                    type:1,
                    fee:body.fee,
                    case:body.case,
                    team_id:user.team_id,
                    total:Number(total)+Number(body.fee),
                    create_time:new Date()
                })
            }else{
                await TeamFee.create({
                    type:2,
                    fee:body.fee,
                    case:body.case,
                    team_id:user.team_id,
                    total:total-body.fee,
                    create_time:new Date()
                })
            }
            ctx.body = {
                msg:'添加记录成功'
            }
        }else{
            ctx.body = {
                msg:'无权操作',
                error:true
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
