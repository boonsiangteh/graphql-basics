import uuidv4 from 'uuid/v4'

// define mutation resolvers for API

const Mutation = {
    createUser: (parent, args, { db }, info) => {
        const emailTaken = db.users.some( user => user.email === args.data.email)
        if (emailTaken) {
            throw new Error('Email taken')
        }

        const user = {
            id: uuidv4(),
            ...args.data
        }
        db.users.push(user)
        return user
    },
    deleteUser: (parents, args, { db }, info) => {
        const userIndex = db.users.findIndex(user => user.id === args.id)

        if (userIndex === -1) {
            throw new Error(`User with ${args.id} not found`)
        }
        const deletedUser = db.users.splice(userIndex, 1)
        // delete all db.posts by author
        db.posts = db.posts.filter(post => {
            // find all db.posts by deleted author
            const matchingPost = post.author === args.id
            if (matchingPost) {
                // delete all db.comments that belong to deleted post
                db.comments = db.comments.filter(comment => comment.post !== post.id)
            }
            return !matchingPost
        })

        // delete all db.comments by deleted author
        db.comments = db.comments.filter( comment => comment.author !== args.id)
        return deletedUser[0]
    },
    updateUser: (parents, args, { db }, info) => {
        const { id, data } = args
        const { name, email, age } = data

        const userIndex = db.users.findIndex(user => user.id === args.id)
        if (userIndex === -1) {
            throw new Error(`User with id ${args.id} not found`)
        }
        if (typeof email === 'string') {
            const emailTaken = db.users.some( user => user.email === email)
            if (emailTaken) {
                throw new Error(`${email} is already taken`)
            }
            db.users[userIndex].email = email
        }

        typeof name === 'string' ? db.users[userIndex].name = name : null
        // if data is set to either null or int, reassign age. Otherwise, do nothing
        typeof age !== 'undefined' ? db.users[userIndex].age = age : null

        return db.users[userIndex]
    },
    createPost: (parents, args, { db }, info) => {
        const authorExists = db.users.some( user => user.id === args.data.author )

        if (!authorExists) {
            throw new Error('Author does not exist')
        }
        const post = {
            id: uuidv4(),
            ...args.data
        }
        db.posts.push(post)
        return post
    },
    deletePost: (parents, args, { db }, info) => {
        const deletedPostIndex = db.posts.findIndex(post => post.id === args.id)

        if (deletedPostIndex === -1) {
            throw new Error(`Post with id: ${args.id} not found`)
        }

        db.comments = db.comments.filter( comment => comment.post !== args.id)
        const deletedPost = db.posts.splice(deletedPostIndex, 1)
        return deletedPost[0]
    },
    updatePost: (parents, args, { db }, info) => {
        const { id, data } = args
        const { title, body, published } = data

        const postIndex = db.posts.findIndex(post => post.id === id)
        if (postIndex === -1) {
            throw new Error(`Post with id ${id} not found`)
        }

        typeof title === 'string' ? db.posts[postIndex].title = title : null
        typeof body === 'string' ? db.posts[postIndex].body = body : null
        typeof published === 'boolean' ? db.posts[postIndex].published = published : null

        return db.posts[postIndex]

    },
    createComment: (parent, args, { db }, info) => {
        const userExist = db.users.some( user => user.id === args.data.author )
        const postExist = db.posts.some( post => post.id === args.data.post && post.published )

        if (!userExist) {
            throw new Error('User does not exist')
        } else if (!postExist) {
            throw new Error('Post does not exist or is not published')
        }

        const comment = {
            id: uuidv4(),
            ...args.data
        }
        db.comments.push(comment)
        return comment
    },
    deleteComment: (parent, args, { db }, info) => {
        const deletedCommentIndex = db.comments.findIndex(comment => comment.id === args.id)
        if (deletedCommentIndex === -1) {
            throw new Error(`Comment with ${args.id} not found`)
        }
        const deletedComment = db.comments.splice(deletedCommentIndex, 1)
        return deletedComment[0]
    },
    updateComment: (parent, args, {db}, info) => {
        const { id, data } = args
        const { text } = data

        const commentIndex = db.comments.findIndex( comment => comment.id === id)

        if (commentIndex === -1) {
            throw new Error(`Comment with id ${id} does not exist`)
        }
        
        typeof text === 'string' ? db.comments[commentIndex].text = text : null

        return db.comments[commentIndex]
     }
}

export default Mutation
