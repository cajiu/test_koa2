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

router.get('/', function (ctx, next) {
  ctx.body = 'this is a users response!'
})

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})


//用户登录
router.post('/loginin',async  (ctx, next) => {
  const body = JSON.parse(ctx.request.body)
  try {
    const user = await User.findOne({ phone: body.phone, deleted: false })
    if (user) {
      const pwd_salt = `${body.pwd}${user.salt}`;
      const md5 = crypto.createHash('md5');
      md5.update(pwd_salt);
      const pwd_result = md5.digest('hex');
      if (pwd_result === user.pwd) {
        ctx.body = {
          user: {
            _id: user._id,
            nickname: user.nickname,
            phone: user.phone,
            avatar: user.avatar,
            rights: user.rights,
          },
        };
        await User.update({_id: user._id}, {$set: { last_login_time: new Date(), last_login_ip: ctx.ip }});
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
        errorCode: 20001,
      };
    } else if (userByPhone) {
      ctx.body = {
        error: true,
        msg: '该手机号已存在',
        errorCode: 20002,
      };
    } else {
      if (body.nickname.length > 10) {
        ctx.body = {
          error: true,
          msg: `昵称长度不能大于10`,
          errorCode: 20003,
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
      errorCode: 20036,
    };
  }
})

module.exports = router
