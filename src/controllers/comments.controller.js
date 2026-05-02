import { isValidObjectId } from "mongoose";
import { Comment } from "../models/comments.models.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid videoId")
    }


    

    const pageNum=Number(page);
    const limitNum=Number(limit)
    const skip=(pageNum -1)*limitNum;



    //find the comments from video

    const comments=await Comment.find({video:videoId})
                .skip(skip)
                .populate("owner","username avatar")
                .limit(limitNum)
                .sort({createdAt:-1}) //latest first 

    if(!comments.length===0){
        throw new ApiError(404, "No comments found for this video")
    }



    const totalComments=await Comment.countDocuments({video:videoId})

 
    return res
    .status(200)
    .json(
        new ApiResponse(200,{totalComments,comments},"Comments fetch successfull")
    )


})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId}=req.params;
    const{content}=req.body;
    if(!content?.trim()){
         throw new ApiError(400,"Content Comments must required")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid videoId")
    }

    const createCommnets=await Comment.create({
        content,
        video:videoId,
        owner:req.user._id
    })

    
    return res
    .status(200)
    .json(
        new ApiResponse(200,createCommnets,"Comments successfully added ")
    )
})
const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId }=req.params;
     const{content}=req.body;
    if(!isValidObjectId(commentId )){
        throw new ApiError(400,"Invalid comments Id")
    }
    
    if(!content?.trim()){
         throw new ApiError(400,"Content Comments must required")
    }
    const comment=await Comment.findById(commentId)
     if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized")
  }



    const update=await Comment.findByIdAndUpdate(
        {
    _id: commentId,
    owner: req.user._id
  },
        {

            $set:{
                content,
               
                
            }
        },
        {
            new:true
        }
    )
    if(!update){
        throw new ApiError(400,"Comments not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,update,"Comments update successfully")
    )
    

})
const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
      const {commentId }=req.params;
    if(!isValidObjectId(commentId )){
        throw new ApiError(400,"Invalid comments Id")
    }
  const comments=await Comment.findById(commentId)
  if(!comments){
    throw new ApiError(404,"Comments not found")
  }
  if(!comments.owner== req.user._id.toString()){
    throw new ApiError(403, "You are not authorized to delete this comment")

  }
  await Comment.findByIdAndDelete(commentId)
   return res
        .status(200)
        .json(new ApiResponse(200, { commentId }, "Comment deleted successfully"));
})


export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment

}