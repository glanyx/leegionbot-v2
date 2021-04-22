import log4js from 'log4js'

log4js.configure({
  appenders: {
    console: {
      type: 'console'
    },
    all: {
      type: 'file',
      filename: `${process.cwd()}/logs/app.log`
    },
    errors: {
      type: 'file',
      filename: `${process.cwd()}/logs/errors.log`
    },
    'errors-only': {
      type: 'logLevelFilter',
      appender: 'errors',
      level: 'error'
    }
  },
  categories: {
    default: { 
      appenders: [
        'console',
        'all',
        'errors-only'
      ],
      level: 'debug'
    }
  }
})

const logger = log4js.getLogger()

logger.info('Starting logs..')

export default logger