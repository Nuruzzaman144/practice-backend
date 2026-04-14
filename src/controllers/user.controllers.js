import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from './../models/users.models.js';







const registerUser=asyncHandler(async (req,res)=>{


     const {fullName,username,email,password}=req.body //user details

     //validation

    //  if(fullName === ""){
    //     throw new ApiError(400,"Full name is required")
    //  }
      

    if(
        [fullName,email,username,password].some((fields)=>
        fields?.trim() === "")

    ){
        throw new ApiError(400,"All filed are required")

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
    const coverImageLocalPath=req.files?.coverImage[0]?.path;

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


export {registerUser}