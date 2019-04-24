const router = require('koa-router')()
const Team = require('../models/team.mongo')
const User = require('../models/user.mongo')
const Message = require('../models/message.mongo')
const crypto = require('crypto')

router.prefix('/teams')

router.post('/creatTeam',async (ctx, next) => {
    try {
        const body = ctx.request.body
        if(!ctx.session.user._id){
            ctx.body = {
                error: true,
                msg: '用户id错误'
            }
        }else{
            const hasTeam = await User.find({_id:ctx.session.user._id,team_id:{"$exists":true}})
            const tnull = hasTeam.find(it=>{
                if(it.team_id){
                    return it
                }
            })
            const nameExists = await Team.find({team_name:body.teamName})
            if(tnull&&tnull.length>0){
                ctx.body = {
                    error: true,
                    msg: '用户已有团队'
                }
            } else if(nameExists.length>0){
                ctx.body = {
                    error: true,
                    msg: '团队名称已存在'
                }
            } else{
                 await Team.create({
                    team_name:body.teamName,
                    team_admin:ctx.session.user._id
                })
               const team = await Team.findOne({
                   team_name:body.teamName
               }).populate({
                    path:'team_admin',
                    select: 'nickname'
                })
                await User.updateOne({ _id:ctx.session.user._id,deleted: false },{ $set:{team_id:team._id}})
                ctx.body = {
                    msg: '创建成功',
                    team,
                }
            }


        }
    }catch (e) {
        console.log(e)
        ctx.body = {
            error: true,
            msg: e
        }
    }
})

router.get('/list',async (ctx, next) => {//TODO:通过查团队管理员
    try {

        const query = ctx.request.query
        const current = query.currentPage ? Number(query.currentPage) : 1;
        const pageSize = Number(query.pageSize) || 10;
        const condition ={}
        if (query.search && query.search.trim()) {
            query.search = query.search.trim()
            const regex = { $regex: query.search, $options: "i" };
            condition.team_name = regex
        }

        const team = await Team.find(condition)
            .populate({
                path:'team_admin',
                select: 'nickname'
            })
            .skip(pageSize*(current -1)).limit(pageSize)
        const total = await Team.countDocuments(condition)
        ctx.body={
            team,
            pagination: {
                total,
                pageSize,
                current,
            },
         }

    }catch (e) {
        ctx.body = {
            error:true,
            msg:e
        }
    }
})

router.delete('/deleteTeam',async (ctx,next) => {
    try {
        const body = ctx.request.body
        if(!body.teamId){
            ctx.body = {
                error:true,
                msg:"参数错误"
            }
        }else{
            const hasExists = await Team.find({_id:body.teamId})
            if(hasExists.length>0){
                await Team.deleteOne({_id:body.teamId})
                const user = await User.find({team_id:body.teamId})
                if(user.length>0){
                    await User.update({team_id:body.teamId},{$set: {team_id:null}})
                }
                ctx.body = {
                    msg:'删除成功'
                }
            }else{
                ctx.body = {
                    error:true,
                    msg:'团队不存在'
                }
            }
        }
    }   catch (e) {
        console.log(e)
        ctx.body = {
            error:true,
            msg:e
        }
    }
})

router.post('/applyAddTeam',async (ctx,next) => {
    try {
        const body = ctx.request.body
        if(!body.teamId){
            ctx.body = {
                error : true,
                msg : '参数错误'
            }
        }
        const hasTeam = await User.find({_id:ctx.session.user._id,team_id:{"$exists":true}})
        const tnull = hasTeam.find(it=>{
            if(it.team_id){
                return it
            }
        })
        if(tnull&&tnull.length>0){
            ctx.body = {
                error : true,
                msg : '已有团队'
            }
        }else{
            const team = await Team.find({_id:body.teamId})
            const message =  await Message.find({fromUser: ctx.session.user._id,type:'3',teamId:team[0]._id})
            if(message.length>0){//申请用户如果已经申请过了 只更新时间
                await Message.updateOne({_id:message._id},{$set:{create_time:new Date()}})
                ctx.body = {
                    msg : '已发送申请'
                }
            }else if(team.length>0){
                await  Message.create({
                    type:3,
                    msg:`${ctx.session.user.nickname}申请加入${team[0].team_name}团队`,
                    fromUser: ctx.session.user._id,
                    toUser: team[0].team_admin,
                    teamId: team[0]._id
                })
                ctx.body = {
                    msg : '已发送申请'
                }
            }else{
                ctx.body = {
                    error : true,
                    msg : '团队不存在'
                }
            }
        }
    }catch (e) {
        console.log(e)
        ctx.body = {
            msg: e
        }
    }
})

