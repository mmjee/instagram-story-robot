const fs = require('fs').promises
const path = require('path')
const Config = require('isr/config')

const winston = require('winston')
const InstagramManager = require('isr/instagram')

const configFilePath = Config.TimestampFile || 'next_execution_timestamp'

async function executeScrape (time) {
  const timeNow = new Date()
  await Promise.all(Config.Targets.targets.map(async un => {
    winston.info({
      message: 'Started scraping',
      username: un
    })

    let folderPth
    if (Config.FolderFormat === 1) {
      folderPth = path.join(
        Config.BaseFolder,
        `${timeNow.getFullYear()}-${timeNow.getMonth() + 1}`,
        `${timeNow.getDate().toString()}/`,
        un
      )
    } else if (Config.FolderFormat === 2) {
      folderPth = path.join(
        Config.BaseFolder,
        un,
        `${timeNow.getFullYear()}-${timeNow.getMonth() + 1}`,
        `${timeNow.getDate().toString()}/`
      )
    } else {
      winston.error('Invalid Folder Format found: ' + Config.FolderFormat)
      process.exit(11)
    }
    await InstagramManager.scrapeStories(un, folderPth)
    winston.info({
      message: 'Done scraping',
      username: un
    })
  }))

  const nextTicker = time + (24 * 60 * 60 * 1000)
  const b = Buffer.alloc(8)
  b.writeDoubleLE(nextTicker)
  await fs.writeFile(configFilePath, b)
  setTimeout(() => executeScrape(nextTicker), nextTicker - Date.now())
}

async function main () {
  await InstagramManager.initialize()

  winston.info('Instagram initialized!')
  try {
    await fs.access(configFilePath)
  } catch (e) {
    await executeScrape(Date.now())
    return
  }
  const time1 = Date.now()
  // console.info('Time now:', time1)
  let nextTick = (await fs.readFile(configFilePath)).readDoubleLE()
  // console.info('Next tick read:', nextTick)
  const offset = time1 - Date.now()
  // console.info('Time that needs to be corrected:', offset)
  nextTick = nextTick + offset
  const timeRemaining = nextTick - Date.now()
  // console.info('Time remaining till next tick:', timeRemaining)

  setTimeout(() => executeScrape(nextTick), timeRemaining)
}

main().catch(e => console.error(e))
