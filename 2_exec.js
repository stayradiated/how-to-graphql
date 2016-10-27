const {graphql} = require('graphql')

const schema = require('./1_schema')

graphql(schema, `
	query getUserInfo {
		user(id: 1) {
			username
			videos {
				title
			}
		}
	}
`).then((value) => {
  console.log(JSON.stringify(value, null, 2))
})

graphql(schema, `
	mutation createNewUser {
		createUser(name: "Jeremy") {
      id
      username
      videos {
        title
      }
		}
	}
`).then((value) => {
  console.log(JSON.stringify(value, null, 2))
})

graphql(schema, `
	mutation createNewUser($name: String!) {
		createUser(name: $name) {
      id
      username
      videos {
        title
      }
		}
	}
`, null, null, {
  name: 'George',
}).then((value) => {
  console.log(JSON.stringify(value, null, 2))
})
