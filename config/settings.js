/* 
***
    Easy Express Web Server settings file
***
*/

module.exports = {
    "secure":{
        "enable":false,
        "cert":"./ssl/server.cert",
        "key":"./ssl/server.key"
    },
    "port": "7777",
    "securePort": "7773",
    "publicDirectory":"assets",
    "htmlEngine":"ejs",
    "compression":true,
    "debug":true,
    "session":true,
    "secret":"9161bcb95e58da953276007ff37bd175",
    "jwt":true,
    "cluster":false,
    "cors":{
        "enable":true,
        "domain":"*",
        "method":"GET,HEAD,PUT,PATCH,POST,DELETE"
    },
    "dbConnection":{
        "enable":true,
        "dbType":"sqlite",
        "connectionURI": "sqlite::memory:"
    }
}