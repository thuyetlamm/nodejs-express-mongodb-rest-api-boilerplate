import * as yup from "yup";
// Hidden for simplicity

const createSchema = yup.object({
  body: yup.object({
    name: yup.string().trim().min(2).required("The name is required"),
    quantity: yup.number().min(1).required("The quantity is required"),
  }),
});

const deleteSchema = yup.object({
  params: yup.object({
    id: yup.string().trim().min(10).required("The id is required"),
  }),
});

export const validateConfirm = { createSchema, deleteSchema };
