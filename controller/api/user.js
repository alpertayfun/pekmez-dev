/* 
***
    Pekmez Simple Web Server User Api Controller
***
*/

var jwToken = require("../security/jwToken");

module.exports = function(router){

  router.all('/user', function(req, res){
    var token = jwToken.issue({test:"asdsad"});
    jwToken.verify(token,function(err,data){
      console.log(data);
    });
    return res.send({token:token});
  });

}