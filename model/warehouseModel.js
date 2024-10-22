const mongoose= require('mongoose')
const { Schema } = mongoose;
const warehouseSchema= new Schema({
    warehouseNumber:{type:Number},
    warehouseName:{type:String},
    warehouseLocation: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true } 
      }

})

const warehouseData= mongoose.model('warehouseInfo',warehouseSchema)
module.exports= warehouseData