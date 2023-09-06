import { Schema, model } from "mongoose";
const timeZone = require("mongoose-timezone");

const User = new Schema(
  {
    fullname: { type: String, maxLength: 50 },
    username: { type: String, maxLength: 50, unique: true },
    role: { type: String, maxLength: 20 },
    avatar: { type: String, maxLength: 100 },
    address: { type: String, maxLength: 255 },
    email: { type: String, maxLength: 100, unique: true },
    password: { type: String, maxLength: 150 },
    type: { type: Number, default: 1 },
    status: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);
User.plugin(timeZone);

export const Users = model("User", User);
