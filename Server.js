require('dotenv').config()
const express=require('express')
const mongoose= require('mongoose')
const app=express()
const cors=require('cors')
const adminRoutes= require('./routes/adminRoutes')
const customerRouter= require('./routes/userRoutes')

///middle
app.use(express.json())
app.use(cors())
app.use((req,res,next)=>{
    console.log(req.path,req.method)
    next()
})


//db connection
mongoose.connect(process.env.MONGOURI)
.then((res)=>console.log("connected to db"))
.catch((err)=>console.log("failed to connect"))

app.listen(process.env.PORT,()=>{
    console.log(`server is ruuning on port ${process.env.PORT}`)
})

///api call
app.use('/api/v1/admin',adminRoutes)
app.use('/api/v1/customer',customerRouter)