router.get('/teamUser',async (ctx, next) => {
    try {
        const query = ctx.request.query
        const current = query.currentPage ? Number(query.currentPage) : 1;
        const pageSize = Number(query.pageSize) || 10;
        const condition ={deleted: false}
        if (query.nickname && query.nickname.trim()) {
            query.nickname = query.nickname.trim()
            const regex = { $regex: query.nickname, $options: "i" };
            condition.nickname = regex
        }
        if(query.TeamId){
            condition.team_id = query.TeamId
        }else {
            const user = await User.findOne({_id:ctx.session.user._id})
            if(user.team_id){
                condition.team_id = user.team_id
            }else {
                ctx.body = {
                    error:true,
                    msg:'暂无团队'
                }
            }
        }
        const teamUser = await User.find(condition)
            .skip(pageSize*(current -1)).limit(pageSize)
        const total = await User.countDocuments(condition)
        ctx.body={
            teamUser,
            pagination: {
                total,
                pageSize,
                current,
            },
        }
    }catch (e) {
        ctx.body = {
            error:true,
            msg:e
        }
    }
})

router.put('/deleteOne',async (ctx, next) => {
    try {
        const body = ctx.request.body
        if(!ctx.session.user.isAdmin){
            ctx.body = {
                error:true,
                msg:'无权操作'
            }
        }else if (body.membersId == ctx.session.user._id) {
            ctx.body = {
                error:true,
                msg:'不能删除自己'
            }
        }else{
            const team = await Team.findOne({team_admin: ctx.session.user._id})
            const user = await User.findOne({_id:body.membersId,team_id:team._id})
            if(user&&user._id){
                await User.updateOne({team_id:team._id,_id:body.membersId},{$set: {team_id:null}})
                await Message.create({
                    type:1,
                    msg:`你已被移除团队`,
                    fromUser: ctx.session.user._id,
                    toUser: body.membersId,
                })
                ctx.body = {
                    msg:'移除成功'
                }
            } else {
                ctx.body = {
                    error:true,
                    msg:'该用户不是本团队的'
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

router.post('/invitationAddTeam',async (ctx,next) => {
    try {
        const body = ctx.request.body
        if(ctx.session.user.isAdmin){
            console.log("isAdmin",ctx.session.user.isAdmin)
            if(!body.userId){
                ctx.body = {
                    error : true,
                    msg : '参数错误'
                }
            }else{
                const hasTeam = await User.find({_id:body.userId,team_id:{"$exists":true}})
                const tnull = hasTeam.find(it=>{
                    if(it.team_id){
                        return it
                    }
                })
                if(tnull&&tnull._id){
                    ctx.body = {
                        error : true,
                        msg : '对方已有团队'
                    }
                }else{
                    const team = await Team.findOne({team_admin:ctx.session.user._id})
                    const message =  await Message.find({toUser: body.userId,type:'2',teamId:team._id})
                    if(message&&message._id){//如果已经邀请过了 只更新时间
                        await Message.updateOne({_id:message._id},{$set:{create_time:new Date()}})
                        ctx.body = {
                            msg : '已发送邀请'
                        }
                    }else{
                        await  Message.create({
                            type:2,
                            msg:`${ctx.session.user.nickname}邀请你加入${team.team_name}团队`,
                            fromUser: ctx.session.user._id,
                            toUser: body.userId,
                            teamId: team._id
                        })
                        ctx.body = {
                            msg : '已发送邀请'
                        }
                    }
                }
            }
        }else{
            ctx.body = {
                error:true,
                msg:'无权操作'
            }
        }


    }catch (e) {
        console.log(e)
        ctx.body = {
            msg: e
        }
    }
})

module.exports = router
