const ProductHunt = require('producthunt')
const Promise = require('bluebird')

const {GraphQLSchema, GraphQLObjectType, GraphQLString} = require('graphql')
const Express = require('express')
const {graphqlExpress} = require('graphql-server-express')
const bodyParser = require('body-parser')

const PORT = process.env.PORT || 5000

// TODO: security this up a tad
const productHunt = new ProductHunt({
	client_id: process.env.CLIENT_ID,
	client_secret: process.env.CLIENT_SECRET,
	grant_type: 'client_credentials',
})

Promise.promisifyAll(productHunt.live)

// List all live events and filter by category
// productHunt.live.indexAsync({search: {category: 'tech'}}).then((res) => {
// 	console.log(res.body)
// })


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

const app = new Express()

app.use('/graphql', bodyParser.json(), graphqlExpress({schema}))

app.listen(PORT, () => console.log(`Started server on port: ${PORT}`))
