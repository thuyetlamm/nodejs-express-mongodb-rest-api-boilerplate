import * as yup from "yup";
// Hidden for simplicity

const createSchema = yup.object({
  body: yup.object({
    code: yup.string().trim().min(6).max(15).required("The name is required"),
    from: yup.string().trim().required("The From is required"),
    status: yup.number().required("The Status is required"),
    quantity: yup.number().required("The Quantity is required"),
    customerId: yup.string().required("The customerId is required"),
    startDate: yup.date("Type Date").required("The startDate is required"),
    address: yup.string().trim().required("The address is required"),
  }),
});

const updateSchema = yup.object({
  body: yup.object({
    code: yup.string().trim().min(6).max(15).required("The name is required"),
    from: yup.string().trim().required("The From is required"),
    status: yup.number().required("The Status is required"),
    quantity: yup.number().required("The Quantity is required"),
    customerId: yup.string().required("The customerId is required"),
    startDate: yup.date("Type Date").required("The startDate is required"),
    address: yup.string().trim().required("The address is required"),
  }),
  params: yup.object({
    id: yup.string().trim().required("The params id is required"),
  }),
});

const deleteSchema = yup.object({
  params: yup.object({
    id: yup.string().trim().min(10).required("The id is required"),
  }),
});

const detailByCode = yup.object({
  query: yup.object({
    code: yup.string().trim().min(10).required("The id is required"),
  }),
});

export const validateBol = {
  createSchema,
  deleteSchema,
  updateSchema,
  detailByCode,
};
