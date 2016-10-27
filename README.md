title: GraphQL
author:
  name: George Czabania
  twitter: stayradiated
style: style.css

--

# Intro to GraphQL

--

### What Am I Talking About

1. **Intro**: What is GraphQL and why it is so awesome
2. **Demo**: Querying a GraphQL server
3. **Tutorial**: How to setup a GraphQL server from scratch
4. **Challenges**: Things to consider

--

# What is GraphQL?

--

# It's a better way to fetch data

--

### About

GraphQL = Graph **Query Language**.

Built by Facebook several years ago, released as open source last year.

<img src="./docs/img/fb.png" class="center" />

It's a spec, and it's platform agnostic.

--

### REST

RESTful web API's can be pretty good.

- `GET /users/123`
- `POST /users`

<img src="./docs/img/cloud.png" class="center" />

--

#### But they can have some issues

When a client needs to make multiple requests to get all the data it needs.

- `GET /users/123`
- `GET /users/123/history`
- `GET /users/123/recommended`
- ...

--

![](./docs/img/rest_1.png)

--

#### How we can solve this

We could include extra information into a response.

Which would cut down the number of API calls we have to make.

But increases the size of the response.

- `GET /users/123`

--

![](./docs/img/rest_2.png)

--

#### Making it optional

We could add an option to embed the values we care about in the API.

`GET /videos/123?embed=history,recommended`

Then only the clients that need that info can request it

GraphQL takes this idea and builds a language out of it.

--

![](./docs/img/rest_3.png)

--

### Working with Multiple APIs

![](./docs/img/multiple_apis.png)

--

### Working with Multiple APIs

![](./docs/img/multiple_apis_2.png)

--

# A single request fulfils exactly the client's needs.

--

### Writing a Query

```
QUERY                                RESPONSE
=====                                ========

{                                    {
```
```
  user(id: 43) {                       "user": {
```
```
    name                                 "name": "John Smith",
```
```
    avatar {                             "avatar": {
      small                                "small": "http://...",
    }                                    }
```
```
    history {                            "history": [{
      title                                "title": "Video 1",
      date                                 "date": "2016-10-25",
```
```
      image {                              "image": {
        large                                "large": "http://...",
      }                                    }
    }                                    }]
```
```
  }                                    }
}                                    }
```

--

# Demo

--

### Command Line

**Get All Users**

```
http http://localhost:5000/graphql query='{users {username}}'
```

**Get All Users & Include Videos**

```
http http://localhost:5000/graphql query='{users {username videos {title}}}'
```

--

### GraphiQL

