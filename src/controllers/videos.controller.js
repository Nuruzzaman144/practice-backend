import mongoose, {  isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from './../models/video.model.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const pageNum=Number(page)
    const limitNum=Number(limit)
    const skip=(pageNum -1 )*limitNum;

    // filter 
    const filter={}

    //search means it query if query has i mean user if search
    if(query){

        filter.title={$regex:query , $options:"i"}

    }
    if(userId && isValidObjectId(userId)){
        filter.owner=new mongoose.Types.ObjectId(userId)
    }

//sort 
    const sortOrder=sortType === "asc" ? 1:-1;

    //paginate 
    const videos=await Video.find(filter)
     .sort({[sortBy]:sortOrder})
     .skip(skip)
     .limit(limitNum)
     .populate("owner","fullName username email")

     const total=await Video.countDocuments(filter)
     return res.status(200)
     .json(
        new ApiResponse(200,{total,
            limit:limitNum,page:pageNum,videos
        })
        ,
         "Videos fetched successfully"
     )
})



const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if(!title || !description){
        throw new ApiError(400,"Title and description are required")
    }
   const videoPath = req.files?.video?.[0]?.path;

    if(!videoPath){
        throw new ApiError(400,"Video file is required")
    }
    const uploadVideo=await uploadOnCloudinary(videoPath);

    if(!uploadVideo?.url){
        throw new ApiError(409,"Upload video")
    }
    const thumbnailPath = req.files?.thumbnail?.[0]?.path;

if (!thumbnailPath) {
  throw new ApiError(400, "Thumbnail required");
}

const uploadThumbnail = await uploadOnCloudinary(thumbnailPath);
    // const video=await Video.create({
    //     title,
    //     description,
    //     video:uploadVideo.url,
    //      owner: req.user._id,
    // })
 const video = await Video.create({
    videoFile: uploadVideo.url,
    thumbnail: uploadThumbnail.url,
    title,
    description,
    duration: 0,
    owner: req.user._id,
  });
    return res.status(201)
    .json(
        new ApiResponse(201,video,"Video published successfully")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video ID")
    }
   
    const video=await Video.findById(videoId)
    .populate("owner", "fullName username avatar")

    if(!video){
        throw new ApiError(404,"video not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200,video,"Video fetch successfully ")
    )

})



const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
     if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video ID")
    }
    //TODO: update video details like title, description, thumbnail
    const {title,description}=req.body;
   if(!title || !description){
    throw new ApiError(400,"Title and description is required")
   }
    
  const thumbnailPath=req.files?.thumbnail?.[0]?.path
   if(!thumbnailPath){
    throw new ApiError(400,"Please upload the thumbnail")
   }

   const thumbnail=await uploadOnCloudinary(thumbnailPath);

   if(!thumbnail?.url){
    throw new ApiError(500,"Thumbnail url could not found")
   }
   

  

    const updatedVideo=await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
            title,
            description,
            thumbnail:thumbnail.url

        },
        
        },
        {
            new:true
        },
    )
return res.status(200).json(
  new ApiResponse(200, updatedVideo, "Video updated successfully")
)
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
      if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video ID")
    }

    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found to db ")
    }
      if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to delete this video");
    }
   if(video.publicId){
    const deleted=await deleteFromCloudinary(video.publicId);
    if(!deleted){
             throw new ApiError(500, "Failed to delete video from cloud storage")
    }
   }

   //delete from db


   const removeDb=await Video.findByIdAndDelete(videoId)

   return res.status(200).json(
    new ApiResponse(200,{},"Video delete successfully")
   )

})
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video ID")
    }

    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found to db ")
    }
      if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to delete this video");
    }
    video.isPublished=!video.isPublished;
    await video.save();

    return res.status(200)
    .json(new ApiResponse(200,{isPublished:video.isPublished},video.isPublished ? "video is published " : " video is unpublished "))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}

