import mongoose from "mongoose";
import timeZone from "mongoose-timezone";

const Schema = mongoose.Schema;
const model = mongoose.model;
const Customer = new Schema(
  {
    name: { type: String, maxLength: 100 },
    address: { type: String, maxLength: 200 },
    code: { type: String, maxLength: 10 },
  },
  {
    timestamps: true,
  }
);
Customer.plugin(timeZone);

export const Customers = model("Customer", Customer);
