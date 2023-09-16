const { Bols } = require("~/models/Bol");
const moment = require("moment");
const { UTC_TIMEZONES, timestamp, FORMAT_DATE } = require("~/utils/constants");
const { BOL_STATUS_ENUM, CATEGORY_LIST } = require("~/types/bols");
const { Customers } = require("~/models/Customer");
const { BolServices } = require("~/services/bolServices");

const NUMBER_COL = 6;

class BolController {
  //[GET] /bols
  async index(req, res, next) {
    try {
      const {
        bols,
        totalBol,
        totalFinish,
        totalNew,
        totalRefund,
        totalUnsuccess,
      } = await BolServices.list(req.query);

      res.status(200).json({
        data: bols,
        totalBol,
        totalUnsuccess,
        totalRefund,
        totalNew,
        totalFinish,
        meta: {
          pagination: {
            total: totalBol,
            limit: +limit,
            totalPages: Math.ceil(totalBol / +limit),
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

  //[GET] /bol/:id
  async detail(req, res, next) {
    try {
      const { id } = req.params;
      const bol = await Bols.findOne({ _id: id });

      if (!bol) {
        return res.status(200).json({
          data: null,
          status: 200,
          message: "Id not found",
        });
      }

      return res.status(200).json({
        data: bol,
        status: 200,
        message: "Get Detail Bol successfully",
      });
    } catch (error) {
      res.status(400).json({
        message: new Error(error).message,
      });
    }
  }
  //[GET] /bol/detail
  async detailByCode(req, res, next) {
    try {
      const { code } = req.query;
      const bol = await Bols.findOne({ code });
      if (!bol) {
        return res.status(200).json({
          data: null,
          status: 200,
          message: "Id not found",
        });
      }
      return res.status(200).json({
        data: bol,
        status: 200,
        message: "Get Detail Bol successfully",
      });
    } catch (error) {
      res.status(400).json({
        message: new Error(error).message,
      });
    }
  }

  //[PUT] /bol/update/:id
  async update(req, res, next) {
    try {
      const { id } = req.params;

      // Update bol
      await BolServices.update(id, req.body);

      res.json({
        status: 200,
        message: "Bol updated successfully",
      });
    } catch (error) {
      res.status(400).json({
        message: new Error(error).message,
      });
    }
  }

  //[DEL] /bol/delete/ :id
  async destroy(req, res, next) {
    try {
      const { id } = req.params;
      await Bols.deleteOne({ _id: id });
      return res.status(200).json({
        error: 0,
        message: "Bol deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        message: new Error(error).message,
      });
    }
  }

  //[POST] /BOLS/create
  async store(req, res, next) {
    try {
      const bol = BolServices.store(req.body);

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

  //[POST] /bol/import
  async upload(req, res, next) {
    try {
      if (!req.file)
        return res.status(404).json({
          error: true,
          message: "File not found",
        });

      await BolServices.update(req.file.buffer);

      res.status(200).json({
        error: 0,
        message: "Import bols successfully",
      });
    } catch (error) {
      res.status(400).json({
        message: new Error(error).message,
      });
    }

    // Parse a buffer
  }
}

module.exports = new BolController();
