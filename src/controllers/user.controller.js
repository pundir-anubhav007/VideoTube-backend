import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

// we should console multiple things like req.body, User.findOne, req.files
// I need to do this to improve learning

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating Access and Refresh Token",
      error
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // Get user details from frontend
  // validate input details
  // check if user already exists: username & email
  // files uploaded or not: avatar required, coverImage optional
  // upload them to cloudinary, avatar is upladed compulsory
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const { fullName, email, password, username } = req.body;

  if (
    [fullName, email, password, username].some(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with given username or email already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path; // small change from gpt

  if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");

  const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath,"users/avatars");

  // this logic is from chatgpt of no coverImageLocalPath

  const uploadedCoverImage =
    coverImageLocalPath && (await uploadOnCloudinary(coverImageLocalPath,"users/coverImages"));

  if (!uploadedAvatar) throw new ApiError(400, "Error while uploading avatar on cloudinary");

  const user = await User.create({
    fullName,
    avatar: {
      url: uploadedAvatar.secure_url,
      public_id: uploadedAvatar.public_id,
    },
    coverImage: uploadedCoverImage?.secure_url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser)
    throw new ApiError(500, "Something went wrong while registering user");

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // get email and password from req.body
  // validate input details
  // check if user exists with given email
  // compare password
  // generate access token and refresh token
  // set refresh token in httpOnly cookie
  // return response with access token and user details without password and refresh token

  const { email, username, password } = req.body;
  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, " User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password Incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
        },
        "User Logged In Successfully"
      )
    );
});


const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id,
    {
      $unset: {
        refreshToken: 1 // why not working with undefined -> will check later
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(
        200,
        {},
        "User Logged Out Successfully"
      )
    );
})

const changeCurrentUserPassword = asyncHandler(async (req,res) => {
    const {oldPassword, newPassword, confirmPassword } = req.body
    if( newPassword !== confirmPassword ) throw new ApiError(400,"New and Confirm Password does not match")

    const user = await User.findById(req.user?._id)
    const PasswordMatch = await user.isPasswordCorrect(oldPassword)

    if(!PasswordMatch) throw new ApiError(400,'Incorrect Old Password')

    user.password = newPassword
    await user.save({ validateBeforeSave: false });


    return res.status(200)
    .json(new ApiResponse(200,"Password Updated Successfully "))
})

const getCurrentUser = asyncHandler(async (req,res) => {

  return res
  .status(200)
  .json(req.user, "Current User is fetched Successfully ")

})


const updateAccountdetails = asyncHandler(async(req,res) => {

  const {fullName, email} = req.body

  if(!fullName && !email) throw new ApiError(400,"All fields are required")

  const user = await User.findByIdAndUpdate(req.user?._id,
     {
      $set: {
        fullName,
        email
      }
    },
    {new: true}
  ).select("-password -refreshToken")

  return res.status(200)
  .json(new ApiResponse(200,user, "Details successfully updated"))

})

// const updateAvatar = asyncHandler(async (req, res) => {
//     const newAvatarPath = req.file?.path

//     if(!newAvatarPath) throw new ApiError(400,"Avatar file is missing")

//     const updateOnCloudinary = await uploadOnCloudinary(newAvatarPath,"users/avatar")
//     if(!updateOnCloudinary.url) throw new ApiError(500,"Error while uploading on Cloudinary")
//     const user = await User.findByIdAndUpdate(req.user?._id,
//       {
//         $set: {
//           avatar: updateOnCloudinary.url
//         }
//       },
//       {new: true}
//     ).select("-password -refreshToken")

//     return res
//       .status(200)
//       .json(new ApiResponse(200, user, "Avatar Successfully updated"));


// });

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath =  req.file?.path
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }


// Here i will check that can i do everything without that db query bcz i have access to user object through auth middleware

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const oldAvatar = user.avatar;
  let newUpload;

  try {
    // 1️⃣ Upload new image
    newUpload = await uploadOnCloudinary(avatarLocalPath, "users/avatar");

    // 2️⃣ Update DB
    user.avatar = {
      url: newUpload.secure_url,
      public_id: newUpload.public_id,
    };

    await user.save({validateBeforeSave: false});

    // 3️⃣ Delete old image AFTER DB success
    if (oldAvatar?.public_id) {
      await cloudinary.uploader.destroy(oldAvatar.public_id);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Avatar updated successfully", user.avatar));
  } catch (error) {
    // 🔁 ROLLBACK

    if (newUpload?.public_id) {
      await cloudinary.uploader.destroy(newUpload.public_id);
    }

    throw error;
  }
});


// const updateCover = asyncHandler(async (req, res) => {
//   const newCoverPath = req.file?.path;

//   if (!newCoverPath) throw new ApiError(400, "CoverImage file is missing");

//   const updateOnCloudinary = await uploadOnCloudinary(newCoverPath);
//   if (!updateOnCloudinary.url)
//     throw new ApiError(500, "Error while uploading coverImage on Cloudinary");
//   const user = await User.findByIdAndUpdate(
//     req.user?._id,
//     {
//       $set: {
//         coverImage: updateOnCloudinary.url,
//       },
//     },
//     { new: true }
//   ).select("-password -refreshToken");

//   return res
//     .status(200)
//     .json(new ApiResponse(200, user, "CoverImage  Successfully updated"));
// });

const updateCover = asyncHandler(async (req, res) => {
  const newCoverPath = req.file?.path;

    if (!newCoverPath) throw new ApiError(400, "CoverImage file is missing");


  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const oldCover = user.coverImage;
  let newUpload;

  try {
    // 1️⃣ Upload new image
    newUpload = await uploadOnCloudinary(newCoverPath, "users/coverImages");

    // 2️⃣ Update DB
    user.coverImage = {
      url: newUpload.secure_url,
      public_id: newUpload.public_id,
    };

    await user.save({ validateBeforeSave: false });

    // 3️⃣ Delete old image AFTER DB success
    if (oldCover?.public_id) {
      await cloudinary.uploader.destroy(oldCover.public_id);
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, "CoverImage updated successfully", user.coverImage)
      );
  } catch (error) {
    // 🔁 ROLLBACK

    if (newUpload?.public_id) {
      await cloudinary.uploader.destroy(newUpload.public_id);
    }

    throw error;
  }

})

const getUserChannelProfile = asyncHandler(async(req,res) => {
  const {username} = req.params
  if(!username?.trim()) {
    throw new ApiError(400,"Username is missing")
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
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
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "SubscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        ChannelsSubscribedToCount: {
          $size: "$SubscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        ChannelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  console.log(channel)

  if(!channel?.length) {
    throw new ApiError(404, "Channel does not exists!!")
  }

  return res
  .status(200)
  .json( new ApiResponse(
    200,
    channel[0],
    "User fetched Successfully"
  ))
})

const getwatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },{
            $addFields: "$owner"
          }
        ]
      },
    },
  ]);

  console.log(user)
  console.log(user[0])
  console.log(user[0].watchHistory)

  return res
  .status(200)
  .json( new ApiResponse(
    200,
    user[0].watchHistory,
    "Watch History fetched Successfully"
  ))
})


export {
  registerUser,
  loginUser,
  logOutUser,
  changeCurrentUserPassword,
  getCurrentUser,
  updateAccountdetails,
  updateAvatar,
  updateCover,
  getUserChannelProfile,
  getwatchHistory,
};

