const { Bols } = require("~/models/Bol");

class BolController {
  //[GET] /users
  async index(req, res, next) {
    const { limit, page, keyword, status } = req.query;
    try {
      // Convert params to need type
      const perPage = Number(limit) || 10;
      const pageNumber = Math.max(1, page);
      const queryStatus = Number(status) || -1;

      // QUERY OBJECTS
      const query = {
        $or: [
          {
            code: { $regex: keyword || "", $options: "i" },
          },
        ],
      };

      if (queryStatus !== -1) {
        query.status = queryStatus;
      }

      const bols = await Bols.find(query)
        .limit(perPage)
        .skip(perPage * (Number(pageNumber) - 1))
        .sort([["updatedAt", -1]]);

      const totalBol = await Bols.countDocuments(query);

      res.status(200).json({
        data: bols,
        meta: {
          pagination: {
            total: totalBol,
            limit: perPage,
            totalPages: Math.ceil(totalBol / perPage),
            currentPage: +page,
          },
        },
        status: 200,
        message: "Get All Bols successfully",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new BolController();
