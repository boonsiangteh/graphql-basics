import { GraphQLServer} from 'graphql-yoga'

// scalar types : ID, String, Int, Float, Boolean

// demo user data
const users  = [{
    id: 1,
    name: "Mike",
    email: "mike@example.com",
    age: 23
},{
    id: 2,
    name: "Sarah",
    email: "Sarah@example.com",
}, {
    id: 3,
    name: "Andy",
    email: "Andy@example.com",
}]

const posts = [{
    id: 1,
    title: 'Some silly title',
    body: 'superman body',
    published: true,
    author: 1,
}, {
    id: 2,
    title: 'Revenge title',
    body: 'lost at sea',
    published: false,
    author: 3
}, {
    id: 3,
    title: 'Martian',
    body: 'all the space crap',
    published: true,
    author: 2
}]

const comments = [{
    id: '1',
    text: 'I love it',
    author: 1,
    post: 1
}, {
    id: '2',
    text: 'Great tune !',
    author: 2,
    post: 2
},{
    id: '3',
    text: 'I am proud that I belong to this god\'s, era of love, 1970s',
    author: 2,
    post: 2
},{
    id: '4',
    text: 'K STARDAZ yea they sure were.',
    author: 3,
    post: 3
}]

// define type definitions (schema)
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        me: User!
        comments: [Comment!]!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        age: Int,
        posts: [Post!]!
        comments: [Comment!]!
    }

    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
        comments: [Comment!]!
    }

    type Comment {
        id: ID!
        text: String!
        author: User!,
        post: Post!
    }
`

// define resolvers (what will be returned from Graphql API)
const resolvers = {
    Query: {
        users: (parent, args, ctx, info) => {
            if (!args.query) {
                return users
            }

            return users.filter((user) => {
                return user.name.toLowerCase().includes(args.query.toLowerCase())
            })
        },
        posts: (parent, args, ctx, info) => {
            if (!args.query) {
                return posts
            }

            return posts.filter((post) => {
                return post.title.toLowerCase().includes(args.query.toLowerCase()) || post.body.toLowerCase().includes(args.query.toLowerCase())
            })
        },
        me: () => ({
            id: "1235765",
            name: "batman",
            email: "something @email.com",
            age: 27
        }),
        comments: (parent, args, ctx, info) => {
            return comments
        }
    },
    Post: {
        // relational to users (parent arguement inherits from Post type)
        author: (parent, args, ctx, info) => {
            return users.find( user => {
                return user.id === parent.author
            })
        },
        comments: (parent, args, ctx, info) => {
            return comments.filter( comment => {
                return comment.post === parent.id
            })
        }
    },
    User: {
        posts: (parent, args, ctx, info) => {
            return posts.filter(post => {
                return post.author === parent.id
            })
        },
        comments: (parent, args, ctx, info) => {
            return comments.filter( comment => {
                return comment.author === parent.id
            })
        }
    },
    Comment: {
        author: (parent, args, ctx, info) => {
            return users.find( user => {
                return user.id === parent.author
            })
        },
        post: (parent, arsg, ctx, info) => {
            return posts.find( post => {
                return post.id === parent.post
            })
        }
    }
}

const server = new GraphQLServer({typeDefs, resolvers})
server.start(() => console.log('Server started on port 4000'))
