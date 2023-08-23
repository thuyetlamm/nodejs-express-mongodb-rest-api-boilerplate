import * as yup from "yup";
// Hidden for simplicity

const createSchema = yup.object({
  body: yup.object({
    fullname: yup.string().trim().min(10).required("The name is required"),
    password: yup.string().min(6).required("The password is required"),
    email: yup
      .string()
      .trim()
      .email("Email address not true formatted")
      .min(10)
      .max(255)
      .required("The Email is required"),
  }),
});

const updateSchema = yup.object({
  body: yup.object({
    fullname: yup.string().trim().min(10).required("The name is required"),
    email: yup
      .string()
      .trim()
      .email("Email address not true formatted")
      .min(10)
      .max(255)
      .required("The Email is required"),
  }),
  params: yup.object({
    id: yup.string().trim().min(10).required("The id is required"),
  }),
});

const deleteSchema = yup.object({
  params: yup.object({
    id: yup.string().trim().min(10).required("The id is required"),
  }),
});

export const validateUser = { createSchema, deleteSchema, updateSchema };
