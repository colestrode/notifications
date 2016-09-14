var winston = require('winston');

// log levels: error, warn, info, verbose, debug, silly
module.exports = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      // handle logging uncaughtException
      handleExceptions: true,
      humanReadableUnhandledException: true,
      formatter: function(options) {
        // Return string will be passed to logger.
        var message = (options.message ? options.message : '');
        var now = new Date().toISOString();

        if (options.meta && options.meta.stack) {
          message += '\n' + options.meta.stack.join('\n');
        }

        return options.level.toUpperCase() + ' ' + now + ' ' + message;
      }
    })
  ]
});
