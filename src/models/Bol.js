import mongoose from "mongoose";
const Schema = mongoose.Schema;
const model = mongoose.model;
import timeZone from "mongoose-timezone";

const Bol = new Schema(
  {
    code: { type: String, maxLength: 20, required: true, unique: true },
    from: { type: String, maxLength: 50, required: true },
    address: { type: String, maxLength: 255, require: true },
    userName: { type: String, maxLength: 255, default: "" },
    receivedName: { type: String, maxLength: 50, default: "" },
    receivedPhoneNumber: { type: String, maxLength: 12, default: "" },
    customerCode: { type: String, default: "" },
    customerName: { type: String, default: "" },
    customerId: { type: String, default: "" },
    quantity: { type: Number, required: true, default: 1 },
    path: { type: String, default: "" },
    type: { type: String, default: "" },
    weight: { type: Number, default: 0 },
    description: { type: String, default: "", maxLength: 255 },
    status: { type: Number, default: 1 },
    startDate: { type: Date, default: new Date() },
    endDate: { type: Date, default: null },
    category: { type: Array, required: true },
    reason: { type: Array, default: [] },
  },
  {
    timestamps: true,
  }
);

Bol.plugin(timeZone, {
  paths: ["startDate", "endDate", "updatedAt", "createdAt"],
});

export const Bols = model("Bol", Bol);
