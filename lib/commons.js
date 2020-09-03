/* 
***
    Easy Express Web Server commons library
***
*/

const fs = require('fs');
const path = require('path');


module.exports = {
  
  convertModelDatatypes: function(text,type){
    if(text=="string"){
      return "STRING";
    }else if(text=="number"){
      if(type){
        if(type=="FLOAT"){
          return "FLOAT";
        }else if(type=="INTEGER"){
          return "INTEGER";
        }else if(type=="REAL"){
          return "REAL";
        }else if(type=="DOUBLE"){
          return "DOUBLE";
        }else if(type=="DECIMAL"){
          return "DECIMAL";
        }
      }else{
        return "BIGINT";
      }
    }else if(text=="boolean"){
      return "BOOLEAN";
    }else if(text=="date"){
      return "DATE";
    }else if(text=="uuid"){
      return "UUID";
    }else if(text=="json"){
      return "STRING";
    }
  },
  bytesToSize: function(bytes){
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  },
  flatten: function(lists) {
    return lists.reduce((a, b) => a.concat(b), []);
  },
  getDirectories: function(srcpath) {
    return fs.readdirSync(srcpath)
      .map(file => path.join(srcpath, file))
      .filter(path => fs.statSync(path).isDirectory());
  },
  makeid: function(length){
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
};