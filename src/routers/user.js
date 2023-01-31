const express = require('express');
const User = require ('../models/user')
const router = new express.Router();

const auth = require('../middleware/auth');
const sharp = require('sharp')
const { rawListeners } = require('../models/user');
const { sendWelcomeEmail, sendSeeYouSoonEmail } = require('../emails/account')

//Create user

router.post('/users', async (req,res)=>{
    const user = new User(req.body)
    
    try {
        await user.save()
        sendWelcomeEmail(user.email,)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
   


    /*user.save().then(()=> {
        res.status(201).send(user)
    }).catch((error)=> {
        res.status(400)
        res.send(error)
    })*/
})

router.post('/users/login', async (req, res) => { 
     try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
     } catch (e) {
        res.status(400).send()
     }
})

//log out

router.post('/users/logout', auth, async (req, res) => {
    try{
       //there's not need to fetch again the data
       req.user.tokens = req.user.tokens.filter((token) => {
           return token.token !== req.token
       })
       await req.user.save()

       res.send()
    } catch(e){
       res.status(500).send()
    }
})

//Logout All

router.post('/users/logoutall', auth, async  (req, res) => {
    try{
       req.user.tokens = []

       await req.user.save()

       res.send()

    } catch(e) {
        return res.status(500).send()
    }
})
// Read users 

router.get('/users/me', auth, async (req, res)=>{

   try{ res.send(req.user)
   }catch(e){
       res.status(500).send()
   }

    /*try{
       const users = await User.find({})
       res.send(users)
    }catch(error){
       res.status(500).send()
    }
    //this will fetch all the users in the database
   /* User.find({}).then((users)=>{
       res.send(users)
    }).catch((e)=> {
        res.status(500).send(e)

    })*/
})


// Read user


/*router.get('/users/:id', async (req,res)=>{
    const _id = req.params.id
    
    try{
        const user = await User.findById(_id)

        if(!user) {
            return res.status(404).send()
        }

        res.send(user)
    }catch(e) {
       res.status(500).send()
    }
})*/


// Update user


router.patch('/users/me', auth,  async (req, res) => {
     
    const updates = Object.keys(req.body)
    //to set what can be actually updated
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update)
    )

    if (!isValidOperation) {
       return res.status(400).send({error: 'Invalid updates'})
    }

    try {

       // const user = await User.findById(req.params.id)
       const user = req.user

        updates.forEach((update) => {
            //[] to not hardcode 
           user[update] = req.body[update]
        })
      
        await user.save()
        //const user = await User.findByIdAndUpdate(req.params.id, req.body , { new: true, runValidators: true })

        if(!user) {
          return res.status(404).send()
        }
        
        res.send(user)
        

    } catch(e) {
        
       res.status(500).send(e)
    }
})

// Delete user

router.delete('/users/me', auth,  async (req, res) => {

    try{
    //    const user = await User.findByIdAndDelete(req.user._id)
    //    if(!user) {
    //        return res.status(404).send()
    //    }

       await req.user.remove()
       sendSeeYouSoonEmail(req.user.email, req.user.name)
       res.send(req.user)

    } catch(e) {
      res.status(500).send(e)
    }
})

//Upload profile picture

//1 configure multer
const multer = require('multer')
const upload = multer({
    // dest : 'avatars', when we remove the dest here, multer won't save the images in the directory and we will be able to access the file after, in the router, so we will be able to save it inside the db
    limits : {
        fileSize : 1000000,
    }, fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpeg|jpg|png)$/)) {

           return cb(new Error('Please upload an image'))

        }
        
        cb(undefined, true)
    }
})

//2 configure router
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res) => {
   const buffer = await sharp(req.file.buffer).resize({width: 250 }).png().toBuffer()
   req.user.avatar = buffer
    await req.user.save()
    res.send()
    
},//new callback for handling errors
 (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

//delete images
router.delete('/users/me/avatar', auth, async(req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()

})

router.get('/users/:id/avatar', async (req,res) => {
   try{
      const user = await User.findById(req.params.id)
      if (!user || !user.avatar) {
         throw new Error()
      }

      res.set('Content-Type', 'image/png')
      res.send(user.avatar)
      
   } catch(e) {
      res.status(404).send()
   }
})


module.exports = router;