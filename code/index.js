const ProductHunt = require('producthunt')
const CachedPromise = require('cached-promise')
const camelize = require('camelize')

const {GraphQLSchema, GraphQLObjectType, GraphQLString} = require('graphql')
const Express = require('express')
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express')
const bodyParser = require('body-parser')

const {makeExecutableSchema} = require('graphql-tools')

const PORT = process.env.PORT || 5000

const allPosts = new CachedPromise({
  maxAge: 1000 * 2,
  load: function (_, resolve, reject) {
    return productHunt.posts.all((err, res) => {
      if (err != null) {
        reject(err)
        return
      }

      const {posts} = JSON.parse(res.body)
      resolve(camelize(posts))
    });
  }
});

// TODO: security this up a tad
const productHunt = new ProductHunt({
	client_id: process.env.CLIENT_ID,
	client_secret: process.env.CLIENT_SECRET,
	grant_type: 'client_credentials',
})

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      author: {
        name: 'Author',
        type: GraphQLString,
        resolve: () => 'George Czabania',
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      log: {
        name: 'Log',
        type: GraphQLString,
        args: {
          value: {type: GraphQLString},
        },
        resolve: (_, args) => {
          console.log(args.value)
        },
      },
    },
  }),
})

const fancySchema = makeExecutableSchema({
  typeDefs: `
    type ImageURL {
      small: String
      medium: String
      large: String
      original: String
    }

    type Topic {
      id: Int
      name: String
      slug: String
    }

    type User {
      id: Int
      createdAt: String
      name: String
      username: String
      headline: String
      twitterUsername: String
      websiteUrl: String
      profileUrl: String
      imageUrl: ImageURL
    }

    type ScreenshotURL {
      small: String
      large: String
    }

    type Thumbnail {
      id: Int
      mediaType: String
      imageUrl: String
      # metadata: {}
    }

    type Post {
      categoryId: Int
      day: String
      id: Int
      name: String
      productState: String
      tagline: String
      commentsCount: Int
      createdAt: String
      # currentUser: {}
      discussionUrl: String
      # exclusive
      featured: Boolean
      markerInside: Boolean
      makers: [User]
      # platforms: []
      topics: [Topic]
      redirectUrl: String
      screenshotUrl: ScreenshotURL
      thumbnail: Thumbnail
      user: User
      votesCount: Int
    }

    type Query {
      posts: [Post],
    }

    schema {
      query: Query
    }
  `,
  resolvers: {
    Query: {
      posts: () => allPosts.get(),
    },
    ImageURL: {
      small: (image) => image['30px'],
      medium: (image) => image['30px'],
      large: (image) => image['30px'],
    }
  },
})

const app = new Express()

app.use('/graphql', bodyParser.json(), graphqlExpress({schema}))
app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}))

app.use('/graphql2', bodyParser.json(), graphqlExpress({schema: fancySchema}))
app.use('/graphiql2', graphiqlExpress({
  endpointURL: '/graphql2',
}))

app.listen(PORT, () => console.log(`Started server on port: ${PORT}`))
