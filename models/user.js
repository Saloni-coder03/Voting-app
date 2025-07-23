const mongoose = require('mongoose');
const { type } = require('os');
const bcrypt = require('bcrypt');

// define the user schema
const userSchema = new mongoose.Schema( {

name : {
    type: String,
    required: true
},
age: {
    type: Number,
    required: true
},
email: {
  type: String,  
  
},
mobile: {
    type: String //production level
},
address: {
    type: String,
    required: true
},
aadharCardNumber : {// most imp
    type: Number,
    required: true,
    unique: true //only one aadhar card regis
},
password: {
    type: String,
    required: true
},
role: {
    type: String,
    enum: ['voter','admin'],
    default: 'voter'
},
isVoted: {// for to check not to give vote twice
    type: Boolean,
    default: false
}
});

//middleware function
userSchema.pre('save',async function(next){
const user = this;

//hash the password only if it has been modified(or is new)

if(!user.isModified('password')){
    return next();
}
try{
    //hash password generation
    const salt = await bcrypt.genSalt(10);
    //hash password
    const hashedPassword =await bcrypt.hash(user.password,salt);
//override the plain password
user.password = hashedPassword;
next();
}
catch(err){
    return next(err);
}
})
//methods i.e. compare password
userSchema.methods.comparePassword = async function(candidatePassword){
    try{
        if(!candidatePassword || typeof candidatePassword !== 'string'){
            throw new Error('Invalid candidate password');
        }
        if(!this.password || typeof this.password !== 'string'){
            throw new Error('Stored password is invalid');
        }
        //use bcrypt to compare the password
        const isMatch = await bcrypt.compare(candidatePassword,this.password);
        return isMatch;
    }catch(err){
        throw err;
    }

}
const User = mongoose.model('User',userSchema);
module.exports = User;