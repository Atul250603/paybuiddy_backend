const express = require('express')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User=require('../models/User');
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken');
const JWT_SIGN=process.env.SECRETKEY;
const fetchuser=require('../middleware/fetchuser');
const req = require('express/lib/request');
const Transaction=require('../models/Transact');
router.post('/topay',fetchuser,async(req,res)=>{
    try {
        let nextuser=await User.findOne({email:req.body.email});
        if(!nextuser){
            return res.status(401).json({errors:"Enter the valid email"});
        }
        let transact=await Transaction.find({user:req.user.id,nextUser:nextuser.id});
        if(transact.length!=0){
            transact[0].amount=transact[0].amount+Number(req.body.amount);
            await transact[0].save();
            res.json({transact});
        }
        else{
         let newtransact=await new Transaction({
            user:req.user.id,
            nextUser:nextuser.id,
            nextUserName:nextuser.name,
            amount:req.body.amount,
            status:"topay"
        });
        await newtransact.save();
        res.json({transact:newtransact});
    }

    } catch (error) {
        res.status(401).json({errors:error});
    }
});
router.post('/totake',fetchuser,async(req,res)=>{
    try {
        let transact=await Transaction.find({nextUser:req.user.id,status:"topay"});
        if(!transact){
            return res.status(401).json({errors:"No Transaction Yet"});
        }
        res.json({transact});
    } catch (error) {
        res.status(401).json({errors:error});
    }
})
router.post('/paid',fetchuser,async(req,res)=>{
    try {
        let nextuser=await User.findOne({email:req.body.email});
        if(!nextuser){
            return res.status(401).json({errors:"Enter the valid email"});
        }
        let transact=await Transaction.findOne({user:req.user.id,nextUser:nextuser.id});
        if(!transact){
            res.status(401).json({errors:"No such Transaction"});
        }
        if(Number(req.body.amount)===transact.amount){
            let deletion=await Transaction.findByIdAndRemove(transact._id);
            if(!deletion){
                return res.status(401).json({errors:"Some Error Occured"});
            }
        }
        else{
            transact.amount=transact.amount-Number(req.body.amount);
            await transact.save();
        }
        res.json({transact});
        
    } catch (error) {
        res.status(401).json({errors:error});
    }
})
router.post('/fetchalltransact',fetchuser,async(req,res)=>{
    try {
        let transact=await Transaction.find({user:req.user.id});
        if(!transact){
            return res.status(401).json({errors:"No transactions"})
        }
        res.json(transact);
    } catch (error) {
        return res.status(401).json({errors:error})
    }
})
module.exports=router;