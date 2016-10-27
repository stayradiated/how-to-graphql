const casual = require('casual')
const fs = require('fs')

const titlegen = require('titlegen').create()
titlegen.feed(fs.readFileSync('movies.txt', 'utf-8').split('\n'))

module.exports = class Store {
  constructor () {
    this.users = []
    this.videos = []
  }

  getUser (id) {
    return this.users.find((user) => user.id === id)
  }

  getUsers (ids) {
    return ids.map(this.getUser, this)
  }

  getAllUsers () {
    return this.users
  }

  getVideo (id) {
    return this.videos.find((video) => video.id === id)
  }

  getVideos (ids) {
    return ids.map(this.getVideo, this)
  }

  getAllVideos () {
    return this.videos
  }

  populate (userCount = 15, videoCount = 50) {
    for (let i = 0; i < userCount; i++) {
      this.createUser()
    }
    for (let i = 0; i < userCount * 2; i++) {
      this.followUser()
    }
    for (let i = 0; i < videoCount; i++) {
      this.createVideo()
    }
    return this
  }

  createUser (name) {
    const id = this.users.length

    this.users.push({
      id,
      username: name || casual.username,
      videos: [],
      followers: [],
    })

    return this.getUser(id)
  }

  followUser () {
    const userA = casual.random_element(this.users)
    const userB = casual.random_element(this.users)
    userA.followers.push(userB.id)
    userA.followers = [...new Set(userA.followers)]
  }

  createVideo () {
    const id = this.videos.length
    const user = casual.random_element(this.users)

    const url = `https://${casual.ip}/videos/${id}`

    this.videos.push({
      id,
      user: user.id,
      title: titlegen.next(),
      source: {
        low: `${url}.360.mp4`,
        med: `${url}.720.mp4`,
        high: `${url}.1080.mp4`,
      },
    })

    user.videos.push(id)
  }
}
