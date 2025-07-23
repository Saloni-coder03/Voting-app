const express = require('express');
const router= express.Router();

//userRoutes
const User = require('./../models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');

//Post route to add a user
router.post('/signup', async(req,res) =>{
  console.log('Signup route hit');  
try{
const data = req.body;

//Create a new user document using the mongoose model
const newUser = new User(data);
//Save the new user to the database
const response = await newUser.save();
console.log('data saved');

// for payload and token generation
const payload = {
    id: response.id
}
console.log(JSON.stringify(payload));
const token = generateToken(payload);
console.log("Token is : " +token);

res.status(200).json({response : response, token : token});
}
catch(err){
    console.log(err);
    res.status(500).json({error: 'Internal server error'});
}
})

//login route
router.post('/login', async(req,res) => {
try{
const {aadharCardNumber , password} = req.body;

//find the user by using aadharCardNumber
const user = await User.findOne({aadharCardNumber : aadharCardNumber});

//if user doesn't exist or password do not match
if(!user || !(await user.comparePassword(password))){
    return res.status(404).json({error:'Invalid username and password'});
}

//generate Token
const payload = {
    id: user.id
}
const token = generateToken(payload);
console.log("Token is : " + token);
}

catch(err){
    console.log(err)    
res.status(500).json({error:'Internal Server error'});
}
})

//Profile route
router.get('/profile',async(req,res) => {
try{
const userData = req.user;

const userId = userData.id;
const user = await User.findById(userId);

res.status(200).json(user);

}

catch(err){
console.log(err);
res.status(500).json({error: 'Internal server error'});
}
})

//Profile password change

router.put('/profile/password', jwtAuthMiddleware, async(req,res) =>{

try{
    const userId = req.user; //extract the userid  from the user
    const{currentPassword,newPassword} = req.body; //extract the current and new passowrds from the request body

    //find the user by userid
    const user = await User.findById(userId);

    //check password is match or not
    if(!(await user.comparePassword(currentPassword))){
        res.status(404).json({error:'Invalid password'});
    }
    user.password = newPassword;
    await user.save();

    console.log('Password updated');
    res.status(200).json({message:'Password updated'});
}
catch(err){
    console.log(err);
    res.status(500).json({error: 'Internal server error'});
}

})
module.exports = router;






