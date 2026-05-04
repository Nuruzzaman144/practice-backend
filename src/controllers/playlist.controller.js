import { isValidElement } from "react"
import { Playlist } from "../models/playlist.models"
import { ApiError } from "../utils/ApiError"
import { ApiResponse } from "../utils/ApiResponse"
import { isValidObjectId } from "mongoose"
import { User } from "../models/users.models"
import { Playlist } from '../models/playlist.models';
import { Video } from '../../../social-media/backend/src/models/video.models';

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!name || !description){
        throw new ApiError(400,"All field is required")
    }

    const existing=await Playlist.findOne({
        name,
        owner:req.user._id
    })

    if(!existing){
        throw new ApiError(404,"Play list doesnot exist")
    }

    const created=await Playlist.create({
        name,
        description,
        owner:req.user._id,
        video:[],
    })
    return res.status(200)
    .json(
        new ApiResponse(200,
            created,
            "Play list created sucessfylly "
        )
    )
    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id ")
    }
     
     
    const user=await User.findById(userId)

     if(!user){
        throw new ApiError(404,"User not found")
     }
     
     const playlists=await Playlist.find({owner:userId})

     return res.status(200)
     .json(
        new ApiResponse(200,playlists,"User play list fetch successfully")
     )
    
    //TODO: get user playlists
})
const getPlaylistById = asyncHandler(async (req, res) => {
   
   const {playlistId,videoId}=req.params;
   if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
    throw new ApiError(400,"Invalid playlist and video id ")
   }
   //play list and video exist or not
   const playlists=await Playlist.findById(playlistId)
   if(!playlists){
    throw new ApiError(404,"playlist not found")
   }
   const video=await Video.findById(videoId)
   if(!video){
    throw new ApiError(400,"Video is not found")
   }
   //authorization 

   if(playlists.owner.toString() !==req.user._id.toString()){
    throw new ApiError(403,"You are not allowed to modified playlist ")
   }
   if(playlists.videos.includes(videoId)){
    throw new ApiError(403,"Video already exists in playlist")
   }
    //TODO: get user playlists

    const updatePlalists=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push:{videos:videoId}
        },
        {
            new:true
        }
    )

    return res.status(200)
    .json(
        new ApiResponse(200,updatePlalists,"Video added to playlist")
    )
}) 


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid playlist and video id.Please add correct playlist id ")
    }

    const playlists=await Playlist.findById(playlistId);
    if(!playlists){
        throw new ApiError(404,"Play has not exist ")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video nit exist in playlist ")
    }
    if(playlists.videos.includes(videoId)){
        throw new ApiError(403,"Video already been in playlist ")

    }
    playlists.videos.push(videoId);
    await playlists.save()

    return res.status(200)
    .json(
        new ApiResponse(200,playlists,"Video fetching successfull")
    )
})
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
     
     if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid playlist and video id.Please add correct playlist id ")
    }

    const updatePlayList =await Playlist.findByIdAndDelete(
         playlistId,
          {
             $pull:{video:videoId}  
         },
         {
            new:true
         }
    )
    if(!updatePlayList){
        throw new ApiError(404,"Play list doesnot exist ")
    }
    return res.status(200)
    .josn(new ApiResponse(200,updatePlayList,"Video remove from playlist "))
})
const deletePlaylist = asyncHandler(async (req, res) => {
     const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id ")
    }

    const playlists=await Playlist.findById(playlistId)
    if(!playlists){
        throw new ApiError(404,"Play list does not exist")
    }
    const deletedPlaylist=await Playlist.findByIdAndDelete(playlistId)
    return res.status(200)
    .json( 
        new ApiResponse(200,deletedPlaylist,"Play list remove successfully")
    )
})
const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
     if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id ")
    }
     if(!name || !description){
        throw new ApiError(400,"All field is required")
    }
     

    const playlists=await Playlist.findById(playlistId)
     if(!playlists){
        throw new ApiError(404,"Play list does not exist")
    }
  
    if(playlists.owner.toString()!== req.user._id.toString()){
        throw new ApiError(403,"You are not eligible to update ")
    }
    const update=await Playlist.findByIdAndUpdate(
        playlistId,
        {
          $set:{
              name,
            description,
          }


        },
        {
            new:true
        }
    )
    return res.status(200)
    .json(
        new ApiResponse(200,update,"Update successful")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    deletePlaylist,
    updatePlaylist



}