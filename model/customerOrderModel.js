const mongoose= require('mongoose')
const{Schema}= mongoose

const OrderSchema= new Schema({
    OrderId:{type:Number},
    name:{type:String},
    price:{type:Number},
    isAccepted:{type:Boolean,default:false}
})

const customerOrder= mongoose.model('customerorder',OrderSchema)
module.exports= customerOrder