const { Bols } = require("~/models/Bol");
const moment = require("moment");
const { UTC_TIMEZONES, timestamp, FORMAT_DATE } = require("~/utils/constants");

class BolController {
  //[GET] /users
  async index(req, res, next) {
    const { limit, page, keyword, status, categoryId, from, to } = req.query;
    try {
      // Convert params to need type
      const perPage = Number(limit) || 10;
      const pageNumber = Math.max(1, page);
      const queryStatus = Number(status) || -1;
      const fromDate = from
        ? moment(from).format(FORMAT_DATE.YMD)
        : moment().format(FORMAT_DATE.YMD);
      const toDate = to
        ? moment(to).add(1, "day").format(FORMAT_DATE.YMD)
        : moment().add(1, "day").format(FORMAT_DATE.YMD);

      // QUERY OBJECTS
      const query = {
        $or: [
          {
            code: { $regex: keyword || "", $options: "i" },
          },
        ],
        createdAt: {
          $gte: fromDate,
          $lte: toDate,
        },
      };

      if (queryStatus !== -1) {
        query.status = queryStatus;
      }

      if (categoryId) {
        query.categoryId = categoryId;
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

  //[POST] /users/create
  async store(req, res, next) {
    try {
      const payload = req.body;
      const startDate = moment
        .tz(payload.startDate, UTC_TIMEZONES)
        .format("YYYY-MM-DD HH:mm:ss");
      const convertPayload = {
        ...payload,
        startDate,
      };
      const bol = await Bols.create(convertPayload);

      res.json({
        status: 200,
        data: bol,
        message: "Bol created successfully",
      });
    } catch (error) {
      res.status(400).json({
        message: new Error(error).message,
      });
    }
  }
}

module.exports = new BolController();
