import mongoose from "mongoose";
const Schema = mongoose.Schema;
const model = mongoose.model;

import timeZone from "mongoose-timezone";

const Device = new Schema(
  {
    wishId: { type: String, require: true },
    uuid: { type: String, require: true, default: "" },
  },
  {
    timestamps: true,
  }
);
Device.plugin(timeZone);

export const Devices = model("Device", Device);
