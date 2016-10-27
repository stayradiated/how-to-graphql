const {printSchema} = require('graphql')

const schema = require('./1_schema')

console.log(printSchema(schema))
