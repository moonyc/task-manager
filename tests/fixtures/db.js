const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id : userOneId,
    name : "sashotti",
    email: "sashotti@example.com",
    password: "wertyu98h489ure32",
    tokens : [{
        token: jwt.sign({_id : userOneId} , process.env.JWT_SECRET)
    }]
    
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id : userTwoId,
    name : "lyra",
    email: "lyra@example.com",
    password: "sashaiscute",
    tokens : [{
        token: jwt.sign({_id : userTwoId} , process.env.JWT_SECRET)
    }]
    
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Lyra is a snake, a corn snake.',
    completed: false,
    owner: userOne._id
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Sasha is a cat',
    completed: false,
    owner: userTwo._id
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Lyra is a fine snake, I like her',
    completed: false,
    owner: userOne._id
}

const setupDatabase = async () => {
     // the deleteMany will delete everything because I didn't give it any argument
   await  User.deleteMany()
   await  Task.deleteMany()
   // a user can be necessary for login and so on
   await new User(userOne).save()
   await new User(userTwo).save()
   await new Task(taskOne).save()
   await new Task(taskTwo).save()
   await new Task(taskThree).save()
}

module.exports = {
    userOneId,
    userOne,
    setupDatabase, 
    taskOne,
    taskTwo,
    taskThree,
    userTwoId,
    userTwo
}