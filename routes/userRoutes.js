const express= require('express')
const router= express.Router()
const {userSignup,userLogin,checkData,createOrder}= require('../controllers/user')

//user signup
router.post('/signup',userSignup)

//user login

router.post('/login',userLogin)

//api to check data between 2 collection
router.get('/checkdatafrom2',checkData)
//user to place order
router.post('/placeorder/:id',createOrder)
module.exports= router