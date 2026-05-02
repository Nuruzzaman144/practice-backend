import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import mongoose, { isValidObjectId } from 'mongoose';



const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    // TODO: toggle subscription
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel id ")
    }

    const exist=await Subscription.findOne({channel:channelId,
            subscriber:req.user._id})

    let isSubscribed;
    if(exist){
        await Subscription.deleteOne({
            channel:channelId,
            subscriber:req.user._id
        })
        isSubscribed=false;
    }else{
        await Subscription.create({
            channel:channelId,
            subscriber:req.user._id
        })
        isSubscribed=true
    }

    const countSubscribe=await Subscription.countDocuments({channel:channelId})

    return res.status(200)
    .json(
        new ApiResponse(200,{countSubscribe,
            isSubscribed
        },"Subscribe successfully")
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
     if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel id ")
    }

    const subscriberChannel=await Subscription.aggregate([
       {
        $match:{
               channel: new mongoose.Types.ObjectId(channelId),
        }
       },
       {
        $lookup:{
            from:"users",
            localField:"subscriber",
            foreignField:"_id",
            as:"subscriber"
        }
       },
       {
        $unwind:"$subscriber"
       },
       {
        $project: {
        _id: 0,
        "subscriber._id": 1,
        "subscriber.username": 1,
        "subscriber.avatar": 1,
        "subscriber.fullName": 1,
        "subscriber.email": 1,
      },
    },
    ])
     return res.status(200).json(
    new ApiResponse(200, subscriberChannel, "Subscribers fetched successfully")
  );
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

   
     if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"Invalid channel id ")
    }

    const subscribedChannels=await Subscription.aggregate([
        {
            $match:{
               subscriber:new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                  as: "channel",
            }
        },
        {
            $unwind:"$channel"
        },
        {
            $project:{
                 _id: 0,
        "channel._id": 1,
        "channel.username": 1,
        "channel.avatar": 1,
        "channel.fullName": 1,
            }
        }
    ])
      
    return res.status(200)
    .json(
        new ApiResponse(
      200,
      subscribedChannels,
      "Subscribed channels fetched successfully"
        )
    )
    


})


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}