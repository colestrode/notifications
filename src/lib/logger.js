var winston = require('winston');

// log levels: error, warn, info, verbose, debug, silly
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      // handle logging uncaughtException
      handleExceptions: true,
      humanReadableUnhandledException: true,
      timestamp: function() {
        return new Date().toISOString();
      },
      formatter: function(options) {
        // Return string will be passed to logger.
        var message = (options.message ? options.message : '');

        if (options.meta && options.meta.stack) {
          message += '\n' + options.meta.stack.join('\n');
        }

        return options.level.toUpperCase() + ' ' + options.timestamp() + ' ' + message;
      }
    })
  ]
});

module.exports = logger;
