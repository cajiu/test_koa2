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
            console.log("user",hasTeam)

            const nameExists = await Team.find({team_name:body.teamName})
            if(hasTeam.length>0){
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

    }
})

router.delete('/deleteOne',async (ctx,next) => {
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
                    await User.update({team_id:body.teamId},{$set: {team_id: null}})
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
        if(hasTeam.length>0){
            console.log("hasTeam",hasTeam.length)
            ctx.body = {
                error : true,
                msg : '已有团队'
            }
        }else{
            const team = await Team.find({_id:body.teamId})

            if(team.length>0){
                await  Message.create({
                    type:3,
                    msg:`${ctx.session.user.nickname}申请加入${team[0].team_name}团队`,
                    fromUser: ctx.session.user._id,
                    toUser: team.team_admin
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
module.exports = router
