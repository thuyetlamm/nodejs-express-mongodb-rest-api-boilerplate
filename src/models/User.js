import { Schema, model } from "mongoose";

const User = new Schema(
  {
    fullname: { type: String, maxLength: 50 },
    email: { type: String, maxLength: 100, unique: true },
    password: { type: String },
    type: { type: Number, default: 1 },
    status: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

export const Users = model("User", User);
