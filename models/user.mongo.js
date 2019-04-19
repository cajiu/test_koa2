const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;


const schema = new Schema({
    nickname: { type: String, default: '' }, // '昵称',
    phone: { type: String, default: '' }, // '用户手机号码',
    avatar: { type: String, default: '' },
    create_time: { type: Date, default: new Date()}, // '用户创建时间',
    rights: { type: Array, default: [] }, // '用户权限 100 视频下载 1 写手 2 团队管理 3 创建项目  5 发稿  6 审稿  7 财务 8 后台管理 10 任务管理',
    reg_ip: { type: String, default: '' }, //
    pwd: { type: String, default: '' },
    deleted: { type: Boolean, default: false },
    last_login_time: { type: Date },
    last_login_ip: { type: String, default: ''}, //
    salt:{type: String,default: ''},
    team_id:{type:ObjectId,ref:'team'}
});

module.exports = mongoose.model('user', schema);


// db.users.find().forEach(function(item){
//   db.users.update({"_id":item._id},{"$set":{"nickname":item.name}})
// });