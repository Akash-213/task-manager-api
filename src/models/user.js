const mongoose= require('mongoose')
const validator =require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = mongoose.Schema({
        
    name:{
        type:String ,
        required:true ,
        trim:true },
    age:{
        type:Number ,
        default:18 ,
        trim :true ,
        validate (value){
            if (value<0)
            throw new Error('Age cannot be less zero ')
        }

    },
    email:{
        type:String ,
        unique : true ,
        required:true ,
        trim :true ,
        validate(value){
            if (!validator.isEmail(value)){
                throw new Error('Invalid Email !! ')
            }
        }
    },
    password:{
        type: String,
        required:true ,
        minlength:6 ,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error ('Password cannot include password')
            }
        }
    },
    tokens : [{
        token : {
            type :String ,
            required :true
            }
    }],
    avatar :{
        type : Buffer
    }
},{
    timestamps:true
    
})


//Hiding data

userSchema.methods.toJSON = function (){

    const user =this 
    const userObject =user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

//merging user-task relation

userSchema.virtual('tasks' ,{

    ref:'Task' ,
    localField: '_id' ,
    foreignField :'owner'
})



//Auth token by json web tokens
userSchema.methods.generateAuthToken = async function (){
    const user =this
    const token = jwt.sign({_id: user._id.toString() }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token})//shorthand

    await user.save()
    return token

}
 

//
userSchema.statics.findByCredentials = async (email ,password) =>{
    const user = await User.findOne({email})

    if (!user){
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password , user.password)

    if(!isMatch){
        throw new Error('Unable to login infact wrong password!!')
    }
    return user
}

//hash the password before saving
userSchema.pre('save',async function (next){

    const user = this

    if (user.isModified('password')){

        user.password = await bcrypt.hash(user.password , 8)
    }

    next()

})

//remove the tasks after the user is deleted
userSchema.pre('remove' ,async function (next){

    const user = this

    await Task.deleteMany({owner:user._id})

    next()
})



const User = mongoose.model('User', userSchema)

module.exports= User
