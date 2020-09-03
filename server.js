/* 
***
    Pekmez Simple Web Server Main Server File
***
*/


const process = require('process');
const fs = require('fs');
var settings = require('./config/settings.js');
var signalExit = 0;
var keypress = require('keypress')
  , tty = require('tty');
keypress(process.stdin);

var commons = require("./lib/commons");
const chalk = require('chalk');
const log = console.log;
var path = require('path');
var os = require('os');
var md5 = require('md5');
const { Sequelize, Op, Model, DataTypes } = require("sequelize");
const mongoose = require('mongoose');
var pekmezVersion = "1.0.0";
var express = require('express');
var app = express();
var ejs = require('ejs');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var favicon = require('serve-favicon');
var cors = require('cors');
const router = express.Router();
var compression = require('compression');
var expiryDate = new Date(Date.now() + 60 * 60 * 1000);
var server,io;
var session , sharedsession;
const controllerDir = './controller/api/';
const modelDir = './controller/models/';
var sequelize;

module.exports = {

  init: function(){
    function checkDb() {
      if(settings.dbConnection.enable){
        //checking database first
        if(settings.dbConnection.dbType=="sqlite"){
          sequelize = new Sequelize('sqlite::memory:');
          sequelize
          .authenticate()
          .then(() => {
            log(chalk.green(`Database Worker : Connection has been established successfully.`));
          })
          .catch(err => {
            log(chalk.red(`Database Worker : Unable to connect to the database: `+ err));
            process.exit();
          });
        }
      }
    }
    try {
      if (fs.existsSync("./config/settings.js")) {
        if(settings){
            if(settings.secure.enable){
              log(chalk.green(`        Pekmez Simple Web Server Inıt : `+ settings.securePort));
            }else{
              log(chalk.green(`        Pekmez Simple Web Server Inıt : `+ settings.port));
            }
            checkDb();
        }else{
          log(chalk.red("Wrong Js File!"));
        }
      }else{
        log(chalk.red("Settings Js File Not Found!"));
      }
    } catch(err) {
      log(chalk.red(err));
    }
  },
  start: function(){
    try {
      if (fs.existsSync("./config/settings.js")) {
        if(settings){
          if(settings.session){
            session = require('express-session');
            app.use(session({secret:settings.secret,resave:true,saveUninitialized:true,cookie: { maxAge: expiryDate.getTime() ,secure: true }}));
            sharedsession = require("express-socket.io-session");

          }
          
          app.use(express.static(settings.publicDirectory));
          //app.use('/static', express.static('node_modules'));
          app.use(favicon(path.join(__dirname, settings.publicDirectory, 'favicon.ico')));
          app.use(cookieParser())
          app.use(bodyParser.urlencoded({ extended: false }));
          app.use(express.json());
          app.use(bodyParser.urlencoded({extended:true}));
          app.use(bodyParser.json());
          app.use(methodOverride());
          app.engine('.ejs', ejs.__express);
          app.set('views',__dirname+'/views');
          if(settings.compression){ app.use(compression()); }
          if(settings.cors){
            if(settings.cors.enable){
              app.use(cors({
                "origin": settings.cors.domain,
                "methods": settings.cors.method,
                "preflightContinue": false,
                "optionsSuccessStatus": 204
              }));
            }
          }

          function customHeaders( req, res, next ){
            app.disable('x-powered-by');
            const obj = JSON.parse(JSON.stringify(req.cookies));
            var sessionId = md5(commons.makeid(120));
            if(obj.hasOwnProperty("pekmezsession")){
              if(req.cookies.hasOwnProperty("pekmezsession")){
                req.session.pekmezsession = req.cookies.pekmezsession;
                res.cookie('pekmezsession', req.cookies.pekmezsession);
              }else{
                req.session.pekmezsession = sessionId;
                res.cookie('pekmezsession', sessionId);
              }
            }else{
              req.session.pekmezsession = sessionId;
              res.cookie('pekmezsession', sessionId);
            }
            if(settings.debug) log(`session Started : ${chalk.green(req.session.pekmezsession)} `);
            res.setHeader('x-powered-by', 'Pekmez Simple Web Server');
            next();
          }
        
          app.use( customHeaders );
          var port;
          if(settings.secure.enable){
            server = require('https').createServer({
              key: fs.readFileSync(settings.secure.key),
              cert: fs.readFileSync(settings.secure.cert)
            },app);
            port = settings.securePort;
          }else{
            server = require('http').createServer(app);
            port = settings.port;
          }

          io = require('socket.io')(server);
    
          router.get("/", function(req,res) {
            res.render('./index.ejs');
            setTimeout(function(){
              io.emit("greetings", "Welcome Pekmez Simple Web Server");
            }, 500);
          });

          var fileModel = [];

          fs.readdirSync(modelDir).forEach(file => {
            var fileExt = file.split(".");
            if(fileExt[1]=="js"){
              var modelFile = require(modelDir +"/" + file);
              var fileName = file.replace(".js","");
              var modelVar = {};
              console.log("len : " + Object.keys(modelFile.attributes).length);
              console.log(modelFile.attributes);

              if(Object.keys(modelFile.attributes).length>1){
                for (const [key, value] of Object.entries(modelFile.attributes)) {
                  console.log(key, value);
                  var keys = Object.keys(modelFile.attributes[key]);
                  console.log(keys);
                  keys.forEach(a => {
                    console.log(modelFile.attributes[key][a]);
                    if(a=="type"){
                      var converted = commons.convertModelDatatypes(modelFile.attributes[key][a],"");
                      modelFile.attributes[key][a] = DataTypes[converted];
                    }
                    if(a=="required"){
                      modelFile.attributes[key].allowNull = modelFile.attributes[key][a];
                      delete modelFile.attributes[key][a];
                    }
                  });
                }
                console.log("modelFile >>>>>>>>>>>>>");
                console.log(modelFile.attributes);
                console.log("modelFile >>>>>>>>>>>>>");
              }else{
                var keys = Object.keys(modelFile.attributes);
                console.log(keys);
                var keyOne = modelFile.attributes[keys[0]];
                console.log(keyOne);
                var keysOne = Object.keys(keyOne);
                console.log(keysOne);
                keysOne.forEach(a => {
                  console.log(modelFile.attributes[keys[0]][a]);
                  if(a=="type"){
                    var converted = commons.convertModelDatatypes(modelFile.attributes[keys[0]][a],"");
                    modelFile.attributes[keys[0]][a] = DataTypes[converted];
                    console.log("asdasd");
                    console.log(DataTypes[converted]);
                    console.log("asdasd");
                  }
                  if(a=="required"){
                    modelFile.attributes[keys[0]].allowNull = modelFile.attributes[keys[0]][a];
                    delete modelFile.attributes[keys[0]][a];
                  }
                });

                console.log("modelFile >>>>>>>>>>>>>");
                console.log(modelFile.attributes);
                console.log("modelFile >>>>>>>>>>>>>");

              }
              
              this[fileName] = sequelize.define(fileName, modelFile.attributes , {});

              console.log("model test");
              console.log(this[fileName] === sequelize.models[fileName]);
              console.log("model test");
              fileModel.push({fileName:file});

            }
          });
          console.log(fileModel);

          const project = this["Log"].findOne({ where: { logId: 'My Title' } });
          if (project === null) {
            console.log('Not found!');
          } else {
            console.log(project instanceof this["Log"]); // true
            console.log(project.title); // 'My Title'
          }

          var fileController = [];

          //adding sub dir into controller side
          var dirsa = commons.getDirectories(controllerDir);
          if(dirsa){
            var subDir = [];
            dirsa.forEach(a => {
              subDir.push({saltName:a.replace(/\/\//g, "/").replace(/\\/gi,"").replace("controllerapi",""),dirName: controllerDir +""+ a.replace(/\/\//g, "/").replace(/\\/gi,"").replace("controllerapi","")});
            });
            subDir.forEach(b => {
              var fileController = [];
              fs.readdirSync(b.dirName+"/").forEach(file => {
                  var fileExt = file.split(".");
                  if(fileExt[1]=="js"){
                    fileController.push({fileName:file});
                  }
              });
              fileController.forEach(f => {
                var controller = require(b.dirName +"/" + f.fileName);
                var keys = Object.keys(controller);
                keys.forEach(a => {
                  if(a=="index"){
                    router.get("/"+b.saltName+"/"+f.fileName.replace("Controller","").replace(".js","")+"/",controller[a]);
                    router.post("/"+b.saltName+"/"+f.fileName.replace("Controller","").replace(".js","")+"/",controller[a]);
                  }else{
                    router.get("/"+b.saltName+"/"+f.fileName.replace("Controller","").replace(".js","")+"/"+a,controller[a]);
                    router.post("/"+b.saltName+"/"+f.fileName.replace("Controller","").replace(".js","")+"/"+a,controller[a]);
                  }
                });
              });
            });
          }

          fs.readdirSync(controllerDir).forEach(file => {
             var fileExt = file.split(".");
             if(fileExt[1]=="js"){
               fileController.push({fileName:file});
             }
          });

          fileController.forEach(f => {
            var controller = require(controllerDir + f.fileName);
            var keys = Object.keys(controller);
            keys.forEach(a => {
              if(a=="index"){
                router.get("/"+f.fileName.replace("Controller","").replace(".js","")+"/",controller[a]);
                router.post("/"+f.fileName.replace("Controller","").replace(".js","")+"/",controller[a]);
              }else{
                router.get("/"+f.fileName.replace("Controller","").replace(".js","")+"/"+a,controller[a]);
                router.post("/"+f.fileName.replace("Controller","").replace(".js","")+"/"+a,controller[a]);
              }
            });
          });
          
          app.use("/", router);
          app.get('*', function (req, res) { res.render('./404.ejs'); });
          app.use(logErrors);
          app.use(errorHandler);
          function logErrors (err, req, res, next) { console.error(err.stack); next(err); }
          function errorHandler (err, req, res, next) {  res.status(500); res.render('./500.ejs', { error: err }); next(err); }
          server.listen(port,function(){
            log(chalk.green("/* ………………………………………………………………………………… */"));
            log(chalk.green(`        Server started! port: `+ port));
            log(`
            CPU: ${chalk.red(os.cpus().length)}
            RAM: ${chalk.green(commons.bytesToSize(os.freemem()))}
            UPTIME: ${chalk.green(os.uptime())}
            `);
            log(chalk.green("/* ………………………………………………………………………………… */"));
          });
    
          io.sockets.on('connection', function (socket) {
            if(settings.debug) log(chalk.greenBright("socket connected"));
            if(settings.debug) console.log(socket.handshake.query);
            if(socket.handshake){
              if(socket.handshake.headers){
                if(socket.handshake.query){
                  if(socket.handshake.query.hasOwnProperty("type")){
                    if(socket.handshake.query.type=="browser"){
                      if(socket.handshake.query.hasOwnProperty("version")){
                        if(socket.handshake.query.version==pekmezVersion){
                          //success version 
                          if(socket.handshake.headers.hasOwnProperty("x-clientid")){
                              if(settings.debug) console.log(socket.handshake.headers["x-clientid"]);
                          }else{
                            io.sockets.connected[socket.id].disconnect();
                          }
                        }else{
                          io.sockets.connected[socket.id].disconnect();
                        }
                      }else{
                        io.sockets.connected[socket.id].disconnect();
                      }
                    }else if(socket.handshake.query.type=="java" || socket.handshake.query.type=="ios" || socket.handshake.query.type=="other"){
                      if(socket.handshake.query.version==pekmezVersion){
                        if(socket.handshake.query.version==pekmezVersion){
                          //success version 
                        }else{
                          io.sockets.connected[socket.id].disconnect();
                        }
                      }else{
                        io.sockets.connected[socket.id].disconnect();
                      }
                    }else{
                      io.sockets.connected[socket.id].disconnect();
                    }
                  }else{
                    io.sockets.connected[socket.id].disconnect();
                  }
                }else{
                  io.sockets.connected[socket.id].disconnect();
                }
              }else{
                io.sockets.connected[socket.id].disconnect();
              }
            }else{
              io.sockets.connected[socket.id].disconnect();
            }
            socket.on('disconnect', function (socket) {
              if(settings.debug) log(chalk.yellowBright("socket disconnected"));
            });
            socket.on('post', function (data) {
              if(settings.debug) console.log(data);
              if(data.hasOwnProperty("url") && data.hasOwnProperty("method")){
                if(data.url && data.method){
                  var as = require("./controller/api/"+data.url+"Controller");
                  socket.send = function(data){ return data; };
                  io.isSocket = true;
                  data.data = as.new(io,socket);
                  io.to(socket.id).emit("post"+data.url,data);
                }else{
                  io.sockets.connected[socket.id].disconnect();
                }
              }else{
                io.sockets.connected[socket.id].disconnect();
              }
            });
            socket.on('get', function (data) {
              if(settings.debug) console.log(data);
              if(data.hasOwnProperty("url") && data.hasOwnProperty("method")){
                if(data.url && data.method){
                  var as = require("./controller/api/"+data.url+"Controller");
                  socket.send = function(data){ return data; };
                  io.isSocket = true;
                  data.data = as.new(io,socket);
                  io.to(socket.id).emit("post"+data.url,data);
                }else{
                  io.sockets.connected[socket.id].disconnect();
                }
              }else{
                io.sockets.connected[socket.id].disconnect();
              }
            });
          });
          
          io.use((socket, next) => {
            if(settings.session) sharedsession(session, {autoSave:true});
            let clientId = socket.handshake.headers['x-clientid'];
            if(settings.debug) log(`Socket Client ID : ${chalk.green(clientId)} `);
            if(clientId) {
              return next();
            }else{
              io.sockets.connected[socket.id].disconnect();
            }
          });
          
          process.stdin.on('keypress', function (ch, key) {
            if (key && key.ctrl && key.name == 'c') {
                signalExit++;
              if(signalExit==2 || signalExit==3){
                process.exit();
              }else{
                log(chalk.red("Are you exit Pekmez Simple Web Server ? yes(y) / no(n)"));
              }
            }
            if(key && key.name == 'y'){
              if(signalExit==1 || signalExit==2 || signalExit==3){
                process.exit();
              }
            }
            if(key && key.name == 'y'){
              signalExit = 0;
            }
          });
          
          if (typeof process.stdin.setRawMode == 'function') {
            process.stdin.setRawMode(true);
          } else {
            tty.setRawMode(true);
          }
          process.stdin.resume();
          process.on('exit', function(code) { if(signalExit==2 || signalExit==3){ process.exit(); } });
          process.on('SIGINT', function(){
            signalExit++;
            if(signalExit==2 || signalExit==3){
              process.exit();
            }else{
              log(chalk.red("Are you exit Pekmez Simple web Server ?"));
            }
          });
        }else{
          log(chalk.red("Wrong js file!"));
        }
      }else{
        log(chalk.red("Settings Js File Not Found!"));
      }
    } catch(err) {
      log(chalk.red(err));
    }
  }
}