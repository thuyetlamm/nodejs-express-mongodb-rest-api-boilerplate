const { Wishes } = require("~/models/Wish");

class WishController {
  // [GET] /customers

  async index(req, res, next) {
    try {
      const wishes = await Wishes.find({});
      res.status(200).json({
        data: wishes,
        status: 200,
        message: "Get All Wishes successfully",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // [POST] /customer/create
  async store(req, res, next) {
    try {
      const payload = req.body;

      const wish = await Wishes.create(payload);
      res.json({
        status: 200,
        data: wish,
        message: "Wish created successfully",
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

      const customer = await Wishes.deleteOne({ _id: payload.id });
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

module.exports = new WishController();
