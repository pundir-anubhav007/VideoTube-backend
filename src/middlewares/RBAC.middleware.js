import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const authorize = asyncHandler(async (req, res, next) => {
if(!req.user) {
    throw new ApiError(401, "Unauthorized Access");
}

if(!allowedRoles || allowedRoles.length === 0) {

      throw new ApiError(
        400,
        "Role not specified for this route. Please contact support."
      );

}
if (!allowedRoles.includes(req.user.role)) {
    throw new ApiError(403, "Forbidden Access");
}
next();
});

export default authorize;
