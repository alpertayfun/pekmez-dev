/* 
***
    Pekmez Simple Web Server User Api Controller
***
*/

 
var
  jwt = require('jsonwebtoken'),
  tokenSecret = "123asd123asd123..";

module.exports.issue = function(payload) {
  return jwt.sign(
    payload,
    tokenSecret,
    {expiresIn: '10h'}
  );
};

module.exports.verify = function(token, callback) {
  return jwt.verify(
    token, // The token to be verified
    tokenSecret, // Same token we used to sign
    {}, // No Option, for more see https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
    callback //Pass errors or decoded token to callback
  );
};


