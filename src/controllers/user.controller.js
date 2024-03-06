import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";



const registerUser = asyncHandler(async(req,res) =>{
  //get details from thr frontend
  //validation -not empty
  //check if user already registered uername and email
  //check for images ,avatar
  //upload them to cloudnary
  //crate user object -create entry in db
  //remove password and refresh token feild from rsponse
  //check for user creation
  //return res


  const{Fullname,email,username,password}=req.body
  // console.log("email :",email);
  if(
    [Fullname ,email ,username,password].some((field) => field?.trim()==="")
  
  ){
    throw new ApiError(400,"All feilds are required")
    
  }
const existedUser=await User.findOne({
    $or:[{username},{email}]
})

if(existedUser){
    throw new ApiError(409,"User with email or username exists")
}
// console.log(req.files);
const avatarLocalPath= req.files?.avatar[0]?.path;
// const coverImageLocalpath=req.files?.coverImage[0]?.path;

let coverImageLocalpath;
if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0) {
  coverImageLocalpath=req.files.coverImage[0].path
}

if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
}

const avatar=await uploadOnCloudinary(avatarLocalPath)
const coverImage=await uploadOnCloudinary(coverImageLocalpath)


if(!avatar){
    throw new ApiError(400,"Avatarfile is required")
}
const user=await User.create({
    Fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
})
const createdUser=await User.findById(user._id).select(
  "-password -refreshTokens"
)
if(!createdUser){
  throw new ApiError(500, "Something went wrong while registering user")
}

return res.status(201).json(
  new ApiResponse(200,createdUser,"User Registered Successfully")
)
} )



export {
    registerUser,
}