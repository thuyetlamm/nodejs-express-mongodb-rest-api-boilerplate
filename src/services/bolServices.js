import XLSX from "xlsx";
import moment from "moment";
import { google } from "googleapis";
import { Customers } from "../models/Customer.js";
import { FORMAT_DATE, UTC_TIMEZONES } from "../utils/constants.js";
import { Bols } from "../models/Bol.js";
import {
  BOL_STATUS_ENUM,
  CATEGORY_LIST,
  BOL_STATUS_VI,
  BOL_STATUS,
} from "../types/bols.js";

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIAL, "utf8");

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

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
      : moment().subtract(1, "days").format(FORMAT_DATE.YMD);
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
      limit: +limit,
      page,
      totalRefund,
      totalNew,
      totalFinish,
      totalUnsuccess,
      bols,
    };
  }

  async store(payload) {
    const minutes = Math.ceil(Math.random() * 59);
    const startDate = moment(payload.startDate).format(
      `YYYY-MM-DD 19:${minutes}`
    );
    const endDate = payload.endDate
      ? moment(payload.startDate).format("YYYY-MM-DD 19:mm")
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
    const endDate = payload?.endDate
      ? moment(payload.endDate).format(FORMAT_DATE.YMDHm)
      : null;

    const currentCustomer = await Customers.findOne({
      _id: payload.customerId,
    });

    delete payload.startDate;

    const convertPayload = {
      ...payload,
      customerCode: currentCustomer.code,
      customerName: currentCustomer.name,
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
    const workBook = XLSX.read(file, { cellDates: true });
    const wordSheet = workBook.Sheets[workBook.SheetNames[0]];
    const countRow = XLSX.utils.sheet_to_json(wordSheet);
    const customerList = await Customers.find({});
    for (let index = 2; index <= countRow.length + 1; index++) {
      const code = wordSheet[`B${index}`]?.v || "";

      if (!!code) {
        const startDate = moment(
          wordSheet[`A${index}`]?.v || new Date()
        ).format();
        const customerCode = wordSheet[`C${index}`]?.v || "";
        const receivedName = wordSheet[`D${index}`]?.v || "";
        const address = wordSheet[`E${index}`]?.v || "";
        const category = wordSheet[`F${index}`]?.v || "";
        const quantity = wordSheet[`G${index}`]?.v || 1;
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

        const customer = customerList.find(
          (item) => item.code === customerCode
        );

        const minutes = Math.ceil(Math.random() * 59);

        const payload = {
          code,
          category: categoryAfterConvertToObject,
          customerCode,
          address,
          quantity,
          from: "2/10 Hồng Hà,p2,Tân Bình,HCM",
          path: "",
          description: "",
          receivedName,
          startDate: moment(startDate)
            .tz(UTC_TIMEZONES)
            .format(`YYYY-MM-DD 19:${minutes}`),
          status: 0,
          ...(customer
            ? {
                customerId: customer._id,
                customerName: customer.name,
                customerCode: customer.code,
              }
            : {}),
        };

        await Bols.findOneAndUpdate({ code: code }, payload, {
          new: true,
          upsert: true,
        });
      }
    }
  }

  async updateEndpoint(payload) {
    const convertPayload = {
      userName: payload.userName || "",
      status: payload.status,
      reason: payload.reason ?? [],
      endDate: moment().format(FORMAT_DATE.YMDHm),
    };
    const findBol = await Bols.findOne({ code: payload.code });
    if (!findBol) {
      return null;
    }
    const bolDetail = await Bols.findOneAndUpdate(
      { code: payload.code },
      { $set: convertPayload }
    );
    return bolDetail;
  }

  mockTrackingData(data) {
    const currentTime = moment().utc();
    const date = moment(data.startDate, "DD/MM/YYYY").utc();
    const endDate = data?.endDate
      ? moment(data.endDate, "DD/MM/YYYY").utc()
      : null;

    const resultTrackingEnd =
      data?.status > BOL_STATUS_ENUM.DILIVERY
        ? [
            {
              dateChange: moment(endDate ?? date, "DD/MM/YYYY")
                .add(20 + Math.floor(Math.random() * 7), "hours")
                .add(30, "minutes")
                .format("YYYY-MM-DD HH:mm"),
              location: data?.address,
              statusName: BOL_STATUS_VI.get(data?.status)?.title ?? "",
              notes:
                data?.status > 1 && data?.reason?.length > 0
                  ? data?.reason?.map((item) => item.name).join(",")
                  : "",
            },
          ]
        : [];

    const resultDelivery =
      data?.status >= BOL_STATUS_ENUM.DILIVERY
        ? [
            {
              dateChange: moment(endDate ?? date)
                .add(13, "hours")
                .format("YYYY-MM-DD HH:mm"),
              location: data?.address,
              statusName: "Đến bưu cục",
              notes: `Nhận và chia ${data?.code}`,
            },
            {
              dateChange: moment(endDate ?? date)
                .add(13, "hours")
                .format("YYYY-MM-DD HH:mm"),
              location: data?.address,
              statusName: "Giao bưu tá phát",
              notes: "",
            },
            {
              dateChange: moment(endDate ?? date)
                .add(13, "hours")
                .add(30, "minutes")
                .format("YYYY-MM-DD HH:mm"),
              location: data?.address,
              statusName: "Đi phát",
              notes: "",
            },
          ]
        : [];
    const resultTransfer =
      data?.status >= BOL_STATUS_ENUM.TRANSFER
        ? [
            {
              dateChange: moment(date)
                .add(2, "hour")
                .add(14, "minutes")
                .format("YYYY-MM-DD HH:mm"),
              location: "TSN - HỒ CHÍ MINH",
              statusName: "Đang chuyển tiếp",
              notes: "Gửi chuyến thư tải kiện",
            },
            {
              dateChange: moment(date)
                .add(4, "hour")
                .add(25, "minutes")
                .format("YYYY-MM-DD HH:mm"),
              location: "TSN - HỒ CHÍ MINH",
              statusName: "Đang chuyển tiếp",
              notes: "",
            },
          ]
        : [];

    const result = [
      {
        dateChange: moment(date).add(1, "hour").format("YYYY-MM-DD HH:mm"),
        location: "TSN - HỒ CHÍ MINH",
        statusName: "Nhập hệ thống",
        notes: "",
      },
      {
        dateChange: moment(date).add(1, "hour").format("YYYY-MM-DD HH:mm"),
        location: "TSN - HỒ CHÍ MINH",
        statusName: "Đóng gói",
        notes: "Đóng vào chuyến thư tải kiện",
      },
      ...resultTransfer,
      ...resultDelivery,
      ...resultTrackingEnd,
    ];

    return result.filter((item) =>
      moment(item.dateChange).isBefore(currentTime)
    );
  }

  convertDataBySheet(data) {
    if (!data) return null;
    const payLoad = {
      sendName: "Bưu cục Skypost Tân Bình",
      from: "2/10 Hồng hà phường 2 Tân Bình",
      code: data.code,
      fromDate: data.startDate,
      type: "HH",
      weight: 0.03,
      to: data.address,
      quantity: data.quantity ?? 1,
      description: data.description,
      status: BOL_STATUS_VI.get(data.status)?.title ?? "",
      extraServices: data.category,
      path: data.path ?? "",
      trackingData: this.mockTrackingData(data),
      receivedName: data?.userName,
    };
    return payLoad;
  }
  async detailBySheet(code) {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    });

    const sheetIds = response.data.sheets.map((s) => s.properties.sheetId);

    let rows = [];
    for (const sheetId of sheetIds) {
      if (rows.length > 0) break;
      const url = `https://docs.google.com/spreadsheets/d/${
        process.env.GOOGLE_SHEET_ID
      }/gviz/tq?tq=where+B='${code}'&gid=${sheetId.toString()}`;

      const bol = await fetch(url);
      const data = await bol.text();

      const json = JSON.parse(data.slice(47).slice(0, -2));
      rows = json.table.rows ?? [];
    }

    if (rows.length < 1) return null;

    const row = rows.find((row) => row.c[1].v === code);
    const [col1, col2, col3, col4, col5, col6, col7, col8, col9, col10, col11] =
      row.c ?? [];

    const convertCategoryList = col6?.v?.split(",") || [];

    const categoryAfterConvertToObject = convertCategoryList?.reduce(
      (acc, category) => {
        const findCategory = CATEGORY_LIST.find(
          (item) =>
            category && item.code.includes(category.trim().toUpperCase())
        );
        if (findCategory) {
          return [...acc, findCategory];
        }
        return acc;
      },
      []
    );
    const findStatus = BOL_STATUS.find((item) => item.title === col8?.v);
    const resonList = col10?.v?.split(",") || [];
    const convertReason = resonList.map((item, index) => ({
      name: item,
      id: index + 1,
    }));

    const data = {
      startDate: col1?.f ?? "",
      code: col2?.v ?? code,
      customerCode: col3?.v ?? "",
      receivedName: col4?.v ?? "",
      address: col5?.v ?? "",
      category: categoryAfterConvertToObject,
      quantity: col7?.v ?? 1,
      userName: col9?.v ?? "",
      status: findStatus?.id ?? 1,
      reason: convertReason,
      weight: 0,
      endDate: col11?.f ?? "",
    };
    return this.convertDataBySheet(data);
  }
  async detroy(id) {
    if (typeof id === "string") {
      const res = await Bols.deleteOne({ _id: id });
      return res;
    }
    const delRes = await Bols.deleteMany({ _id: { $in: id } });
    return delRes;
  }

  convertDataByExternal(data) {
    const { order, trackingData = [] } = data ?? {};
    if (!order) return null;

    const _trackingData = trackingData?.map((item) => ({
      dateChange: item.dateChange,
      location: item.location.replace("D33 - HỒ CHÍ MINH", "TSN - HỒ CHÍ MINH"),
      statusName: item.statusName,
      notes: item.notes,
    }));

    const extraServices = order?.extraServices?.map((service, index) => ({
      id: index,
      code: service.serviceID,
      name: service.serviceName,
    }));

    const splitCharacterPrefix = order?.deliveryTo?.startsWith("_")
      ? order?.deliveryTo?.slice(1)
      : order.deliveryTo;

    const payLoad = {
      sendName: "Bưu cục Tân Sơn Nhất",
      from: "2/10 Hồng hà phường 2 Tân Bình",
      code: order.orderCode,
      fromDate: order.acceptedTime,
      type: order.mailerType,
      weight: order.realWeight,
      to: "",
      quantity: order.quantity,
      description: order.note,
      status: order.statusName,
      extraServices,
      path: order.imageURLs?.[0] ?? "",
      trackingData: _trackingData,
      receivedName: splitCharacterPrefix,
    };
    return payLoad;
  }

  async detailByExternal(code) {
    const response = await fetch(
      "https://tracking-webkh.247express.vn/api/Order/Tracking",
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          OrderCode: code,
        }),
      }
    );
    const data = await response.json();
    return this.convertDataByExternal(data);
  }
}
export const BolServices = new BolsServices();
