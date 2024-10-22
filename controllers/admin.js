const adminModel=require('../model/adminModel')
const productModelData = require('../model/productModel')
const userModel=require('../model/userModel')
const bcrypt= require('bcrypt')
const jwt= require('jsonwebtoken')
const warehouseModel = require('../model/warehouseModel')
const customerOrderModel=require('../model/customerOrderModel')
//admin signup
const adminSignup=async(req,res)=>{
    try {
        const{name,email,phone,password}=req.body
        //checking user already exist 
        // const checkingUser= await userModel.findOne({email})
        // if(checkingUser){
        //     return res.json({mssg:"user already exist"})
        // }
        //hasing password
        const hashedPassword = await bcrypt.hash(password, 10); 

        const dataEntry= new adminModel({
            name,
            email,
            phone,
            password: hashedPassword
    })
        const saveData=await dataEntry.save()
        if(!saveData){
            return res.status(404).json({mssg:"failed to send data"})
        }
        return res.status(200).json(dataEntry)
    } catch (error) {
        console.log(error)
        res.status(500).json({error:error.message})
    }
}


///admin login 
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const adminInfo = await adminModel.findOne({ email });
        if (!adminInfo) {
            return res.status(404).json({ mssg: "User does not exist" });
        }

        // Check if the password matches
        const passwordCheck = await bcrypt.compare(password, adminInfo.password);
        if (!passwordCheck) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Generate token once password matches
        const token = jwt.sign(
            { userId: adminInfo._id, email: adminInfo.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Send response with the token
        return res.status(200).json({ message: "Login successful", token });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
};

// const userLogin = async (req, res) => {
//     try {
//         const { identifier, password } = req.body; 

//         // Check if the identifier is an email or phone number
//         let query = {};
//         if (identifier.includes('@')) {
//             query = { email: identifier };
//         } else {
//             query = { phone: identifier };
//         }

//         // Find user by either email or phone
//         const userInfo = await userModel.findOne(query);
//         if (!userInfo) {
//             return res.status(400).json({ message: "User does not exist" });
//         }

//         // Check if the user is approved by admin
//         if (!userInfo.isApproved) {
//             return res.status(403).json({ message: "User not approved by admin" });
//         }

//         // Check if the password matches
//         const passwordCheck = await bcrypt.compare(password, userInfo.password);
//         if (!passwordCheck) {
//             return res.status(401).json({ message: "Invalid password" });
//         }

//         // Generate JWT token if login is successful
//         const token = jwt.sign(
//             { userId: userInfo._id, email: userInfo.email }, 
//             process.env.JWT_SECRET,
//             { expiresIn: '1h' } 
//         );

//         // Send response with the token
//         return res.status(200).json({ message: "Login successful", token });

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ error: error.message });
//     }
// };

//admin to see all customer list 
// const adminList=async(req,res)=>{
//     try {
//         const{firstname,phone,email}=req.params
//         const adminData= await userModel.find({firstname:req.params,phone:req.params,email:req.params})
//         if(!adminData){
//             return res.json({mssg:"something went wrong"})
//         }
//         return res.json(adminData)
        
//     } catch (error) {
//         console.log(error);
//          return res.status(500).json({ error: error.message });
//     }
// }
// const adminList = async (req, res) => {
//     try {
//         // Use req.query to get query parameters instead of req.params
//         const { firstname, phone, email } = req.query;

//         // Build a query object
//         const query = {};

//         // Add conditions to the query object based on the provided parameters
//         if (firstname) {
//             query.firstname = { $regex: firstname, $options: 'i' }; // Case-insensitive search
//         }
//         if (phone) {
//             query.phoneNumber = { $regex: phone, $options: 'i' }; // Adjust this if your phone field is named differently
//         }
//         if (email) {
//             query.email = { $regex: email, $options: 'i' };
//         }

//         // Find users based on the query
//         const adminData = await userModel.find(query);

//         // Check if any data was found
//         if (adminData.length === 0) {
//             return res.status(404).json({ mssg: "No users found" });
//         }

