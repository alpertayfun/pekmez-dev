module.exports = function(app,files){

  app.use('/api/user',require('../controller/api/user'));
}