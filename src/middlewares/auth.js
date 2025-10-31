import jwt from "jsonwebtoken";

function auth(req, res, next) {
  const authz = req.headers.authorization || "";
  const token = authz.startsWith("Bearer ") ? authz.slice(7) : null;
  const unauthorized = {
    status: 108,
    message: "Token tidak valid atau kadaluarsa",
    data: null,
  };
  if (!token) return res.status(401).json(unauthorized);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    return res.status(401).json(unauthorized);
  }
}
export { auth };
