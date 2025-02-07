const mongoose=require('mongoose')
const { Schema } = mongoose;
const adminSchema= new Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    phone:{type:Number,required:true,unique:true},
    password:{type:String,required:true}

})

const adminModelData= mongoose.model('adminInfo',adminSchema)
module.exports= adminModelData