import * as yup from "yup";
// Hidden for simplicity

const createSchema = yup.object({
  body: yup.object({
    name: yup.string().trim().min(10).required("The name is required"),
    address: yup
      .string()
      .trim()
      .min(20)
      .max(255)
      .required("The address is required"),
  }),
});

const deleteSchema = yup.object({
  params: yup.object({
    id: yup.string().trim().min(10).required("The id is required"),
  }),
});

export const validateCustomer = { createSchema, deleteSchema };
