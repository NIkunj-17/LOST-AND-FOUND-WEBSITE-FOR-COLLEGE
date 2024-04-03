const mongoose = require('mongoose');
const db = require("../database/database");
const bcrypt = require("bcrypt");

const uploadSchema = new mongoose.Schema({
    filename:{
        type:String,
        unique:true,
        required:true
    },
    contentType:{
        type:String,
        required:true,
    },
    imageBase64:{
        type:String,
        required:true
    },
    descriptions: {
        type: String
    },
    title: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    foundPersonName: {
        type: String,
        default: "No One Found Yet"
    },
    foundPersonEmail: {
        type: String,
        default: ""
    },
    foundBool: {
        type: Boolean,
        default: false
    },
    receivedBool: {
        type: Boolean,
        default: false
    }
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    }
});

userSchema.pre('save', async function () {
    try {
        var user = this;
        const salt = await(bcrypt.genSalt(10));
        const hashpass = await bcrypt.hash(user.password,salt);

        user.password = hashpass;

    } catch (error) {
        throw(error)
    }
});

userSchema.methods.comparePassword = async function (userPassword) {
    try {
        const isMatch = await bcrypt.compare(userPassword,this.password);
        return isMatch;
    } catch (error) {
        throw(error)
    }
};

module.exports = {
    UploadModel: db.model('uploads',uploadSchema),
    UserModel: db.model('Users', userSchema)
}