const XLSX = require("xlsx");

import moment from "moment";
import { Customers } from "~/models/Customer";
import { FORMAT_DATE, UTC_TIMEZONES } from "~/utils/constants";

const { Bols } = require("~/models/Bol");
const { BOL_STATUS_ENUM, CATEGORY_LIST } = require("~/types/bols");

class BolsServices {
  async list(queryParams) {
    const {
      limit = 10,
      page = 1,
      keyword,
      status = -1,
      customerCode,
      from,
      to,
    } = queryParams;

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
    return {
      totalBol,
      totalRefund,
      totalNew,
      totalFinish,
      totalUnsuccess,
      bols,
    };
  }

  async store(payload) {
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
    return bol;
  }

  async update(id, payload) {
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
    return bolDetail;
  }

  async upload(file) {
    const customerList = await Customers.find({});

    const workBook = XLSX.read(file, { cellDates: true });
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

      const currentCustomer = customerList.find((c) => c.code === customerCode);

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
    return bols;
  }

  async updateEndpoint(payload) {
    const convertPayload = {
      userName: payload.userName,
      status: payload.status,
      reason: payload.reason,
    };
    const bolDetail = await Bols.findOneAndUpdate(
      { code: payload.code },
      { $set: convertPayload },
      { upsert: true }
    );
    return bolDetail;
  }
}
export const BolServices = new BolsServices();
