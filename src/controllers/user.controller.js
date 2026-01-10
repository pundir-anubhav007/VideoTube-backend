import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// we should console multiple things like req.body, User.findOne, req.files
// I need to do this to improve learning

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

  if (existingUser.username === username) {
    throw new ApiError(409, "Username already taken");
  }

  if (existingUser.email === email) {
    throw new ApiError(409, "Email already registered");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");

  const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
  const uploadedCoverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!uploadedAvatar) throw new ApiError(400, "Avatar file is required");

  const user = await User.create({
    fullName,
    avatar: uploadedAvatar.url,
    coverImage: uploadedCoverImage?.url || "",
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

export { registerUser };
