/* 
***
    Pekmez Simple Web Server New Api Controller
***
*/

var jwToken = require("../security/jwToken");

module.exports = function(router){

  router.all('/new', function(req, res){
    var token = jwToken.issue({test:"asdsad"});
    return res.send({token:token});
  });

}