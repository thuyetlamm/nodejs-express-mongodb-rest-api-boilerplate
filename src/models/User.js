import { Schema, model } from "mongoose";
const timeZone = require("mongoose-timezone");

const User = new Schema(
  {
    fullname: { type: String, maxLength: 50 },
    username: { type: String, maxLength: 50, unique: true },
    email: { type: String, maxLength: 100, unique: true },
    password: { type: String },
    type: { type: Number, default: 1 },
    status: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);
User.plugin(timeZone);

export const Users = model("User", User);
