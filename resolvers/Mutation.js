import uuidv4 from 'uuid/v4'

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
    }
}

export default Mutation
