import { GraphQLServer} from 'graphql-yoga'

// scalar types : ID, String, Int, Float, Boolean

// define type definitions (schema)
const typeDefs = `
    type Query {
        greeting(name: String, position: String): String!
        add(a: Float!, b: Float!): Float!
        me: User!
        post: Post!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
    }
`

// define resolvers (what will be returned from Graphql API)
const resolvers = {
    Query: {
        greeting: (parent, args, ctx, info) => {
            if (args.name && args.position) {
                return `Hello ${args.name} ! You're my favourite ${args.position}`
            }

            return 'Hello'
        },
        add: (parent, args, ctx, info) => {
            const { a,b } = args
            return a + b
        },
        me: () => ({
            id: "1235765",
            name: "batman",
            email: "something @email.com",
            age: 27
        }),
        post: () => ({
            id: "87676786",
            title: "some title",
            body: "",
            published: true
        })
    }
}

const server = new GraphQLServer({typeDefs, resolvers})
server.start(() => console.log('Server started on port 4000'))
