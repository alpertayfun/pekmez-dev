/* 
***
    Pekmez Simple Web Server New Api Controller
***
*/

var jwToken = require("../security/jwToken");

exports.loginUser = function(req, res) {
    var token = jwToken.issue({test:"asdsad"});
    return res.send({token:token});
}

exports.new = function(req, res) {
    var token = jwToken.issue({test:"asdsad"});
    return res.send({token:token});
}

exports.index = function(req, res) {
    var token = jwToken.issue({test:"asdsad"});
    return res.send({token:token});
}
