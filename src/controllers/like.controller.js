import { isValidObjectId } from "mongoose"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { Like } from "../models/like.models.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id ")
    }
    //existing 

    const existing=await Like.findOne({
        video:videoId,
        likedBy:req.user._id
    })
    let liked;
    if(existing){
        await Like.findByIdAndDelete(existing._id);
        liked=false
    }else{
        await Like.create({
            video:videoId,
        likedBy:req.user._id
        })
        liked=true
    }
    const totalCount=await Like.countDocuments({video:videoId})
    return res.status(200)
    .json(
        new ApiResponse(200,{totalCount,liked},"Video like count successfully")
    )
    
})
const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment id")
    }

    const existingComment=await Like.findOne({
        comment:commentId,
        likedBy:req.user._id
    })

    let liked;
    if(existingComment){
        await Like.findByIdAndDelete(existingComment._id);
        liked=false

    }else{
        await Like.create({
            comment:commentId,
        likedBy:req.user._id
        })
        liked=true
    }
const totalCommentLike=await Like.countDocuments({comment:commentId})
return res.status(200)
.json(
    new ApiResponse(200,{totalCommentLike,liked}, liked ? "Comment liked" : "Comment unliked")
)
})


const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
     if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid comment id")
    }

    const existingComment=await Like.findOne({
        tweet:tweetId,
        likedBy:req.user._id
    })

    let liked;
    if(existingComment){
        await Like.findByIdAndDelete(existingComment._id);
        liked=false

    }else{
        await Like.create({
            tweet:tweetId,
        likedBy:req.user._id
        })
        liked=true
    }
const totalCommentLike=await Like.countDocuments({tweet:tweetId})
return res.status(200)
.json(
    new ApiResponse(200,{totalCommentLike,liked}, liked ? "Comment liked" : "Comment unliked")
)
}
)


const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideo=await Like.aggregate([
        {
            $match:{
                likedBy:mongoose.Types.ObjectId(req.user._id),
                video:{ $exists: true }
            }
        },
        {
            $lookup:{
                from:"Video",
                localField:"video",
                foreignField:"_id",
                as:"video",
            }
        },{
            $addFields:{
                video:{$first:"$video"}
            }
        },
        {
            $lookup:{
                from:"User",
                localField:"video.owner",
                 foreignField:"_id",
                 as:"owner",
            }
        },
        {
            $addFields:{
                  "video.owner": { $first: "$owner" }
            }
        },
        {
            $project:{
                _id:0,
                video:1,
            }
        }
    ])
    return res.status(200)
    .json(
        new ApiResponse(200,likedVideo,"Liked videos fetched")
    )
});

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos


}   