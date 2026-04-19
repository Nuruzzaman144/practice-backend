
import { trusted } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from './../models/users.models.js';

import jwt from 'jsonwebtoken';





const generateAccessAndRefreshTokens=async(userId)=>{
  try {

    const user=await User.findById(userId)

    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()

    //save database
    user.refreshToken=refreshToken;
    user.save({validateBeforeSave:false})

    return {accessToken,refreshToken}
    
  } catch (error) {500,"Something went wrong while generate access and refresh token"
    throw new ApiError()
    
  }
}

const registerUser=asyncHandler(async (req,res)=>{




     const {fullName,username,email,password}=req.body //user details
     console.log(req.body)
     //validation

    //  if(fullName === ""){
    //     throw new ApiError(400,"Full name is required")
    //  }
      

    if(
      [fullName, email, username, password].some((field) => field?.trim() === "")
        

    ){
        throw new ApiError(400,"All the field are required")

    }
   

    //user database exist kore kina check kore 
     
   const existingUser=await User.findOne({
        $or:[{ username }, { email }]
    })


    if(existingUser){
        throw new ApiError(409,"User with email and user name is alrady is exist ")
    }


    //check file from multer 

    
    const avatarLocalPath=req.files?.avatar[0]?.path;
    // const coverImageLocalPath=req.files?.coverImage[0]?.path;
    // console.log(req.files);

     let coverImageLocalPath;

   if (
  req.files &&
  Array.isArray(req.files.coverImage) &&
  req.files.coverImage.length > 0
) {
  coverImageLocalPath = req.files.coverImage[0].path;
}

     if(!avatarLocalPath){
        throw new ApiError(400,"Avatar field is required")
     }

    
     //upload on cloudinary 

     const avatar=await uploadOnCloudinary(avatarLocalPath)
     const coverImage=await uploadOnCloudinary(coverImageLocalPath)

   

   if(!avatar){
    throw new ApiError(400,"Avatar field is required")


   }

   //create object and entry to the data base  
  const user=await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
   })
  //remove sensetive data

  const createdUser =await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering the user")
  }
   

  return res.status(201)
  .json(
    new ApiResponse(200,createdUser,"User registered successfully ")
  )
 

})


const LoginUser=asyncHandler(async(req,res)=>{

  const {username,email,password}=req.body;

  if(!username && !email){
    throw new ApiError(400,"user name and email is required")

    
  }

  // if(!username || !email){
  //   throw new ApiError(400,"user name and email is required")
  // }
  const user=await User.findOne({
    $or:[{email},{username}]
  })
  if(!user){
    throw new ApiError(400,"user name and email doesnt exist ")
  }
  const isPassValid=await user.isPasswordCorrect(password)
  if(!isPassValid){
    throw new ApiError(401,"invalid user credential ")
  }
 const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

 const loggedUser=await User.findById(user._id).select("-password -refreshToken")

 const options={
  httpOnly:true,
  secure:true
 }

 return res
 .status(200)
 .cookie("accessToken",accessToken,options)
 .cookie("refreshToken",refreshToken,options)
 .json( 
  new ApiResponse(200,{
    user:loggedUser,accessToken,refreshToken

  },
  "User Logged in successfully"
))

})
const LogoutUser=asyncHandler(async(req,res,_)=>{
    await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken:undefined
      }
    },
    {
      new:true
    }
  )
  const options={
  httpOnly:true,
  secure:true
 }
 return res
       .status(200)
       .clearCookie("accessToken",options)
       .clearCookie("refreshToken",options)
       .json(
        new ApiResponse(200,{},"User logged Out successfully ")
       )

})


const refreshAccessToken=asyncHandler(async(req,res)=>{

  try {
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
    if(incomingRefreshToken){
      throw new ApiError(401,"Unauthorized request")
    }
  
    const decodedToken=await jwt.verify(incomingRefreshToken ,process.env.REFRESH_TOKEN_SECRET)
      const user=await User.findById(decodedToken._id)
       
      if(!user){
        throw new ApiError(401,"Invalid refresh token")
      }
      if(incomingRefreshToken !==user?.refreshToken){
         throw new ApiError(401,"Expired refresh token or used ")
      }
  
      //generate 
       const {accessToken,newRefreshToen}= await generateAccessAndRefreshTokens(user._id)
       const options=({
        httpOnly:true,
        secure:true,
  
       })
  
       return res
            .status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",newRefreshToen,options)
            .json(
              new ApiResponse(200, 
                {accessToken,newRefreshToen},
                "access token refreshed "
              )
            )
            
  } catch (error) {
    throw new ApiError(401,error?.message || "Invalid refresh token")
    
  }
})
export {
  registerUser,
  LoginUser,
  LogoutUser,
  refreshAccessToken
}