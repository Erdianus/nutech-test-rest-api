import * as userService from "../services/user_service.js";

async function getProfile(req, res, next) {
  try {
    const baseUrl =
      process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    // req.user.id comes from the JWT token via auth middleware
    const profile = await userService.getProfile({
      userId: req.user.id,
      baseUrl,
    });
    res.json({
      status: 0,
      message: "Sukses",
      data: profile,
    });
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const { first_name, last_name } = req.body;
    const baseUrl =
      process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;

    const data = await userService.editUser({
      userId: req.user.id,
      first_name,
      last_name,
      baseUrl,
    });
    res.json({
      status: 0,
      message: "Update Profile berhasil",
      data: data,
    });
  } catch (err) {
    next(err);
  }
}

async function uploadProfileImage(req, res, next) {
  try {
    const baseUrl =
      process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    console.log(req.file);

    const result = await userService.uploadProfileImage({
      userId: req.user.id,
      file: req.file,
      baseUrl
    });
    res.json({
      status: 0,
      message: "Update Profile Image berhasil",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export { getProfile, updateUser, uploadProfileImage };
