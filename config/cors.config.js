module.exports = {
    'default': 'http://localhost:3000',
    domain: /^http:\/\/([a-zA-Z0-9])+\.nicai360\.com/,
    whiteList: [
        'http://localhost', 'http://localhost:3000', 'http://localhost:8000', 'http://localhost:8001',
        'http://127.0.0.1', 'http://127.0.0.1:3000', 'http://127.0.0.1:8000', 'http://127.0.0.1:8001', 'http://127.0.0.1:8081',
        'http://120.27.215.205', 'http://60.191.28.82',
    ],
}


// console.log(module.exports.domain.test('http://HVIBI.nicai360.com'));