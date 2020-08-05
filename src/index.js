const express = require('express')
require('./db/mongoose')

///calling routers
const user_router = require('./routers/user-router.js')
const task_router = require('./routers/tasks-router.js')



const app =express()
const port =process.env.PORT

///purposefully called before

// app.use((req,res,next)=>{
//     if(req.method === 'GET'){

//         res.send('Administartor sites only')
//     }else{
//         next()
//     }
// })

// app.use ((req,res,next) =>{
//     res.status(503).send('Server under maintainence!!')
// })


app.use(express.json())
///using routers
app.use(user_router)
app.use(task_router)


//For starting the server use 
// C:\Users\akash\mongodb\bin\mongod.exe --dbpath=C:\Users\akash\mongodb-data

//or starting nodemon use npm run dev
//dev contains nodemon and 

app.listen(port,()=>{
    console.log("Server is running on port: " + port)
})

const Task = require('./models/task')
const User = require('./models/user')
