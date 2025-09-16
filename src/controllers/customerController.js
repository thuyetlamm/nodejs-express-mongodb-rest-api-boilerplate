import { Customers } from "../models/Customer.js";

class CustomerController {
  // [GET] /customers

  async index(req, res, next) {
    try {
      const customers = await Customers.find({});
      res.status(200).json({
        data: customers,
        status: 200,
        message: "Get All Customer successfully",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // [POST] /customer/create
  async store(req, res, next) {
    try {
      const payload = req.body;

      const newPayload = {
        ...payload,
        code: payload.code.toUpperCase(),
      };

      const customer = await Customers.create(newPayload);
      res.json({
        status: 200,
        data: customer,
        message: "Customer created successfully",
      });
    } catch (error) {
      res.status(404).json({
        message: new Error(error).message,
      });
    }
  }

  // [POST] /customer/create
  async update(req, res, next) {
    try {
      const payload = req.body;

      const newPayload = {
        ...payload,
        code: payload.code.toUpperCase(),
      };
      const { id } = req.params;

      const customer = await Customers.findByIdAndUpdate(id, newPayload);
      res.json({
        status: 200,
        data: customer,
        message: "Customer updated successfully",
      });
    } catch (error) {
      res.status(404).json({
        message: new Error(error).message,
      });
    }
  }

  // [DELETE] /customer/delete/:id
  async destroy(req, res, next) {
    try {
      const payload = req.params;

      const customer = await Customers.deleteOne({ _id: payload.id });
      if (customer.deletedCount) {
        res.json({
          status: 200,
          message: "Customer delete successfully",
        });
      } else {
        res.json({
          status: 400,
          message: "Id not found",
        });
      }
    } catch (error) {
      res.status(500).json({
        message: new Error(error).message,
      });
    }
  }
}

export default new CustomerController();
