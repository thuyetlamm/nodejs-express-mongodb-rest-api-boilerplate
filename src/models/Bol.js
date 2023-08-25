import { Schema, model } from "mongoose";
const timeZone = require("mongoose-timezone");

const Bol = new Schema(
  {
    code: { type: String, maxLength: 50, required: true, unique: true },
    from: { type: String, maxLength: 50, required: true },
    city: { type: String, maxLength: 100 },
    address: { type: String, maxLength: 100 },
    userName: { type: String, maxLength: 255, default: "" },
    ward: { type: String, maxLength: 100 },
    distrist: { type: String, maxLength: 100 },
    customerId: { type: String, required: true },
    customerName: { type: String },
    path: { type: String, default: "" },
    description: { type: String, default: "", maxLength: 255 },
    status: { type: Number, default: 1 },
    startDate: { type: Date, default: new Date() },
    endDate: { type: Date, default: null },
    categoriId: { type: Number },
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
