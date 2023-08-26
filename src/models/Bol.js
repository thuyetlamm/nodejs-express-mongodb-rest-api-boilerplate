import { Schema, model } from "mongoose";
const timeZone = require("mongoose-timezone");

const Bol = new Schema(
  {
    code: { type: String, maxLength: 50, required: true, unique: true },
    from: { type: String, maxLength: 50, required: true },
    city: { type: String, maxLength: 100 },
    address: { type: String, maxLength: 100, require: true },
    userName: { type: String, maxLength: 255, default: "" },
    receivedName: { type: String, maxLength: 50, default: "" },
    receivedPhoneNumber: { type: String, maxLength: 12, default: "" },
    ward: { type: String, maxLength: 100, default: "" },
    distrist: { type: String, maxLength: 100, default: "" },
    customerCode: { type: String, required: true },
    customerName: { type: String, default: "" },
    path: { type: String, default: "" },
    description: { type: String, default: "", maxLength: 255 },
    status: { type: Number, default: 1 },
    startDate: { type: Date, default: new Date() },
    endDate: { type: Date, default: null },
    category: { type: String },
    remark: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

Bol.plugin(timeZone, {
  paths: ["startDate", "endDate", "updatedAt", "createdAt"],
});

export const Bols = model("Bol", Bol);
