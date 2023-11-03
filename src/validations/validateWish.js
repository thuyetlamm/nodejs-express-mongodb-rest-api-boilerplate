import * as yup from "yup";
// Hidden for simplicity

const createSchema = yup.object({
  body: yup.object({
    name: yup.string().trim().min(6).required("The name is required"),
    wishes: yup.string().trim().min(2).required("The wishes is required"),
  }),
});

const deleteSchema = yup.object({
  params: yup.object({
    id: yup.string().trim().min(10).required("The id is required"),
  }),
});

export const validateWish = { createSchema, deleteSchema };
