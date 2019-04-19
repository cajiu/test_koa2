const router = require('koa-router')()
const User = require('../models/user.mongo')
const crypto = require('crypto')

router.prefix('/users')

const newAvatar = () => {
  const avatars = [
    'http://image.nicai360.com/avator_1.png',
    'http://image.nicai360.com/avator_2.png',
    'http://image.nicai360.com/avator_3.png',
    'http://image.nicai360.com/avator_4.png',
    'http://image.nicai360.com/avator_5.png',
    'http://image.nicai360.com/avator_6.png',
    'http://image.nicai360.com/avator_7.png',
    'http://image.nicai360.com/avator_8.png',
    'http://image.nicai360.com/avator_9.png',
    'http://image.nicai360.com/avator_10.png',
    'http://image.nicai360.com/avator_11.png',
    'http://image.nicai360.com/avator_12.png',
    'http://image.nicai360.com/avator_13.png',
    'http://image.nicai360.com/avator_14.png',
    'http://image.nicai360.com/avator_15.png',
    'http://image.nicai360.com/avator_16.png',
    'http://image.nicai360.com/avator_17.png',
    'http://image.nicai360.com/avator_18.png',
    'http://image.nicai360.com/avator_19.png',
    'http://image.nicai360.com/avator_20.png',
  ]
  const ra = Math.ceil(Math.random() * 100000) % 20
  return avatars[ra]
}

//用户登录
router.post('/loginin',async  (ctx, next) => {
  const body = ctx.request.body
  try {
    const user = await User.findOne({ phone: body.phone, deleted: false })
    console.log(user,111)
    if (user) {
      const pwd_salt = `${body.pwd}${user.salt}`;
      const md5 = crypto.createHash('md5');
      md5.update(pwd_salt);
      const pwd_result = md5.digest('hex');
      if (pwd_result === user.pwd) {
        ctx.session.user = {
          _id: user._id,
          nickname: user.nickname,
          rights: user.rights,
          phone: user.phone,
          avatar: user.avatar,
        };
        ctx.body = {
          user: {
            _id: user._id,
            nickname: user.nickname,
            phone: user.phone,
            avatar: user.avatar,
            rights: user.rights,
          },
        };
        await User.updateOne({_id: user._id}, {$set: { last_login_time: new Date(), last_login_ip: ctx.ip }});
      } else {
        ctx.body = {
          error: true,
          msg: '密码错误',
          errorCode: 20071,
        };
      }
    } else {
      ctx.body = {
        error: true,
        msg: '用户不存在',
        errorCode: 20072,
      };
    }
  } catch (e) {
    console.log(e)
    ctx.body = {
      error: true,
      errorLog: e,
      msg: '登录出错',
      errorCode: 20070,
    };
  }
})

// 用户注册
router.post('/signup', async (ctx, next) => {
  const body = ctx.request.body
  try {
    const userByNickname = await User.findOne({ nickname: body.nickname, deleted: false });
    const userByPhone = await User.findOne({ phone: body.phone, deleted: false });
    if (userByNickname) {
      ctx.body = {
        error: true,
        msg: `昵称【${body.nickname}】已存在`,
      };
    } else if (userByPhone) {
      ctx.body = {
        error: true,
        msg: '该手机号已存在',
      };
    } else {
      if (body.nickname.length > 10) {
        ctx.body = {
          error: true,
          msg: `昵称长度不能大于10`,
        }
        return
      }

      const salt = String(Math.random()).substr(2,8)

      let pwd = null
      if (body.pwd) {
        const pwd_salt = `${body.pwd}${salt}`
        const md5 = crypto.createHash('md5')
        md5.update(pwd_salt)
        pwd = md5.digest('hex')
      }
      user = await User.create({
        avatar:  body.avatar || newAvatar(),
        nickname: body.nickname,
        phone: body.phone, // '用户手机号码',
        rights: [],
        reg_ip: ctx.ip, //
        pwd: pwd,
        salt:salt
      })
      ctx.session.user = {
        _id: user._id,
        nickname: user.nickname,
        rights: user.rights,
        phone: user.phone,
        avatar: user.avatar,
      }
      ctx.body = {
        msg: '注册成功',
        errorCode: 0,
        user: {
          users: await User.find({ phone: user.phone, deleted: false }, { nickname: true, avatar: true, rights: true, phone: true })
        }
      }
    }
  } catch(e) {
    ctx.body = {
      error: true,
      errorLog: e,
      msg: '注册出错',
    };
  }
})

//用户列表
router.get('/list',async (ctx, next) => {
  try {
    const query = ctx.request.query;
    const current = query.currentPage ? Number(query.currentPage) : 1;
    const pageSize = Number(query.pageSize) || 10;
    const condition = {deleted: false}
    if (query.search && query.search.nickname && query.search.nickname.trim()) {
      query.search.nickname = query.search.nickname.trim()
      const nickname = { $regex: query.search.nickname, $options: "i" };
      condition.nickname = nickname
    }
    if (query.search && query.search.phone && query.search.phone.trim()) {
      query.search.phone = query.search.phone.trim()
      condition.phone = query.search.phone
    }

    const list = await User.find(condition)
        .populate({
          path:'team_id',
          select: 'team_name'
        })
        .populate({
          path:'team_admin',
          select: 'team_name'
        })
        .skip(pageSize*(current -1)).limit(pageSize)
    const total = await User.countDocuments(condition)
    ctx.body = {
      list,
      pagination: {
        total,
        pageSize,
        current,
      },
    };
  } catch(e) {
    ctx.body = {
      error: true,
      errorLog: e,
      errorCode: 50001,
      msg: '获取出错',
    };
  }
})

//用户修改
router.put('/updateInfo',async (ctx, next) => {
  try {
    const body = ctx.request.body;
    let pwd ;
    const salt = String(Math.random()).substr(2,8);
    let user = ctx.session.user;
    if(body.pwd){
      const pwd_salt = `${body.pwd}${salt}`
      const md5 = crypto.createHash('md5')
      md5.update(pwd_salt)
      pwd = md5.digest('hex')
    }
    const updateInfo = {
      rights: body.rights ? body.rights : user.rights,
      nickname: body.nickname ? body.nickname : user.nickname,
      avatar: body.avatar ? body.avatar : user.avatar,
      pwd: body.pwd ? pwd : user.pwd,
    }
    if(body.pwd){
      updateInfo.salt = salt
    }

    await User.updateOne({ _id: user._id }, { $set:updateInfo });
    ctx.body = {
      msg: '修改成功',
    };
  }catch (e) {
    console.log(e)
    ctx.body = {
      error: true,
      errorLog: e,
      msg: '获取出错',
    };
  }
})

//用户删除
router.delete('/deleteUser',async (ctx, next) => {
  try {
    const body = ctx.request.body
    const item = await User.find({_id:body.user_id,deleted: false})
    if(item.length>0){
      console.log(item)
      await User.updateOne({_id:body.user_id},{$set:{deleted: true}})
      ctx.body = {
        msg:"删除成功"
      }
    }else{
      ctx.body = {
        msg:"用户不存在"
      }
    }
  }catch (e) {
    ctx.body = {
      error:e,
      msg:"请求失败"
    }
  }

})

module.exports = router
