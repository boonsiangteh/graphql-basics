import { GraphQLServer} from 'graphql-yoga'
import uuidv4 from 'uuid/v4'
// scalar types : ID, String, Int, Float, Boolean

// demo user data
let users  = [{
    id: '1',
    name: "Mike",
    email: "mike@example.com",
    age: 23
},{
    id: '2',
    name: "Sarah",
    email: "Sarah@example.com",
}, {
    id: '3',
    name: "Andy",
    email: "Andy@example.com",
}]

let posts = [{
    id: '1',
    title: 'Some silly title',
    body: 'superman body',
    published: true,
    author: '1',
}, {
    id: '2',
    title: 'Revenge title',
    body: 'lost at sea',
    published: false,
    author: '3'
}, {
    id: '3',
    title: 'Martian',
    body: 'all the space crap',
    published: true,
    author: '2'
}]

let comments = [{
    id: '1',
    text: 'I love it',
    author: '1',
    post: '1'
}, {
    id: '2',
    text: 'Great tune !',
    author: '1',
    post: '2'
},{
    id: '3',
    text: 'I am proud that I belong to this god\'s, era of love, 1970s',
    author: '2',
    post: '2'
},{
    id: '4',
    text: 'K STARDAZ yea they sure were.',
    author: '3',
    post: '3'
}]

// define type definitions (schema)
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        me: User!
        comments: [Comment!]!
    }

    type Mutation {
        createUser(data: CreateUserInput): User!
        deleteUser(id: ID!): User!
        createPost(data: CreatePostInput): Post!
        deletePost(id: ID!): Post!
        createComment(data: CreateCommentInput): Comment!
        deleteComment(id: ID!): Comment!
    }

    input CreateUserInput {
        name: String!
        email: String!
        age: String
    }

    input CreatePostInput {
        title: String!
        body: String!
        published: Boolean!
        author: ID!
    }

    input CreateCommentInput {
        text: String!
        author: ID!
        post: ID!
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
    Mutation: {
        createUser: (parent, args, ctx, info) => {
            const emailTaken = users.some( user => user.email === args.data.email)
            if (emailTaken) {
                throw new Error('Email taken')
            }

            const user = {
                id: uuidv4(),
                ...args.data
            }
            users.push(user)
            return user
        },
        deleteUser: (parents, args, ctx, info) => {
            const userIndex = users.findIndex(user => user.id === args.id)

            if (userIndex === -1) {
                throw new Error(`User with ${args.id} not found`)
            }
            const deletedUsers = users.splice(userIndex, 1)
            // delete all posts by author
            posts = posts.filter(post => {
                // find all posts by deleted author
                const matchingPost = post.author === args.id
                if (matchingPost) {
                    // delete all comments that belong to deleted post
                    comments = comments.filter(comment => comment.post !== post.id)
                }
                return !matchingPost
            })

            // delete all comments by deleted author
            comments = comments.filter( comment => comment.author !== args.id)
            return deletedUsers[0]
        },
        createPost: (parents, args, ctx, info) => {
            const authorExists = users.some( user => user.id === args.data.author )

            if (!authorExists) {
                throw new Error('Author does not exist')
            }
            const post = {
                id: uuidv4(),
                ...args.data
            }
            posts.push(post)
            return post
        },
        deletePost: (parents, args, ctx, info) => {
            const deletedPostIndex = posts.findIndex(post => post.id === args.id)

            if (deletedPostIndex === -1) {
                throw new Error(`Post with id: ${args.id} not found`)
            }

            comments = comments.filter( comment => comment.post !== args.id)
            const deletedPost = posts.splice(deletedPostIndex, 1)
            return deletedPost[0]
        },
        createComment: (parent, args, ctx, info) => {
            const userExist = users.some( user => user.id === args.data.author )
            const postExist = posts.some( post => post.id === args.data.post && post.published )

            if (!userExist) {
                throw new Error('User does not exist')
            } else if (!postExist) {
                throw new Error('Post does not exist or is not published')
            }

            const comment = {
                id: uuidv4(),
                ...args.data
            }
            comments.push(comment)
            return comment
        },
        deleteComment: (parent, args, ctx, info) => {
            const deletedCommentIndex = comments.findIndex(comment => comment.id === args.id)
            if (deletedCommentIndex === -1) {
                throw new Error(`Comment with ${args.id} not found`)
            }
            const deletedComment = comments.splice(deletedCommentIndex, 1)
            return deletedComment[0]
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
        post: (parent, args, ctx, info) => {
            return posts.find( post => {
                return post.id === parent.post
            })
        }
    }
}

const server = new GraphQLServer({typeDefs, resolvers})
server.start(() => console.log('Server started on port 4000'))
