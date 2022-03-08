const express = require('express');
const Task = require('../models/task')
const router = new express.Router();
const auth = require("../middleware/auth")
// Create task

router.post('/tasks',auth,  async (req, res) => {
    //const task = new Task(req.body)
    const task = new Task({
      //the "..."(ES6 spread operator)  will copy all of the properties from body over to this object
      ...req.body,
      //from the authentication token:
      owner: req.user._id
    })
    
    try{
       await task.save()
      res.status(201).send(task)
    }catch(e) {
      res.status(400).send(e)
    }
    
})


//Read tasks
//GET /tasks?completed=true
//with skip=0  I'm gettin the first task, skipping 1, obv the second
//GET /tasks?limit=1&skip=0
//GET /tasks?sortBy=createdAt_asc   or desc for descending, you can use _ or : and other special character 

router.get('/tasks', auth,  async (req, res) => {
  const match = {}
  const sort = {}
  
     if (req.query.completed) {
         match.completed = req.query.completed === 'true'
     }
    
     if (req.query.sortBy) {
       const parts = req.query.sortBy.split('_')
       //ternary operator
       sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
     }
    
    try{
     //create a tasks variable to store all the tasks
      await req.user.populate({
        path: 'tasks',
        match ,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort 
            //createdAt: 1 //descenging would be -1
            //completed: 1 //I see firt the uncompleted
          
        }
      })
      
      res.send(req.user.tasks)

    }catch(e){

      res.status(500).send(e)

    }
     
})
//Read task

router.get('/tasks/:id', auth,  async (req,res) =>{
    const _id = req.params.id

    try{
      //const task = await Task.findById(_id)
      const task = await Task.findOne({ _id, owner: req.user._id})
      
      if(!task) {
          return res.status(404).send()
      }
      
      res.send(task)

    }catch(e){
      res.status(500).send(e)
    }
    
})

//Update task

router.patch('/tasks/:id', auth, async (req, res) => {
   
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))


        if (!isValidOperation) {
            return res.status(400).send({error: 'Invalid Updates'})
        }
    

    try {
      //const task = await Task.findById(req.params.id)
      const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
      
      
      

     //const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

     if (!task) {
       res.status(404).send()
     }

     updates.forEach((update) => {
      task[update] =req.body[update]
    })
    
    await task.save()
    res.send(task)

    } catch(e) {
      res.status(500).send()
    }
})

// Delete task

router.delete('/tasks/:id', auth,  async (req, res) => {

    try{
      
       const task = await Task.findOneAndDelete({_id : req.params.id, owner: req.user._id})
       if(!task) {
           return res.status(404).send()
       }
       res.send(task)
    } catch(e) {
      res.status(500).send()
    }
})

module.exports = router