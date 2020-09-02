/* 
***
    Pekmez Simple Web Server Main Server File
***
*/


const process = require('process');
const fs = require('fs');
var settings = require('./config/settings.json');
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


module.exports = {

  init: function(){
    function checkDb() {
      if(settings.dbConnection.enable){
        //checking database first
        if(settings.dbConnection.dbType=="sqlite"){
          const sequelize = new Sequelize('sqlite::memory:');
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
      if (fs.existsSync("./config/settings.json")) {
        if(settings){
            if(settings.secure.enable){
              log(chalk.green(`        Pekmez Simple Web Server Inıt : `+ settings.securePort));
            }else{
              log(chalk.green(`        Pekmez Simple Web Server Inıt : `+ settings.port));
            }
            checkDb();
        }else{
          log(chalk.red("Wrong Json File!"));
        }
      }else{
        log(chalk.red("Settings Json File Not Found!"));
      }
    } catch(err) {
      log(chalk.red(err));
    }
  },
  start: function(){
    try {
      if (fs.existsSync("./config/settings.json")) {
        if(settings){
          var express = require('express');
          var ejs = require('ejs');
          var cookieParser = require('cookie-parser');
          var bodyParser = require('body-parser');
          var methodOverride = require('method-override');
          var favicon = require('serve-favicon');
          var cors = require('cors');
          const router = express.Router();
          var app = express();
          var expiryDate = new Date(Date.now() + 60 * 60 * 1000);
          var compression = require('compression');

          if(settings.session){
            var session = require('express-session');
            app.use(session({secret:settings.secret,resave:false,saveUninitialized:true,cookie: { maxAge: expiryDate.getTime() ,secure: true }}));
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
          if(settings.compression){
            app.use(compression());
          }
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
            var server = require('https').createServer({
              key: fs.readFileSync(settings.secure.key),
              cert: fs.readFileSync(settings.secure.cert)
            },app);
            port = settings.securePort;
          }else{
            var server = require('http').createServer(app);
            port = settings.port;
          }
          var io = require('socket.io')(server);
    
         
    
          router.get("/", function(req,res) {
            res.render('./index.ejs');
            setTimeout(function(){
              io.emit("greetings", "Welcome Pekmez Simple Web Server");
            }, 500);
          });

          const testFolder = './controller/api/';

          fs.readdirSync(testFolder).forEach(file => {
            var fileExt = file.split(".");
            if(fileExt[1]=="js"){
              require('./controller/api/' + file)(router);
            }
          });
          
          app.use("/", router);

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
                      if(socket.handshake.headers.hasOwnProperty("x-clientid")){
                          if(settings.debug) console.log(socket.handshake.headers["x-clientid"]);
                      }else{
                        io.sockets.connected[socket.id].disconnect();
                      }
                    }else if(socket.handshake.query.type=="java" || socket.handshake.query.type=="ios" || socket.handshake.query.type=="other"){

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
          });
          
          io.use((socket, next) => {
            let clientId = socket.handshake.headers['x-clientid'];
            if(settings.debug) log(`Socket Client ID : ${chalk.green(clientId)} `);
            return next();
            //return next(new Error('authentication error'));
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
    
          process.on('exit', function(code) {
            if(signalExit==2 || signalExit==3){
                process.exit();
            }
          });
          process.on('SIGINT', function(){
            signalExit++;
            if(signalExit==2 || signalExit==3){
              process.exit();
            }else{
              log(chalk.red("Are you exit Pekmez Simple web Server ?"));
            }
          });
        }else{
          log(chalk.red("Wrong json file!"));
        }
      }else{
        log(chalk.red("Settings Json File Not Found!"));
      }
    } catch(err) {
      log(chalk.red(err));
    }
  }
}