const asyncHandler = require("express-async-handler")
const User = require("../Models/UserModels.js")
const bcrypt = require('bcryptjs')

//register user
//post/api/user
const registerUser = asyncHandler(async (req,res) =>{
    const { email, password, username } = req.body

    try{
      const userExists = await User.findOne({username})
      //check if user exists
      if(userExists){
        res.status(400)
        throw new Error("User alerady exists")
      }

      //hash password
     const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      // create user
      const user = await User.create({
        email,
        password: hashedPassword,
        username
      });

     // if user created successfully send user data and token to client
     if(user) {
      res.status(200).json(user);
    
     }

    else{
      res.status(400);
      throw new Error("Invalid user data");
    }

    }catch(error){
     res.status(400).json({
        message: error.message
     });

    }
});

//login user
//post/api/user
const loginUser = asyncHandler(async (req,res) => {
  const { username, password } = req.body;
  
  try{
    //find user in db
    const user = await User.findOne({username});
    if(user && (await bcrypt.compare(password, user.password))){
      res.status(200).json(user);
    }
    else{
      res.status(401);
      throw new Error(" Invalid username or password");
    }
  }catch(error){
    res.status(400).json({
     message: error.message
    });

   }

});

//get all users
// get/api/users
const getUsers = asyncHandler(async (req, res) => {

  try{
    //find all users in  DB
    const users = await User.find({});
    res.json(users);
  }catch(error){
    res.status(400).json({message: error.message});
  }
});

module.exports = { loginUser, registerUser, getUsers };