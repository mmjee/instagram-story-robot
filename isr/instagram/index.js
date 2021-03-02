const Config = require('isr/config')
const { IgApiClient } = require('instagram-private-api')

const _ = require('lodash')
const winston = require('winston')
const download = require('download')
const mkdirp = require('mkdirp')

class InstagramManagement {
  constructor () {
    this.instagram = new IgApiClient()
    this.instagram.state.generateDevice(Config.Instagram.Username)

    this.currentUser = null
  }

  async initialize () {
    await this.instagram.simulate.preLoginFlow()
    this.currentUser = await this.instagram.account.login(Config.Instagram.Username, Config.Instagram.Password)
    winston.debug('Current User:', this.currentUser)
    winston.info('Logged into Instagram.')
  }

  async saveFile (fileURL, baseFolder) {
    return download(fileURL.url, baseFolder)
  }

  findBestQuality (listOfVersions) {
    return _.first(listOfVersions.sort(v => v.height * v.width))
  }

  async saveStory (storyData, baseFolder) {
    switch (storyData.media_type) {
      case 1:
        await this.saveFile(this.findBestQuality(storyData.image_versions2.candidates), baseFolder)
        break
      case 2:
        await this.saveFile(this.findBestQuality(storyData.video_versions), baseFolder)
        break
      default:
        winston.error('Found unknown type of file:', storyData)
        break
    }
  }

  async scrapeStories (username, baseFolder) {
    await mkdirp(baseFolder)
    const storyFeed = this.instagram.feed.userStory(await this.instagram.user.getIdByUsername(username))
    await storyFeed.request()

    let resolve
    // eslint-disable-next-line promise/param-names
    const r = new Promise((rz) => {
      resolve = rz
    })
    storyFeed.items$.subscribe(
      storyList => {
        return storyList.map(s => this.saveStory(s, baseFolder))
      },
      error => winston.error(error),
      () => {
        winston.debug('Done scraping.')
        resolve()
      }
    )

    return r
  }
}

const im = new InstagramManagement()
module.exports = im
