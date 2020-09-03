/* 
***
    Pekmez Simple Web Server Main Application
***
*/

var pekmez = require("./server");
var settings = require('./config/settings.js');
var cluster = require('cluster');
const chalk = require('chalk');
const log = console.log;
const fs = require('fs');

try {
    if (fs.existsSync("./config/settings.js")) {
      if(settings){
            if(settings.cluster){
                if (cluster.isMaster) {
                    var cpuCount = require('os').cpus().length;
                    for (var i = 0; i < cpuCount; i += 1) {
                        cluster.fork();
                    }
                }else{
                   pekmez.init();
                   pekmez.start();
                }
            }else{
                pekmez.init();
                pekmez.start();
            }
      }else{
        log(chalk.red("Wrong Js File!"));
      }
    }else{
      log(chalk.red("Settings Js File Not Found!"));
    }
  } catch(err) {
    log(chalk.red(err));
  }

