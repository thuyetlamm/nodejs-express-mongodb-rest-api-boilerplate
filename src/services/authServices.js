import jwt from "jsonwebtoken";

export const generatorAccessToken = (user) => {
  return jwt.sign(
    { _id: user._id, email: user.email },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "24h",
    }
  );
};

export const generatorRefreshToken = (user) => {
  return jwt.sign(
    { _id: user._id, email: user.email },
    process.env.JWT_SECRET_KEY2,
    {
      expiresIn: "90d",
    }
  );
};

export const refreshTokenService = (token) => {
  return new Promise((resolve, reject) => {
    try {
      jwt.verify(token, process.env.JWT_SECRET_KEY2, function (err, user) {
        if (err) {
          return resolve({ error: true, message: "Token Expried" });
        }
        const newAccessToken = generatorAccessToken(user);
        resolve({
          status: 200,
          accessToken: newAccessToken,
        });
      });
    } catch (err) {
      reject({ error: true, message: "Token Expried" });
    }
  });
};
