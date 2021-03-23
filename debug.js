const {DEBUG} = require('./settings');
module.exports = {
  debug: function() {
    if (DEBUG) console.log.call(console, arguments);   
  }
}
