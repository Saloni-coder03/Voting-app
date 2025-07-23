const express = require('express');
const router = express.Router();

//candidateroutes(ROLE - ADMIN)
const Candidate = require('./../models/candidate');
const User = require('./../models/user');
const{jwtAuthMiddleware,generateToken}= require('./../jwt');

//function to check admin
const checkAdminRole = async(userId) =>{
    try{
const user = await User.findById(userId);
if(user.role == 'admin'){
    return true;
}
 }
    catch(err){
        return false;
    }
}

//POST route to add a candidate
router.post('/',jwtAuthMiddleware,async(req,res)=>{
try{
    const userId = req.user.id;//extract the id of a user
if(!await checkAdminRole(userId)){
    return res.status(403).json({message:'user does not have admin role'})
}
const data = req.body;

//create a new candidate
const newCandidate = new Candidate(data);
//save
const response = await newCandidate.save();
console.log('data saved');
res.status(200).json({response: response});
}
catch(err){
console.log(err);
res.status(500).json({error:'Internal Server error'});

}
})
//put method for /:candidateId - update the candidate 

router.put('/:candidateId',jwtAuthMiddleware,async(req,res) =>{
    try{
const userId = req.user.id;
if(!await checkAdminRole(userId)){
    return res.status(403).json({message: 'user does not have admin role'})
}
const candidateId = req.params.id;//extract the id from the url parameter
const updatedCandidateId = req.body;//update data for the candidate

const response = await Candidate.findByIdAndUpdate(candidateId,updatedCandidateId ,{
    new: true,
    runValidators: true
});

if(!response){
    return res.status(404).json({error: 'Candidate not found'});
}
console.log(' candidate data updated');
return res.status(200).json(response);
 }
    catch(err){
console.log(err);
res.status(500).json({error:'Internal Server error'})
    }
})
// delete route - /:candidateId - delete the candidate data
router.delete('/:candidateId', jwtAuthMiddleware,async(req,res) =>{
try{
    const userId = req.user.id;
    if(!await checkAdminRole(userId)){
        return res.status(403).json({message:'user does not have admin role'});
    }
    const candidateId = req.params.id;//extract the id form the url parameter
const response = await Candidate.findByIdAndDelete(candidateId);

if(!response){
    return res.status(404).json({error:'Invalid response'});
}
console.log('candidate deleted');
res.status(200).json(response);
}
catch(err){
    console.log(err);
    return res.status(500).json({error: 'Internal server error'});
}
})

//let's start voting
router.post('/vote/:candidateID',jwtAuthMiddleware,async(req,res) =>{
//no admin can vote
//user can only vote once

candidateId = req.params.candidateID;
userId = req.user.id;

try{
 //find the candidate document with the specified candidateId
const candidate = await Candidate.findById(candidateId);
if(!candidate){
    return res.status(404).json({message:'Candidate not found'});
}
//find the user document with the specified user id
const user = await User.findById(userId);
if(!user){
    return res.status(404).json({message: 'User not found'});
}
//two cases
if(user.isVoted){
    return res.status(400).json({message: 'User is already voted'});
}
if(user.role ==='admin'){
    return res.status(403).json({message: 'Admin is not allowed'});
}
//update the candidate doc to record the vote
candidate.votes.push({user:userId});
candidate.voteCount++;
await candidate.save();

//update the user doc
user.isVoted = true;
await user.save();

res.status(200).json({message:'Vote recorded successfully'});
}
catch(err){
    console.log(err);
    return res.status(500).json({error:'Internal server error'})
}
})

//vote counts and also arrange in sorted order
router.get('/vote/count',async(req,res)=>{

try{
//find all the candidates and sort them by voteCount in decreasing order
const candidate = await Candidate.find().sort({voteCount:'desc'})

//Map the candidates to only return their name and voteCount
const voteRecord = candidate.map((data)=> {
    return {
        party: data.party,
        count: data.voteCount
    }
});
return res.status(200).json(voteRecord);
}
catch(err){
    console.log(err);
    return res.status(500).json({error: 'Internal server error'});
}
})

module.exports = router;