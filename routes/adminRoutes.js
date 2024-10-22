const express= require('express')
const router= express.Router()
const {adminChange,adminDelete,adminList,adminLogin,adminNoti,adminProducts,adminWarehouse,adminSignup,adminupdateOrderStatus,adminOrderList}= require('../controllers/admin')

//admin signup
router.post('/signup',adminSignup)

//admin login
router.post('/login',adminLogin)

//admin to delete user
router.delete('/deleteuser',adminDelete)

//admin to approve user 
router.put('/updateuser/:id',adminChange)

//admin to see list of user 
router.get('/userlist',adminList)

//admin to add warehouse in db
router.post('/addwarehouse',adminWarehouse)
//adim to add products in warehouse
router.post('/addproductswarehouse/:id',adminProducts)

//admin to see notiifcation product out of stock

router.get('/checknotification',adminNoti)
//admin to see list of orders
router.get('/allorders',adminOrderList)

//admin to chnage status of order 
router.put('/updateorder/:id',adminupdateOrderStatus) 



module.exports= router