[Launch GraphiQL](http://localhost:5000/graphiql)

[Github GraphQL Explorer](https://developer.github.com/early-access/graphql/explorer/)

--

### Example Query

```
query {
  users {
    username
    
    videos {
      title
    }
  }
}
```

--

### Example Mutation

```
mutation {
  createUser(name: "George") {
    id
    username
  }
}
```

--

### Passing Variables

Try to avoid inlining variables.

```javascript
const query = `
  {
    user(id: "${userID}") {
      id
      videos {
        title
      }
    }
  }
`
```

Instead, use variables.

```javascript
const query = `
  query getUserVideos($userID: Int!) {
    user(id: $userID) {
      id
      videos {
        title
      }
    }
  }
`
```

--

# Building a GraphQL Server from scratch

--

### Example Backend API

<img src="./docs/img/store.png" class="float-right" />

- `store.getUser(id)`
- `store.getUsers([id])`
- `store.getAllUsers()`


- `store.getVideo(id)`
- `store.getVideos([id])`
- `store.getAllVideos()`


- `store.createUser()`

--

### Sample Data

**User**

```json
{
  "id": 1,
  "username": "Thomas.Pollich",
  "videos": [ 11, 23, 30 ],
  "followers": [ 5 ]
}
```

**Video**

```json
{
  "id": "49",
  "user": 5,
  "title": "A Slight Case of August",
  "source": {
    "low": "https://75.146.219.97/videos/49.360.mp4",
    "med": "https://75.146.219.97/videos/49.720.mp4",
    "high": "https://75.146.219.97/videos/49.1080.mp4"
  }
}
```
--

### Schema

```
type User {
  id: Int
  username: String
  videos: [Video]
  followers: [User]
}
```

```
type Video {
  id: Int
  title: String
  user: User
  source: VideoSource
}
```

```
type VideoSource {
  low: String
  med: String
  high: String
}
```

--

### Getting started

All the GraphQL variables are from the `graphql` package.

```javascript
const {
  GraphQLInt,
  GraphQLString,
  GraphQLObjectType,
  ...
} = require('graphql')
```

--

### Defining The Types

```javascript
const VideoType = new GraphQLObjectType({
  name: 'Video',
  description: 'Information about a single video',
  fields: () => ({
    id:     { type: GraphQLInt },
    title:  { type: GraphQLString },
    user:   { type: UserType },
    source: { type: VideoSourceType },
  }),
})
```

```javascript
const VideoSourceType = new GraphQLObjectType({
  name: 'VideoSource',
  description: 'URLs of varying quality for a video file',
  fields: {
    low:  { type: GraphQLString },
    med:  { type: GraphQLString },
    high: { type: GraphQLString },
  },
})
```

```javascript
const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'Information about a single user',
  fields: () => ({
    id:        { type: GraphQLInt },
    username:  { type: GraphQLString },
    videos:    { type: new GraphQLList(VideoType) },
    followers: { type: new GraphQLList(UserType) },
})
```

--

### Adding Resolvers

**Videos**

```javascript
const VideoType = new GraphQLObjectType({
  name: 'Video',
  fields: () => ({
    id: {type: GraphQLInt},
    title: {type: GraphQLString},
```
```javascript
    user: {
      type: UserType,
      resolve: (video) => store.getUser(video.user),
    },
```
```javascript
    source: {type: VideoSourceType},
  }),
})
```

**Users**

```javascript
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {type: GraphQLInt},
    username: {type: GraphQLString},
```
```javascript
    videos: {
      type: new GraphQLList(VideoType),
      resolve: (user) => store.getVideos(user.videos),
    },
```
```javascript
    followers: {
      type: new GraphQLList(UserType),
      resolve: (user) => store.getUsers(user.followers),
    },
  }),
})
```

--

### The Root Query

```javascript
const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
```
```javascript
    users: {
      type: new GraphQLList(UserType),
      resolve: () => store.getAllUsers(),
    },
```
```javascript
    user: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve: (_, args) => store.getUser(args.id)
    },
  },
})
```

--

### Mutations

```javascript
const MutationType = new GraphQLObjectType({
  name: 'Mutaton',
  fields: {
```
```javascript
    createUser: {
      type: UserType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, args) => store.createUser(args.name)
    },
```
```javascript
  },
})
```

-- 

### The Schema

The `query` field is required.


```javascript
const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
})
```

--

### Executing a Query

```javascript
const {graphql} = require('graphql')
```

```javascript
const query = `
	query {
		user(id: 1) {
			username
			videos {
				title
			}
		}
	}
`
```

```javascript
graphql(schema, query)
	.then((value) => console.log(value))
```

**Result**

```json
{
  "data": {
    "user": {
      "username": "Jarret_Schmeler",
      "videos": [
        {
          "title": "Ruggles of the King George"
        },
        {
          "title": "The Dreamlife of Apu"
        },
        {
          "title": "House of Endearment"
        }
      ]
    }
  }
}
```

--

### Executing a Mutation

```javascript
const query = `
  mutation createNewUser {
    createUser(name: "Jeremy") {
      id
      username
      videos {
        title
      }
    }
  }
`
```

```javascript
graphql(schema, query)
	.then((value) => console.log(value))
```

**Result**

``` json
{
  "data": {
    "createUser": {
      "id": 15,
      "username": "Jeremy",
      "videos": []
    }
  }
}
```

--

### Let's make a web server

```javascript
const Express = require('express')
const bodyParser = require('body-parser')
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express')

const app = new Express()
```

```javascript
app.use('/graphql',
  bodyParser.json(),
  graphqlExpress({ schema }))
```

```javascript
app.use('/graphiql',
  graphiqlExpress({ endpointURL: '/graphql' }))
```

```javascript
app.listen(5000, () => console.log('Listening on port 5000'))
```

--

### The new way to write a Schema

```javascript
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
```

```javascript
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
```

```javascript
const {makeExecutableSchema} = require('graphql-tools')
const schema = makeExecutableSchema({typeDefs, resolvers})
```

--

# Challenges

--

### Server Performance

- Sometimes need to return a lot of data
- Batching + Caching
- Facebook Data Loader

--

### Security

- Can't restrict based on endpoint
- Can check user permissions when resolving each part of the query

--

### Protecting the Server

- Deeply nested queries use up the server capacity
- Facebook: persisted approved queries
- Timeout on computation time
- Complexity analysis
