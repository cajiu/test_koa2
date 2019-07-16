const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const session = require('koa-session')
const logger = require('koa-logger')
const cors = require('kcors')
const mongoose  = require('mongoose');
mongoose.Promise = Promise;
const fs = require('fs');
const Cors = require('./config/cors.config');
// const mongodbConfig = require('./config/mongodb.config');
// mongoose.connect(mongodbConfig.uri, mongodbConfig.option);
mongoose.connect('mongodb://localhost:27017/test',{ useNewUrlParser: true })


const routes = fs.readdirSync('./routes').filter(item => /\.js$/.test(item)).map(item => require(`./routes/${item}`));

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

app.keys = ['ajiu123']
app.use(cors({
  credentials: true,
  origin: (ctx) => {
    return (Cors.whiteList.find(item => item === ctx.header.origin) || Cors.domain.test(ctx.header.origin)) ? ctx.header.origin : Cors.default;
  },
}));

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

const CONFIG = {
  key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};
app.use(session(CONFIG, app));

app.use(async (ctx, next)  => {
  // ignore
  if (ctx.path !== '/users/loginin' && ctx.path !== '/users/signup' && ctx.path !== "/shop/type" && ctx.path !== "/shop/list") {
    let user = ctx.session.user;
    if(!user){
      ctx.body = {
        msg:'用户未登录',
        error:true
      };
      return ctx.status = 401
    }else{
      await next()
    }
  }else {
    await next()
  }
});

// routes
routes.forEach(item => {
  app.use(item.routes(), item.allowedMethods())
});


// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

app.listen(3030)

module.exports = app
