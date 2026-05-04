import mongoose from "mongoose";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  const channelId = req.user._id;

  const stats = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $group: {
        _id: "$owner",
        totalVideo: {
          $sum: 1,
        },
        totalViews: { $sum: "$view" },
        videoId: { $push: "_id" },
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "likes",
        let: { vidId: "$videoId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$video", "$$vidId"],
              },
            },
          },
        ],
        as: "likes",
      },
    },
    {
      $addFields: {
        totalsubscibers: { $size: "$subscribers" },
        totalLikes: { $size: "$likes" },
      },
    },
    {
      $project: {
        _id: 1,
        totalVideos: 1,
        totalViews: 1,
        totalSubscribers: 1,
        totalLikes: 1,
      },
    },
  ]);

  const channelStatus=stats[0] || {
       totalVideos: 0,
        totalViews: 0,
        totalSubscribers: 0,
        totalLikes: 0,
  }
  return res.status(200)
  .json(
    new ApiResponse(200,channelStatus,"Channale status fetch successully")
  )
});
const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
     
    const userId=req.user._id;

   if(!userId){
    throw new ApiError(400,"Unauthorized request");

   }

   const video=await Video.find({owner:userId})
   .sort({createdAt:-1})
   .select("title thumbnail views duration isPublished createdAt")

   if(!video){
    throw new ApiError(404,"No video found in databse")
}

return res.status(200)
.json(
    new ApiResponse(200,video,"Video fetch successful")
)
})


export {
    getChannelStats,
    getChannelVideos

}
