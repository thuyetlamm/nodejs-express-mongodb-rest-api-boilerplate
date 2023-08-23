import { Users } from "~/models/User";

import bcrypt from "bcrypt";
import {
  generatorAccessToken,
  generatorRefreshToken,
  refreshTokenService,
} from "~/services/authServices";

const jwt = require("jsonwebtoken");

class AuthController {
  //[POST] /auth/login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await Users.findOne({ email });

      // chec

      if (!user) {
        return res.status(401).json({
          error: 1,
          message: "Email is incorrect",
        });
      }

      const comparePassword = await bcrypt.compare(password, user.password);

      // Check password against
      if (!comparePassword)
        return res.status(401).json({
          error: 1,
          message: "Invalid password",
        });

      const accessToken = generatorAccessToken(user);
      const refreshToken = generatorRefreshToken(user);

      return res.status(200).json({
        status: 200,
        data: {
          accessToken,
          refreshToken,
        },
        message: "Login successfully",
      });
    } catch (error) {
      res.status(400).json({
        error: 1,
        message: new Error(error).message,
      });
    }
  }

  // [POST] /auth/resetToken

  async refreshToken(req, res, next) {
    try {
      const token = req.headers?.authorization?.split(" ")?.[1];

      if (!token)
        return res.status(401).json({
          error: 1,
          message: "The refresh token required",
        });
      const response = await refreshTokenService(token);

      res.json(response);
    } catch (error) {
      res.status(403).json({
        error: true,
        message: new Error(error).message,
      });
    }
  }

  //[GET] /auth/profile

  async getProfile(req, res) {
    const token = req.headers?.authorization?.split(" ")?.[1];

    if (!token)
      return res.status(401).json({
        error: 1,
        message: "The token required",
      });
    try {
      const verify = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user = await Users.findOne({ _id: verify?._id });

      const { type, fullname, email, status, _id } = user;
      res.status(200).json({
        status: 200,
        data: {
          _id,
          type,
          fullname,
          email,
          status,
        },
        message: "Get profile information successfully",
      });
    } catch (error) {
      res.status(500).json({
        error: true,
        status: 403,
        message: error.message,
      });
    }
  }
}

module.exports = new AuthController();