//         return res.json(adminData);
        
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ error: error.message });
//     }
// }
const adminList = async (req, res) => {
    try {
        // Use req.query to get query parameters instead of req.params
        const { firstname, phone, email, page = 1 } = req.query; // Default to page 1 if not provided
        const limit = 15; // Set the limit of documents per page
        const skip = (page - 1) * limit; // Calculate how many documents to skip

        // Build a query object
        const query = {};

        // Add conditions to the query object based on the provided parameters
        if (firstname) {
            query.firstname = { $regex: firstname, $options: 'i' }; // Case-insensitive search
        }
        if (phone) {
            query.phoneNumber = { $regex: phone, $options: 'i' }; // Adjust this if your phone field is named differently
        }
        if (email) {
            query.email = { $regex: email, $options: 'i' };
        }

        // Use aggregation to handle pagination
        const adminData = await userModel.aggregate([
            { $match: query },
            { $skip: skip }, // Skip documents based on page number
            { $limit: limit } // Limit the number of documents returned
        ]);

        // Get total count of documents matching the query for pagination
        const totalCount = await userModel.countDocuments(query);

        // Check if any data was found
        if (adminData.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        // Send response with data and pagination info
        return res.json({
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: parseInt(page),
            data: adminData
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
};


//admin to change approval status of customer 
const adminChange= async(req,res)=>{
    try {
        const{id}=req.params
        const{isApproved}=req.body
        const changes = await userModel.findByIdAndUpdate(
            id,
            {isApproved},
            {new:true}
            
        )
        if(!changes){
            return res.json({mssg:"Failed to update"})
        }
        return res.status(200).json(changes);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
}

//admin to delete customer account 
const adminDelete=async(req,res)=>{
    try {
        const {id}=req.params  //customer id
        const deleteEntry= await userModel.findByIdAndDelete({id:id})
        if(!deleteEntry){
            return res.status(200).json({mssg:"User not found or Deleted "})
        }
        return res.status(200).json(deleteEntry)
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
}

//admin add warehouse
const adminWarehouse = async (req, res) => {
    try {
        const { warehouseNumber, warehouseName, warehouseLocation } = req.body;

        // Create a new instance of the warehouse model
        const saveEntry = new warehouseModel({
            warehouseNumber,
            warehouseName,
            warehouseLocation
        });

        // Save the entry to the database
        const savingData = await saveEntry.save();

        // Check if saving was successful
        if (!savingData) {
            return res.status(404).json({ message: "Failed to save data" });
        }

        // Return the saved data
        return res.status(200).json(savingData);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
};



//admin to add products in product data

// const adminProducts= async(req,res)=>{
//     try {
//         const{id}=req.params  //this is the warehouse id 
//         const{productId,name,price,inStock,city,quantity}=req.body
//         const addData= new productModelData({
//             productId,
//             name,
//             price,
//             inStock: 'available',
//             city,
//             quantity,
//             warehouseInfo:id
//         })

//         if(!addData){
//             return res.json({mssg:"failed to add data"})
//         }
//         // return res.json(addData)
//         await addData.save()
//         const populateData= await productModelData.findById(addData._id).populate('warehouseInfo')

//         if (!populateData) {
//             return res.json({ mssg: "Failed to add data" });
//         }

//         return res.json(populateData);
//     } catch (error) {
//         console.log(error)
//         res.json({error:error.message})
//     }
// }


const adminProducts = async (req, res) => {
    try {
        const { id } = req.params; // This is the warehouse id 
        const { productId, name, price, inStock, city, quantity } = req.body;

        // Create the new product entry
        const addData = new productModelData({
            productId, 
            name,
            price,
            inStock: 'available',
            city,
            quantity,
            warehouseInfo: id
        });

        // Save the new product
        await addData.save();

        // Populate warehouse info
        const populateData = await productModelData.findById(addData._id).populate('warehouseInfo');

        // Fetch all customers (users)
        const customers = await userModel.find({}, '_id');

        // Map the new product to each customer
        const customerProductMappings = customers.map(customer => ({
            userId: customer._id, // Use userId here
            productId: addData._id // Link to the new product
        }));

        // Insert the mappings into the ProductData collection
        await productModelData.updateMany(
            { _id: addData._id },
            { $set: { userId: customerProductMappings.map(mapping => mapping.userId) } }
        );

        return res.status(200).json(populateData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};



//admin to get notification if product going to be out of stock
const adminNoti = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the product with the specified id and quantity less than or equal to 10
        const product = await productModelData.findOne({ _id: id, quantity: { $lte: 10 } });

        // Check if the product was found
        if (product) {
            return res.status(200).json({
                message: "Alert: This product is going to be out of stock.",
                productId: product._id,
                currentQuantity: product.quantity
            });
        } else {
            return res.status(404).json({
                message: "All products are in stock or product not found.",
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};
//admin to order list 
const adminOrderList = async (req, res) => {
    try {
      
      const page = parseInt(req.query.page) || 1;
      const limit = 10; 
      const skip = (page - 1) * limit; 
  
      // Fetch orders with pagination and sorting by _id in descending order
      const checkingLatestOrder = await customerOrderModel
        .find()
        .sort({ _id: -1 }) 
        .skip(skip)        
        .limit(limit);     
  
      // Check if any orders exist
      if (checkingLatestOrder.length === 0) {
        return res.status(404).json({ message: "No orders found" });
      }
  
      
      return res.status(200).json({
        page: page,
        limit: limit,
        data: checkingLatestOrder
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  };
  
//admin to change or update 


const adminupdateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params; 
    const { isAccepted } = req.body; 

    
    // Update the isAccepted field for the specific order
    const updatedOrder = await customerOrder.findByIdAndUpdate(
      orderId,
      { isAccepted }, 
      { new: true } 
    );

    // Check if the order exists
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Send back the updated order
    return res.status(200).json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};


module.exports={adminChange,adminDelete,adminList,adminLogin,adminNoti,adminProducts,adminWarehouse,adminSignup,adminupdateOrderStatus,
    adminOrderList
}