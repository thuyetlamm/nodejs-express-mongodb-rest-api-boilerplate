import { Schema, model } from "mongoose";
const timeZone = require("mongoose-timezone");

const Wish = new Schema(
  {
    name: { type: String, require: true, maxLength: 100 },
    wishes: { type: String, require: true, default: "" },
  },
  {
    timestamps: true,
  }
);
Wish.plugin(timeZone);

export const Wishes = model("Wish", Wish);
