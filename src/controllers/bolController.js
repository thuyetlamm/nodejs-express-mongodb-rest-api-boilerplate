const XLSX = require("xlsx");
const { Bols } = require("~/models/Bol");
const moment = require("moment");
const { UTC_TIMEZONES, timestamp, FORMAT_DATE } = require("~/utils/constants");
const { BOL_STATUS_ENUM } = require("~/types/bols");

const NUMBER_COL = 6;

class BolController {
  //[GET] /users
  async index(req, res, next) {
    const {
      limit = 10,
      page = 1,
      keyword,
      status = -1,
      customerCode,
      from,
      to,
    } = req.query;
    try {
      // Convert params to need type
      const fromDate = from
        ? moment(from).format(FORMAT_DATE.YMD)
        : moment().subtract(6, "days").format(FORMAT_DATE.YMD);
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
        startDate: {
          $gte: fromDate,
          $lte: toDate,
        },
      };

      if (+status !== -1) {
        query.status = +status;
      }

      if (customerCode) {
        query.customerCode = customerCode;
      }

      const bols = await Bols.find(query)
        .limit(+limit)
        .skip(+limit * (+page - 1))
        .sort([["updatedAt", -1]]);

      const totalBol = await Bols.countDocuments({
        ...query,
        status: BOL_STATUS_ENUM.ALL,
      });
      const totalNew = await Bols.countDocuments({
        ...query,
        status: BOL_STATUS_ENUM.NEW,
      });
      const totalRefund = await Bols.countDocuments({
        ...query,
        status: BOL_STATUS_ENUM.REFURNING,
      });
      const totalFinish = await Bols.countDocuments({
        ...query,
        status: BOL_STATUS_ENUM.FINISHED,
      });
      const totalUnsuccess = await Bols.countDocuments({
        ...query,
        status: BOL_STATUS_ENUM.UNSCCESSFUL,
      });

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
      const bolDetail = await Bols.findOne({ _id: id });
      const payload = req.body;
      const startDate = moment(payload.startDate).format(FORMAT_DATE.YMDHm);
      const endDate = payload?.endDate
        ? moment(payload.endDate).format(FORMAT_DATE.YMDHm)
        : null;
      const payloadUpdate = {
        ...payload,
        startDate,
        endDate,
      };
      bolDetail.updateOne(id, payloadUpdate);
      await bolDetail.validate();
      await bolDetail.save();
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
      const payload = req.body;
      const startDate = moment(payload.startDate).format("YYYY-MM-DD HH:mm:ss");
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

  //[POST] /bol/import
  async upload(req, res, next) {
    try {
      if (!req.file)
        return res.status(404).json({
          error: true,
          message: "File not found",
        });

      const workBook = XLSX.read(req.file.buffer, { cellDates: true });
      const wordSheet = workBook.Sheets[workBook.SheetNames[0]];
      const countRow = XLSX.utils.sheet_to_json(wordSheet);
      const arrayPayload = [];

      for (let index = 2; index <= countRow.length + 1; index++) {
        const startDate = wordSheet[`A${index}`]?.v || "";
        const code = wordSheet[`B${index}`]?.v || "";
        const customerCode = wordSheet[`C${index}`]?.v || "";
        const receivedName = wordSheet[`D${index}`]?.v || "";
        const receivedPhoneNumber = wordSheet[`F${index}`]?.v || "";
        const category = wordSheet[`E${index}`]?.v || "";
        const address = wordSheet[`G${index}`]?.v || "";

        arrayPayload.push({
          code,
          category,
          address,
          from: "Hồ Chí Minh",
          receivedName,
          receivedPhoneNumber,
          startDate: moment(startDate)
            .tz(UTC_TIMEZONES)
            .add(1, "day")
            .format("YYYY-MM-DD HH:mm"),
          customerCode,
          status: 1,
        });
      }
      const bols = await Bols.insertMany(arrayPayload);

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
