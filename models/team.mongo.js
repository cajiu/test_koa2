const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;


const schema = new Schema({
    team_name: { type: String, default: '' }, // '团队名称',
    create_time: { type: Date, default: new Date()}, // '创建时间',
    team_admin:{type:ObjectId,ref:'user'} //团队管理员
});

module.exports = mongoose.model('team', schema);
