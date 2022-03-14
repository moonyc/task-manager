const request = require('supertest')
const app = require('../src/app')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const User = require("../src/models/user")


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
beforeEach(async () => {
    // the deleteMany will delete everything because I didn't give it any argument
   await  User.deleteMany()
   // a user can be necessary for login and so on
   await new User(userOne).save()
})

// after each exists, but we don't need it in this project
// afterEach(() => {
//     console.log('afterEach')
// })

test('Should signup a new user', async () => {
    // here we can use patch, delete, get and so on
    const response = await request(app).post('/users').send({
        name : 'Sasha',
        email: "sasha@example.com",
        password: 'MyPass89898!'
    }).expect(201)

    // Assert that the database was changed correctly

    const user = await User.findById(response.body.user._id)
    // we know that if there isn't an id, the user should be null
    expect(user).not.toBeNull()

    // Assertion about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Sasha',
            email: 'sasha@example.com',
        },
        token: user.tokens[0].token,
    })

    // abour the user passowrd
    expect(user.password).not.toBe('MyPass89898!')
})

test("Should login an existing user" , async () => {

    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
// validate the second token is saved --> the users is in the db
// first: fetch the user from the database
   const user = await User.findById(userOneId)

   expect(response.body.token).toBe(user.tokens[1].token)
})

test("Shouldn't login nonexistent user", async () => {
   await request(app).post('/users/login').send({
       email: "trq23b7",
       password: userOne.password
   }).expect(400)
})

// endpoint for fetching a user profile

test("Should get profile for user", async() => {
    //we need to tell to supertest that we want to rerun the authentication 
    await request(app).get('/users/me')
    // this will work only if the server confirm that the token is valid and it hasn't expired. 
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test("Should not get profile for unauthenticated user", async() => {
    await request(app).get('/users/me')
          .send()
          .expect(401)
})

test("Should delete account for user", async () => {
   const response =  await request(app).delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    //validate user is removed
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test("Should not delete account for unauthenticated user", async () => {
    await request(app).delete('/users/me')
    .send()
    .expect(401)
})