const router = require('koa-router')()
const types = require('../public/jsons/types.json')
const goods = require('../public/jsons/goods.json')

router.prefix('/shop')

router.get('/type', async (ctx, next) => {
    try {
        ctx.body = {
            types
        }
    }catch (e) {
        ctx.body = {
            error:true,
            msg:e
        }
    }
})
router.get('/list', async (ctx, next) => {

    try {
        const query = ctx.request.query
        const current = query.currentPage ? Number(query.currentPage) : 1;
        const pageSize = Number(query.pageSize) || 10;

        let list = []
        let total = 0
        if(query.type && query.type != 0){
            list = goods.filter( item => item.type == query.type )
            total = list.length
        }else{
            list = goods
            total = list.length
        }

        if(query.searchValue){
            list = list.filter( item =>  item.name.indexOf(query.searchValue)!==-1 )
        }
        if(query.sort){
            if(query.sort==2){
                list.sort(function(a,b){
                    return query.sortType==1?a.sentiment-b.sentiment:b.sentiment-a.sentiment;
                })
            }else{
                list.sort(function(a,b){
                    return query.sortType==1?a.price-b.price:b.price-a.price;
                })
            }
        }else{
            list.sort(function(a,b){
                return a.productId-b.productId;
            })
        }

        const start = pageSize * (current - 1);
        const end = start + pageSize;

        list = list.slice(start, end);
        ctx.body = {
            list,
            pagination: {
                total:total,
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

module.exports = router
