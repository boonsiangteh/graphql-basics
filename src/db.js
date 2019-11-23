const users  = [{
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

const posts = [{
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

const comments = [{
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

const db = {
    users,
    posts,
    comments
}

export default db
