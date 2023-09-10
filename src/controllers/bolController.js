const XLSX = require("xlsx");
const { Bols } = require("~/models/Bol");
const moment = require("moment");
const { UTC_TIMEZONES, timestamp, FORMAT_DATE } = require("~/utils/constants");
const { BOL_STATUS_ENUM, CATEGORY_LIST } = require("~/types/bols");
const { Customers } = require("~/models/Customer");

const NUMBER_COL = 6;

class BolController {
  //[GET] /bols
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
        createdAt: {
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

      const { status: spreadStatus, ...allQuery } = query;

      const totalBol = await Bols.countDocuments(allQuery);
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
      const payload = req.body;
      const startDate = moment(payload.startDate)
        .subtract(1, "day")
        .format(FORMAT_DATE.YMDHm);
      const endDate = payload?.endDate
        ? moment(payload.endDate).format(FORMAT_DATE.YMDHm)
        : null;

      const currentCustomer = await Customers.findOne({
        _id: payload.customerId,
      });

      const convertPayload = {
        ...payload,
        customerCode: currentCustomer.code,
        customerName: currentCustomer.name,
        startDate,
        endDate,
      };
      const bolDetail = await Bols.findOneAndUpdate(
        { _id: id },
        { $set: convertPayload },
        { upsert: true }
      );
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
      const startDate = moment(payload.startDate).format("YYYY-MM-DD HH:mm");
      const endDate = payload.endDate
        ? moment(payload.startDate).format("YYYY-MM-DD HH:mm")
        : null;

      const currentCustomer = await Customers.findOne({
        _id: payload.customerId,
      });

      const convertPayload = {
        ...payload,
        customerCode: currentCustomer.code,
        customerName: currentCustomer.name,
        startDate,
        endDate,
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

      const customerList = await Customers.find({});

      const workBook = XLSX.read(req.file.buffer, { cellDates: true });
      const wordSheet = workBook.Sheets[workBook.SheetNames[0]];
      const countRow = XLSX.utils.sheet_to_json(wordSheet);
      const arrayPayload = [];

      for (let index = 2; index <= countRow.length + 1; index++) {
        const startDate = wordSheet[`A${index}`]?.v || moment().format();
        const code = wordSheet[`B${index}`]?.v || "";
        const customerCode = wordSheet[`C${index}`]?.v || "";
        const receivedName = wordSheet[`D${index}`]?.v || "";
        const receivedPhoneNumber = wordSheet[`E${index}`]?.v || "";
        const address = wordSheet[`F${index}`]?.v || "";
        const category = wordSheet[`G${index}`]?.v || "";
        const quantity = wordSheet[`H${index}`]?.v || 1;
        const convertCategoryList = category.split("+") || [];

        const categoryAfterConvertToObject = convertCategoryList?.reduce(
          (acc, category) => {
            const findCategory = CATEGORY_LIST.find((item) =>
              item.code.includes(category.toUpperCase())
            );
            if (findCategory) {
              return [...acc, findCategory];
            }
            return acc;
          },
          []
        );

        const currentCustomer = customerList.find(
          (c) => c.code === customerCode
        );

        arrayPayload.push({
          code,
          category: categoryAfterConvertToObject,
          address,
          quantity,
          from: "2/10 Hồng Hà,p2,Tân Bình,HCM",
          path: "",
          description: "",
          receivedName,
          receivedPhoneNumber,
          startDate: moment(startDate)
            .tz(UTC_TIMEZONES)
            .format("YYYY-MM-DD HH:mm"),
          customerCode,
          customerId: `${currentCustomer?._id}`,
          customerName: currentCustomer?.name,
          status: 0,
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
