const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
   try {
       const token = req.header('Authorization').replace('Bearer ', '')
       const decoded = jwt.verify(token, process.env.JWT_SECRET)
       //decoded has the _id property
       const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
       if(!user) {
           //this will trigger catch down below
           throw new Error()
       }
       //i don't want to fetch the user again in the router:
       req.token = token
       req.user = user 
       next()
   } catch(err){
       //401: not authenticated correctly
       res.status(401).send({error: 'Please authenticate correctly'} )
   }
}

module.exports = auth