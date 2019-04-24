const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;


const schema = new Schema({
    create_time: { type: Date, default: new Date() }, // '用户创建时间',
    type:{ type: String, default: ''},//  1.通知，2.邀请，3.申请，4.已处理
    fromUser:{ type:ObjectId, ref:'user' },
    toUser:{ type:ObjectId, ref:'user' },
    msg:{ type: String, default:'' },
    teamId: { type:ObjectId, ref:'team' },
});

module.exports = mongoose.model('message', schema);


// db.users.find().forEach(function(item){
//   db.users.update({"_id":item._id},{"$set":{"nickname":item.name}})
// });