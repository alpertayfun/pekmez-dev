/* 
***
    Pekmez Simple Web Server Setup File
***
*/

const { Command } = require('commander');
const program = new Command();

var ncp = require('ncp').ncp;

program.version('0.0.14');

program
  .option('-n, --new <newAppName>', 'new app name')
  .option('-p, --port <portNumber>', 'port number');

program.parse(process.argv);
if (program.new){
    console.log("new app " + program.new);
    if(program.port){
        console.log("port number " + program.port);
    }
}

// ncp("./", "./setupfile", function (err) {
//     if (err) {
//         return console.error(err);
//     }
//     console.log('done!');
// });