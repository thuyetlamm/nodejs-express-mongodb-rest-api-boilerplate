import * as yup from "yup";
// Hidden for simplicity

const createSchema = yup.object({
  body: yup.object({
    code: yup.string().trim().min(6).max(15).required("The name is required"),
    categoryId: yup.number().required("The name is required"),
    from: yup.string().trim().required("The From is required"),
    status: yup.number().required("The Status is required"),
    customerId: yup.number().required("The customerId is required"),
    startDate: yup.date("Type Date").required("The startDate is required"),
    ward: yup.string().trim().required("The ward is required"),
    district: yup.string().trim().required("The district is required"),
    city: yup.string().trim().required("The city is required"),
    address: yup.string().trim().required("The address is required"),
  }),
});

const updateSchema = yup.object({
  body: yup.object({
    fullname: yup.string().trim().min(10).required("The name is required"),
    username: yup.string().trim().min(10).required("The name is required"),
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

export const validateBol = { createSchema, deleteSchema, updateSchema };
