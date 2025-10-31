import * as userService from "../services/user_service.js";

async function register(req, res, next) {
  try {
    const { first_name, last_name, email, password } = req.body;
    const user = await userService.register({
      first_name,
      last_name,
      email,
      password,
    });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const data = await userService.login({ email, password });
    res.json(data);
  } catch (err) {
    // Handle login-specific errors with custom format
    if (err.status === 103) {
      return res.status(err.httpStatus || 401).json({
        status: err.status,
        message: err.message,
        data: null,
      });
    }
    next(err);
  }
}

export { register, login };
