const Post = {
    // relational to db.users (parent arguement inherits from Post type)
    author: (parent, args, { db }, info) => {
        return db.users.find( user => {
            return user.id === parent.author
        })
    },
    comments: (parent, args, { db }, info) => {
        return db.comments.filter( comment => {
            return comment.post === parent.id
        })
    }
}

export default Post
