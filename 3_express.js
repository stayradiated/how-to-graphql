const Express = require('express')
const bodyParser = require('body-parser')
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express')

// const schema = require('./1_schema')
const schema = require('./5_apollo')

const app = new Express()

app.use('/graphql', bodyParser.json(), graphqlExpress({
  schema,
}))

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}))

app.listen(5000, () => console.log('Listening on port 5000'))
