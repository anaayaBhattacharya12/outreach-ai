const jwt=require('jsonwebtoken');
const User=require('../models/User');

const protect=async(req,res,next)=>{
  try{
    const token = req.headers.authorization?.replace('Bearer ', '');
    if(!token){
      return res.status(401).json({message:'Access denied, no token provided '});
    }

    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    const user=await User.findById(decoded.id);
    if(!user){
      return res.status(401).json({message:'Invalid token, user not found'});
    }

    req.user=user;
    next();
  } catch(error){
    return res.status(401).json({message:'Invalid token',error:error.message});
  }
};

module.exports=protect;