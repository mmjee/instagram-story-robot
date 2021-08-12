const fs = require('fs')
const toml = require('toml')
const winston = require('winston')

let Cfg = {}
{
  const fp = fs.readFileSync(process.env.CONFIG_PATH || 'config.toml').toString()
  Cfg = toml.parse(fp)
}
{
  const transports = []
  transports.push(new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize({ level: true }), winston.format.prettyPrint(), winston.format.simple()),
    level: 'info'
  }))

  const lineFmt = winston.format.combine(winston.format.timestamp(), winston.format.json())

  if (process.env.ISR_ENABLE_FILE_LOGGING === 'yes') {
    transports.push(new winston.transports.File({ filename: 'data/debug.log', level: 'debug' }), new winston.transports.File({ filename: 'data/error.log', level: 'error' }))
  }

  winston.configure({
    level: 'debug',
    format: lineFmt,
    defaultMeta: { service: 'isr' },
    transports
  })
}
module.exports = Cfg
