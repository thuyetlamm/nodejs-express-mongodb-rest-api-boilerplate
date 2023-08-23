import * as yup from "yup";
// Hidden for simplicity

const loginSchema = yup.object({
  body: yup.object({
    password: yup.string().min(6).required("The password is required"),
    username: yup
      .string()
      .trim()
      .min(10)
      .max(255)
      .required("The Email is required"),
  }),
});

export const validateAuth = { loginSchema };
