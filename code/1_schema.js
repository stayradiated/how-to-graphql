const {
  GraphQLSchema,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
} = require('graphql')

const Store = require('./store')
const store = new Store()
store.populate()

const VideoSourceType = new GraphQLObjectType({
  name: 'VideoSource',
  fields: {
    low: {type: GraphQLString},
    med: {type: GraphQLString},
    high: {type: GraphQLString},
  },
})

const VideoType = new GraphQLObjectType({
  name: 'Video',
  fields: () => ({
    id: {type: GraphQLInt},
    title: {type: GraphQLString},
    user: {
      type: UserType,
      resolve: (video) => store.getUser(video.user),
    },
    source: {type: VideoSourceType},
  }),
})

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {type: GraphQLInt},
    username: {type: GraphQLString},
    videos: {
      type: new GraphQLList(VideoType),
      resolve: (user) => store.getVideos(user.videos)
    },
    followers: {
      type: new GraphQLList(UserType),
      resolve: (user) => store.getUsers(user.followers)
    },
  }),
})

const QueryType = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    users: {
      type: new GraphQLList(UserType),
      resolve: () => store.getAllUsers(),
    },
    user: {
      type: UserType,
      args: {
        id: {type: new GraphQLNonNull(GraphQLInt)}
      },
      resolve: (context, args) => {
        const {id} = args
        return store.getUser(id)
      },
    },
  },
})

const MutationType = new GraphQLObjectType({
  name: 'Mutaton',
  fields: {
    createUser: {
      type: UserType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, args) => store.createUser(args.name)
    },
  },
})

const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
})

module.exports = schema
