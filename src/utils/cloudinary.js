import { v2 as cloudinary } from "cloudinary";
import {deleteLocalFile} from './tempDelete.js'
import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// const uploadOnCloudinary = async (localFilePath,folder) => {
//   try {
//     // tried something different
//     if (!localFilePath) throw new ApiError(
//       400,
//       "Avatar file path is missing. Cannot upload to Cloudinary."
//     );
//     if (!folder) throw new ApiError(
//       400,
//       "Cloudinary folder name is required for file upload."
//     );
//     const response = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: "auto",
//       folder
//     });
//     // file upload successfull
//     console.log("File is uploaded on cloudinary", response.url,response.public_id);

//     // tried by myself

//     fs.unlinkSync(localFilePath);
//     return response;
//   } catch (error) {
//     fs.unlinkSync(localFilePath);
//     return null;
//   }
// };

const uploadOnCloudinary = async (localFilePath, folder) => {
  if (!localFilePath) {
    throw new ApiError(
      400,
      "File path is missing. Upload aborted before Cloudinary request."
    );
  }

  if (!folder) {
    throw new ApiError(
      400,
      "Target Cloudinary folder not specified. Upload cannot proceed."
    );
  }

  // try {
  //   const response = await cloudinary.uploader.upload(localFilePath, {
  //     folder,
  //     resource_type: "auto",
  //   });
  //   fs.unlinkSync(localFilePath);
  //   return response;
  // } catch (error) {
  //   fs.unlinkSync(localFilePath);
  //   throw new ApiError(
  //     502,
  //     "Cloudinary upload failed. Please try again later.",
  //     error
  //   );
  // }

  let response;

  try {
    response = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: "auto",
    });

    return response;
  } catch (error) {
    throw new ApiError(502, "Cloudinary upload failed", error);
  } finally {
    // ALWAYS clean temp file
    deleteLocalFile(localFilePath);
  }
};


export { uploadOnCloudinary };
