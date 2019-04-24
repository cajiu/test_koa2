const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;


const schema = new Schema({
    create_time: { type: Date, default: new Date() }, // '创建时间',
    team_id: { type: ObjectId, ref: 'team'},//团队id
    total: { type: Number, default: 0 },//总团费
    fee: { type: Number, default: 0 },//变动费用
    case: { type: String, default: '' },//原因
    type: { type: Number, default: 1 },//1.增加 2.减少
});

module.exports = mongoose.model('team', schema);
