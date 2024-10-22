const mongoose=require('mongoose')
const { Schema } = mongoose;
const productSchema= new Schema({
    productId:{type:Number,required:true},
    name:{type:String},
    price:{type:Number},
    inStock:{type:String,default:'out of stock'},
    userId: { type: Schema.Types.ObjectId, ref: 'UserData' },
    // city:{type:String},
    quantity:{type:Number},
    warehouseInfo:{type: Schema.Types.ObjectId,ref:'warehouseInfo'}
})

const productModelData= mongoose.model('ProductData',productSchema)
module.exports= productModelData