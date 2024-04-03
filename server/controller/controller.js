const {UploadModel, UserModel} = require("../model/schema");
const fs = require('fs');
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
const cookie = require("cookie");

exports.home = async(req,res)=>{
    const receivedBool = false;
    const all_images = await UploadModel.find({receivedBool});
    const cookies = cookie.parse(req.headers.cookie);
    const token = cookies.token;
    if (!   token) {
        return res.sendStatus(404);
      }
    const data = jwt.verify(token, "123");
    const email = data.email;
    const myImages = await UploadModel.find({email});
    res.render('index',{images:all_images,myImages:myImages, layout: null});
}

exports.loginPage = (req, res) => {
    res.render('login');
};

exports.RegisterPage = (req, res) => {
    res.render('register', { layout: null });
};
exports.about = (req, res) => {
    res.render('about', { layout: null });
};
exports.contact = (req, res) => {
    res.render('contact', { layout: null });
};
exports.myProfile = async(req,res)=>{
    const cookies = cookie.parse(req.headers.cookie);
    const token = cookies.token;
    if (! token) {
        return res.sendStatus(404);
      }
    const data = jwt.verify(token, "123");
    const email = data.email;
    const myImages = await UploadModel.find({email});
    res.render('myProfile',{myImages:myImages,data:data,layout: null});
}

exports.logout = async(req,res)=>{
    res.clearCookie('token'); 
    console.log("user logged out");
    res.redirect('/');
}

exports.register = async (req, res) => {
    try {
        const newUser = new UserModel(req.body);
        await newUser.save()
        // Redirect to home page after successful registration
        res.redirect('/');
        console.log("Registration successfull");    
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred during registration");
    }
};

exports.login = async(req,res)=>{
    try{
        const {email,password} = req.body;
        const user = await UserService.checkUser(email);
        if(!user){
            res.status(404).send("User Not Exist");
        }

        const isMatch = await  user.comparePassword(password);
        if(isMatch === false){
            res.status(401).send("Password Incorrect");
        }

        if(isMatch === true) {
            let tokenData  = {_id:user._id,email:user.email,name: user.name};
            // create a jwt token
            var token = await UserService.createToken(tokenData,"123", "1h")
            console.log(token);
            res.cookie('token', token, {
            maxAge: 3600000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
          });
          res.cookie('isLoggedIn', true, {
            maxAge: 3600000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
          });
          res.redirect('/home');
        }
    } catch(err){
        throw(err);
    }
}

class UserService {
    static async checkUser(email){
        try{
            return await UserModel.findOne({email});
        }catch(err){
            throw err;
        }
    }

    static async createToken(tokenData, secretKey,jwtExpiry){
        return jwt.sign(tokenData,secretKey ,{ expiresIn : jwtExpiry });
    }
}

exports.updateDetails = async (req, res) => {
    try {
        console.log(req.body);
        const response = await UploadModel.updateOne({ _id: req.body._id },
            { $set: req.body },);
            res.json(response);

    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred during changing details");
    }
};

exports.profile = async (req, res) => {
    const cookies = cookie.parse(req.headers.cookie);
    const token = cookies.token;
    console.log(token);

    if (!token) {
      return res.sendStatus(404);
    }
      try {
        const data = jwt.verify(token, "123");
      console.log("hello123");
      res.json({ user: { email: data.email, name: data.name } });
      } catch (error) {
        console.log(error);
      }
  };


exports.uploads = (req, res, next) => {
    const files = req.files;
    const descriptions = req.body.descriptions;
    const title = req.body.title;
    const name = req.body.name;
    const  email = req.body.email;

    if ((!files || Object.keys(files).length === 0) && (!title || !descriptions || title.length === 0 || descriptions.length === 0)) {
        const error = new Error('Please choose files or provide title and description');
        error.httpStatusCode = 400;
        return next(error);
    }

    //convert images to basex64 encoding
    let imgArray = [];
    if (files && files.length > 0) {
        imgArray = files.map((file) => {
            let img = fs.readFileSync(file.path)
            return encode_img = img.toString('base64')
        });
    }
    let result = imgArray.map((src,index)=>{
        //create object to store data in the collection
        let finallmg={
            filename:files[index].originalname,
            contentType:files[index].mimetype,
            imageBase64:src,
            descriptions: descriptions[index],
            title:title,
            userName:name,
            email: email
        }
        let newUpload = new UploadModel(finallmg)

        return newUpload
      .save()
      .then(() => {
        return { msg: `${files[index].originalname} Uploaded Successfully..!` };
      })
        .catch(error=>{
            if(error){
                //duplicate file handling
                if(error.name === 'MongoError' && error.code === 11000){
                return Promise.reject({error:`Duplicate ${files[index].originalname}. File already exits!`})
            }
            return Promise.reject({error:error.message || `Cannot Upload ${files[index].originalname} Something missing!` })
        }

        })
    })

    Promise.all(result)
    .then(msg=>{
        res.redirect('/')
        // res.json(msg)
    })
    .catch(err=>{
         res.json(err)
    })
}
