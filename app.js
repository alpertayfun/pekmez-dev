/* 
***
    Pekmez Simple Web Server Main Application
***
*/

var pekmez = require("./server");
var settings = require('./config/settings.json');
var cluster = require('cluster');
const chalk = require('chalk');
const log = console.log;
const fs = require('fs');

try {
    if (fs.existsSync("./config/settings.json")) {
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
        log(chalk.red("Wrong Json File!"));
      }
    }else{
      log(chalk.red("Settings Json File Not Found!"));
    }
  } catch(err) {
    log(chalk.red(err));
  }

