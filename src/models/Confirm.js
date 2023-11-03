import { Schema, model } from "mongoose";
const timeZone = require("mongoose-timezone");

const Confirm = new Schema(
  {
    name: { type: String, require: true, maxLength: 100 },
    quanity: { type: Number, require: true, default: 1 },
  },
  {
    timestamps: true,
  }
);
Confirm.plugin(timeZone);

export const Confirms = model("Confirm", Confirm);
