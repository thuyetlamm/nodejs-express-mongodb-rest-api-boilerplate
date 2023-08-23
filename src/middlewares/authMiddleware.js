const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const token = req.headers?.authorization?.split(" ")?.[1];
  if (!token)
    return res.status(403).json({
      status: 403,
      error: true,
      message: "Invalid token",
    });

  try {
    const verify = jwt.verify(token, process.env.JWT_SECRET_KEY);
    next();
  } catch (error) {
    res.status(403).json({
      error: true,
      message: "Authentication failed",
    });
  }
};

export default authMiddleware;
