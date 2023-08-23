import { Schema, model } from "mongoose";

const Customer = new Schema(
  {
    name: { type: String, maxLength: 100 },
    address: { type: String, maxLength: 200 },
  },
  {
    timestamps: true,
  }
);

export const Customers = model("Customer", Customer);
