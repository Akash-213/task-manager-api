const express = require('express')
const Task = require('../models/task')
const router = new express.Router()
const auth = require('../middleware/auth')


//Create Tasks

router.post('/tasks' , auth ,async(req,res)=>{
    //const task = new Task(req.body)

    const task = new Task({
        //fetch back all task attributes.
        ...req.body ,
        owner :req.user._id
    })
    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }
   
})



////fetch tasks


//Get /tasks?completed=true
//Get /tasks?limit=10&skip=(parseint(req.query.skip))
//Get /tasks?sortBy =createdAt :desc/asc
router.get('/tasks' ,auth ,async(req,res)=>{

    const match ={}

    if(req.query.completed){
        match.completed = req.query.completed === 'true' //here true is first fetched from query and then matched
        
    }

    const sort ={}

    if(req.query.sortBy){

        const parts = req.query.sortBy.split(':')

        sort [parts[0]] = parts [1] ==='desc' ? -1:1
    }

    try{
        // const tasks =await task.find({ owner :req.user._id})
        await req.user.populate({

            path: 'tasks' ,
            match:match ,//shorthand can be used

            options:{
                limit: parseInt(req.query.limit) ,
                skip: parseInt(req.query.skip),

                sort //shorthand
            }
        }).execPopulate()
    
        res.send(req.user.tasks)
    }catch(e){
        res.status(400).send(e)
    }
   
})





//fetch task by id
router.get('/tasks/:id',auth ,async(req,res)=>{
    const _id =req.params.id

    try{
        //const task =await Task.findById(_id)
        
        const task = await Task.findOne({_id ,owner : req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.status(201).send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

///update or patch 

router.patch('/tasks/:id', auth ,async(req,res)=>{

    //to get the updates
    const updates =Object.keys(req.body)

    ///objects allowed to update
    const allowedUpdates=['description' , 'completed']

    ///
    const isValidOperation= updates.every((update) => allowedUpdates.includes(update))


    if(!isValidOperation){
        return res.send( {error:'Invalid Updates!!' })
    }
    try{
        const task = await Task.findOne({_id: req.params.id , owner:req.user._id})

        if(!task){
            res.status(404).send()
        }

        //shorthand is used here
        updates.forEach((update) => task[update] = req.body[update])

        await task.save()
        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

////Delete users

router.delete('/tasks/:id', auth ,async(req,res)=>{
    try{
        
        const task = await Task.findOneAndDelete({ _id:req.params.id , owner:req.user._id })

        if(!task){
            return res.send()
        }
        res.status(201).send(task)
    }catch(e){
        res.status(500).send()
    }
})


module.exports = router