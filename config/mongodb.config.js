module.exports = {
    production: {
        uri: 'mongodb://root:J7qgJ8QV5m47Nicai2017@dds-bp1804dae56b9ed41545-pub.mongodb.rds.aliyuncs.com:3717,dds-bp1804dae56b9ed42990-pub.mongodb.rds.aliyuncs.com:3717/xinyu?replicaSet=mgset-5010959',
        option: {
            useNewUrlParser: true,
            autoIndex: false, // Don't build indexes
            reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
            reconnectInterval: 1000, // Reconnect every 500ms
            poolSize: 10, // Maintain up to 10 socket connections
            // If not connected, return errors immediately rather than waiting for reconnect
            bufferMaxEntries: 0
        },
    },
    schedule: {
        uri: 'mongodb://root:J7qgJ8QV5m47Nicai2017@dds-bp1804dae56b9ed41545-pub.mongodb.rds.aliyuncs.com:3717,dds-bp1804dae56b9ed42990-pub.mongodb.rds.aliyuncs.com:3717/xinyu?replicaSet=mgset-5010959',
        option: {
            useNewUrlParser: true,
            autoIndex: false, // Don't build indexes
            reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
            reconnectInterval: 1000, // Reconnect every 500ms
            poolSize: 10, // Maintain up to 10 socket connections
            // If not connected, return errors immediately rather than waiting for reconnect
            bufferMaxEntries: 0
        },
    },
    test: {
        uri: 'mongodb://test:test2017@localhost:21021/xinyu_test',
        option: {
            useNewUrlParser: true,
            autoIndex: false, // Don't build indexes
            reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
            reconnectInterval: 1000, // Reconnect every 500ms
            poolSize: 10, // Maintain up to 10 socket connections
            // If not connected, return errors immediately rather than waiting for reconnect
            bufferMaxEntries: 0
        },
    },
    dev: {
        uri: 'mongodb://localhost:27017/ajiu_test',
        option: {
            useNewUrlParser: true,
            autoIndex: false, // Don't build indexes
            reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
            reconnectInterval: 1000, // Reconnect every 500ms
            poolSize: 10, // Maintain up to 10 socket connections
            // If not connected, return errors immediately rather than waiting for reconnect
            bufferMaxEntries: 0
        },
    },
}[process.env.NODE_ENV || 'dev']



// mongodump -h localhost:27017 -d xinyu -o ./back
// mongorestore --host dds-bp1804dae56b9ed41545-pub.mongodb.rds.aliyuncs.com:3717,dds-bp1804dae56b9ed42990-pub.mongodb.rds.aliyuncs.com:3717 --authenticationDatabase admin -u root -p Zhiliao20180102 -d xinyu --dir /data/back/xinyu
// mongo mongodb://root:Zhiliao20180102@dds-bp1804dae56b9ed41545-pub.mongodb.rds.aliyuncs.com:3717,dds-bp1804dae56b9ed42990-pub.mongodb.rds.aliyuncs.com:3717/admin?replicaSet=mgset-5010959


// mongodump -h dds-bp1804dae56b9ed41545-pub.mongodb.rds.aliyuncs.com:3717,dds-bp1804dae56b9ed42990-pub.mongodb.rds.aliyuncs.com:3717 -d xinyu -o ./back -u root -p J7qgJ8QV5m47qLSmnFJboR6Q_0cj6D0P1CldEkqd
// mongorestore --host localhost:27017 --authenticationDatabase xinyu_test -u test -p test2017.xinyu -d xinyu_test --dir /data/back/xinyu



// mongorestore --host localhost:27017 --authenticationDatabase xinyu_test -u test -p test2017.xinyu -d xinyu_test -c alimamaorderdetails ./back/xinyu/alimamaorderdetails.bson
// mongorestore --host localhost:27017 --authenticationDatabase xinyu_test -u test -p test2017.xinyu -d xinyu_test -c approvedatas ./back/xinyu/approvedatas.bson
// mongorestore --host localhost:27017 --authenticationDatabase xinyu_test -u test -p test2017.xinyu -d xinyu_test -c bpus ./back/xinyu/bpus.bson
// mongorestore --host localhost:27017 --authenticationDatabase xinyu_test -u test -p test2017.xinyu -d xinyu_test -c counters ./back/xinyu/counters.bson
// mongorestore --host localhost:27017 --authenticationDatabase xinyu_test -u test -p test2017.xinyu -d xinyu_test -c darens ./back/xinyu/darens.bson
// mongorestore --host localhost:27017 --authenticationDatabase xinyu_test -u test -p test2017.xinyu -d xinyu_test -c invitationcodes ./back/xinyu/invitationcodes.bson
// mongorestore --host localhost:27017 --authenticationDatabase xinyu_test -u test -p test2017.xinyu -d xinyu_test -c projects ./back/xinyu/projects.bson
// mongorestore --host localhost:27017 --authenticationDatabase xinyu_test -u test -p test2017.xinyu -d xinyu_test -c searchstatistics ./back/xinyu/searchstatistics.bson
// mongorestore --host localhost:27017 --authenticationDatabase xinyu_test -u test -p test2017.xinyu -d xinyu_test -c sms ./back/xinyu/sms.bson
// mongorestore --host localhost:27017 --authenticationDatabase xinyu_test -u test -p test2017.xinyu -d xinyu_test -c taobaoshops ./back/xinyu/taobaoshops.bson
// mongorestore --host localhost:27017 --authenticationDatabase xinyu_test -u test -p test2017.xinyu -d xinyu_test -c taskapproves ./back/xinyu/taskapproves.bson
// mongorestore --host localhost:27017 --authenticationDatabase xinyu_test -u test -p test2017.xinyu -d xinyu_test -c taskoperationrecords ./back/xinyu/taskoperationrecords.bson
// mongorestore --host localhost:27017 --authenticationDatabase xinyu_test -u test -p test2017.xinyu -d xinyu_test -c tasks ./back/xinyu/tasks.bson
// mongorestore --host localhost:27017 --authenticationDatabase xinyu_test -u test -p test2017.xinyu -d xinyu_test -c teams ./back/xinyu/teams.bson
// mongorestore --host localhost:27017 --authenticationDatabase xinyu_test -u test -p test2017.xinyu -d xinyu_test -c teamusers ./back/xinyu/teamusers.bson
// mongorestore --host localhost:27017 --authenticationDatabase xinyu_test -u test -p test2017.xinyu -d xinyu_test -c users ./back/xinyu/users.bson