const {makeExecutableSchema} = require('graphql-tools')

const Store = require('./store')
const store = new Store()
store.populate()

const typeDefs = `
schema {
  query: Query
  mutation: Mutation
}

type Query {
  user(id: Int!): User
  users: [User]
}

type Mutation {
  createUser(name: String!): User
}

type User {
  id: Int
  username: String
  videos: [Video]
  followers: [User]
}

type Video {
  id: Int
  title: String
  user: User
  source: VideoSource
}

type VideoSource {
  low: String
  med: String
  high: String
}
`

const resolvers = {
  Query: {
    user: (_, {id}) => store.getUser(id),
    users: () => store.getAllUsers(),
  },

  Mutation: {
    createUser: (_, {name}) => store.createUser(name),
  },

  User: {
    videos: (user) => store.getVideos(user.videos),
    followers: (user) => store.getUsers(user.followers),
  },

  Video: {
    user: (video) => store.getUser(video.user),
  },
}

const schema = makeExecutableSchema({typeDefs, resolvers})
module.exports = schema
