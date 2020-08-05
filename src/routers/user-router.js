const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')

//images
const multer = require('multer')
//resize images
const sharp =require('sharp')
//emails
const account = require('../emails/account')
const { sendWelcomeEmail, sendCancelEmail } = require('../emails/account')

//Create users
router.post('/users',async(req,res)=>{

    const user = new User(req.body)
    try{
        await user.save()
        sendWelcomeEmail(user.email ,user .name)
        res.status(201).send(user)
    }catch(e){
        res.status(400).send(e)
    }

})


///login into account

router.post('/users/login', async(req,res)=>{
    try{

        const user = await User.findByCredentials(req.body.email ,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user ,token})

    }catch(e){
        res.status(400).send()
    }
})



//logout 
router.post('/users/logout' ,auth ,async(req,res) =>{
    try{
        
        req.user.tokens = req.user.tokens.filter((token) =>{

            return token.token !== req.token 
        })

        await req.user.save()
        res.send("You are successfully logged out !!")
    }catch(e){
        res.status(500).send()
    }
})


// logout all
router.post('/users/logoutAll' ,auth ,async(req,res)=>{

    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})



//fetch users from database
router.get('/users/me', auth, async(req,res)=>{

    res.send(req.user)
    // try{
    //     const users = await User.find({})
    //     res.send(users)

    // }catch(e){
    //     res.status(500).send(e)
    // }
    
})


//fetch users with id
///Users cannot access fetch users

// router.get('/users/:id',async(req,res)=>{
//     const _id =req.params.id

//     try{
//         const user =await User.findById(_id)
//         if(!user){
//             return res.status(404).send()
//         }
//         res.status(201).send(user)
//     }catch(e){
//         res.status(500).send(e)
//     }
// })



///update or patch 

router.patch('/users/me', auth ,async(req,res)=>{

    //to get the updates
    const updates =Object.keys(req.body)

    ///objects allowed to update
    const allowedUpdates=['name','email','password' , 'age']

    ///
    const isValidOperation= updates.every((update) => allowedUpdates.includes(update))


    if(!isValidOperation){
        return res.send( {error:'Invalid Updates!!' })
    }
    try{
        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()

        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})

////Delete users

router.delete('/users/me',auth ,async(req,res)=>{
    try{
        
        // const user = await User.findByIdAndDelete(req.users._id)

        // if(!user){
        //     return res.send()
        // }
        await req.user.remove()
        sendCancelEmail(req.user.email ,req.user.name)
        res.status(201).send(user)
    }catch(e){
        res.status(400).send()
    }
})


//uploading profile pics

const upload = multer({
    limits:{
        fileSize :1000000
    },
    fileFilter(req ,file ,cb){

        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){

            return cb (new Error ('Please upload an image file !!'))
        }
        cb(undefined ,true)
    }

})

router.post('/users/me/avatar' , auth , upload.single('avatar') , async (req,res)=>{

    //resize and format the pic
     const buffer = await sharp(req.file.buffer).resize({width:200 ,height :200})
                    .png().toBuffer()

    req.user.avatar = buffer
    await req.user.save() 
    res.send()

}, (error , req , res, next) =>{

    res.status(400).send({error : error.message})

})


//delete avatar pic
router.delete('/users/me/avatar' ,auth ,async(req,res) =>{

    req.user.avatar = undefined 
    await req.user.save()
    res.send()
})


//
router.get('/users/:id/avatar' , async(req,res)=>{
    try{

        const user = await User.findById(req.params.id)

        if( !user || !user.avatar){
            throw new Error()
        }
        
        res.set('Content-Type' , 'image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})






module.exports = router