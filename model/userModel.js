const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true, unique: true },
    password: { type: String, required: true },
    isApproved: { type: Boolean, default: false },
    city: { type: String }
});

const userData = mongoose.model('UserData', userSchema);
module.exports = userData;  
