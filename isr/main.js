/*
    An Instagram story scraping robot
    Copyright (C) 2021  Maharshi Mukherjee

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
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

  const nextTick = (await fs.readFile(configFilePath)).readDoubleLE()
  const timeRemaining = nextTick - Date.now()
  // console.info('Time remaining till next tick:', timeRemaining)

  setTimeout(() => executeScrape(nextTick), timeRemaining)
}

main().catch(e => console.error(e))
