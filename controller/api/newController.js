/* 
***
    Pekmez Simple Web Server New Api Controller
***
*/

var jwToken = require("../security/jwToken");

exports.loginUser = function(req, res) {
    if(req.isSocket){
        var token = jwToken.issue({test:"asdsad"});
        return res.send({token:token,socket:req.isSocket});
    }else{
        var token = jwToken.issue({test:"asdsad"});
        return res.send({token:token,socket:false});
    }
}

exports.new = function(req, res) {
    if(req.isSocket){
        var token = jwToken.issue({test:"asdsad"});
        return res.send({token:token,socket:req.isSocket});
    }else{
        var token = jwToken.issue({test:"asdsad"});
        return res.send({token:token,socket:false});
    }
}

exports.index = function(req, res) {
    if(req.isSocket){
        var token = jwToken.issue({test:"asdsad"});
        return res.send({token:token,socket:req.isSocket});
    }else{
        var token = jwToken.issue({test:"asdsad"});
        return res.send({token:token,socket:false});
    }
}
