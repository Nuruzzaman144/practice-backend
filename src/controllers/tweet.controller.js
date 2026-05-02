import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/twetts.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";



const createTweet=asyncHandler(async(req,res)=>{
    const {content}=req.body
    console.log("content:",content)

    if(!content){
        throw new ApiError(400,"Content is required")
    }

    const tweet=await Tweet.create({
        content,
        owner:req.user._id,
    })

    return res.status(200)
    .json(
        new ApiResponse(200,tweet,"Tweet create successful")
    )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const {userId}=req.params;
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id ")
    }

    const tweet=await Tweet.find({owner:userId})
    .sort({createdAt:-1})
    .populate("owner","username email")

    return res.status(200)
    .json(
        new ApiResponse(200,tweet,"User tweet fetch successfully ")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {userId}=req.params;
    const {content}=req.body;

     if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id ")
    }

    const tweet=await Tweet.findByIdAndUpdate(
        userId,
        {
            $set:{
                content,
                owner:req.user._id

            }
        },
        {
            new:true
        }
    )
    if(!tweet){
        throw new ApiError(500,"Tweet cannnot updated")
    }
    return res.status(200)
    .json(
        new ApiResponse(200,tweet,"Tweet update successfully")
    )

})
const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
   const { tweetId } = req.params;
     
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid user id ")
    }
    const tweet=await Tweet.findByIdAndDelete(tweetId)
    return res.status(200)
    .json(
        new ApiResponse(200,tweet,"User tweet delete successfully ")
    )
})


export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet

}