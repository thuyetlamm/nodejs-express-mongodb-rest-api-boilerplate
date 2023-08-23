import { Schema, model } from "mongoose";

const User = new Schema(
  {
    fullname: { type: String, maxLength: 50 },
    email: { type: String, maxLength: 100 },
    type: Number,
    refreshToken: String,
  },
  {
    timestamps: true,
  }
);

export const Users = model("User", User);
