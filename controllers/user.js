const userData = require('../model/userModel');  // Correctly importing the model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ProductModel= require('../model/productModel')
const warehouseModel=require('../model/warehouseModel')
const userSignup = async (req, res) => {
    try {
        const { firstname, lastname, email, phone, password, city } = req.body;

        // Check if the user already exists by email
        const checkingUser = await userData.findOne({ email });
        if (checkingUser) {
            return res.status(400).json({ mssg: "User already exists" });
        }

        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance
        const newUser = new userData({
            firstname,
            lastname,
            email,
            phone,
            password: hashedPassword,  
            city
        });

        // Save the new user to the database
        const saveUser = await newUser.save();

        // Check if saving was successful
        if (!saveUser) {
            return res.status(500).json({ mssg: "Failed to save user data" });
        }

        // Send a successful response
        return res.status(201).json({ mssg: "User created successfully", user: saveUser });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
};


//user login code
const userLogin = async (req, res) => {
    try {
        const { email,phone, password } = req.body;

        // Find user by either email or phone 
        const userInfo = await userData.findOne({
            $or: [
                { email: email },
                { phone: phone }
            ]
        });

        if (!userInfo) {
            return res.status(400).json({ message: "User does not exist" });
        }

        // Check if the user is approved by admin
        if (!userInfo.isApproved) {
            return res.status(403).json({ message: "User not approved by admin" });
        }

        // Check if the password matches
        const passwordCheck = await bcrypt.compare(password, userInfo.password);
        if (!passwordCheck) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Generate JWT token if login is successful
        const token = jwt.sign(
            { userId: userInfo._id, email: userInfo.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send response with the token
        return res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
};


///aggregation pipeline between products and user db
const checkData= async(req,res)=>{
    try {
        const productsWithUsers = await ProductModel.aggregate([
            {
                $lookup: {
                    from: 'userdatas', 
                    localField: 'userId',            
                    foreignField: '_id',           
                    as: 'userInfo'                   
                }
            },
            {
                $unwind: {
                    path: '$userInfo',              
                }
            },
            {
                $project: {
                  productId: 1,
                  name: 1,
                  price: 1,
                  inStock: 1,
                  quantity: 1
                },
              },
        ]);

        return res.status(200).json(productsWithUsers);
    } catch (error) {
        console.log(error)
        res.sttus(500).json({error:error.message})
        
    }
}

///customer to book product available in stock 

const createOrder = async (req, res) => {
    try {
      const { userId, productId, quantity, userLocation } = req.body; 
      const productsNearby = await productModelData.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: userLocation.coordinates
            },
            distanceField: 'dist.calculated',
            maxDistance: 10000, 
            spherical: true,
            includeLocs: 'warehouseInfo.location' 
          }
        },
        {
          $match: {
            productId: productId,
            inStock: 'available' 
          }
        },
        {
          $lookup: {
            from: 'warehouseinfos', 
            localField: 'warehouseInfo',
            foreignField: '_id',
            as: 'warehouseDetails'
          }
        }
      ]);
  
      //  Check if the product is found
      if (productsNearby.length === 0) {
        return res.status(404).json({ message: 'Product not found or not in stock in your area' });
      }
  
      const product = productsNearby[0];
  
      //  Create the order if the product is available in sufficient quantity
      if (product.quantity >= quantity) {
        const newOrder = new customerOrder({
          OrderId: new mongoose.Types.ObjectId(),
          name: product.name,
          price: product.price,
        //   isAccepted: true // Mark the order as accepted
        });
  
        await newOrder.save();
  
        //  Reduce the product quantity after the order is accepted
        await productModelData.updateOne(
          { _id: product._id },
          { $inc: { quantity: -quantity } } // Decrease the quantity by the ordered amount
        );
  
        res.status(201).json({ message: 'Order placed successfully', order: newOrder });
      } else {
        res.status(400).json({ message: 'Not enough stock available' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

module.exports = { userSignup ,userLogin,checkData,createOrder};
