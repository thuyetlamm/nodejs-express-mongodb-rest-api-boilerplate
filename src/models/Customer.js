import { Schema, model } from "mongoose";
const timeZone = require("mongoose-timezone");

const Customer = new Schema(
  {
    name: { type: String, maxLength: 100 },
    address: { type: String, maxLength: 200 },
  },
  {
    timestamps: true,
  }
);
Customer.plugin(timeZone);

export const Customers = model("Customer", Customer);
