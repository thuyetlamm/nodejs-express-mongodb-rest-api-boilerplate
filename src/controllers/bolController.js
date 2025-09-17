import { Bols } from "../models/Bol.js";

import { BolServices } from "../services/bolServices.js";
import redisService from "../services/redisService.js";

class BolController {
  //[GET] /bols
  async index(req, res, next) {
    try {
      const {
        bols,
        page,
        limit,
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
            limit,
            totalPages: Math.ceil(totalBol / limit),
            currentPage: +page,
          },
        },
        status: 200,
        message: "Get All Bols successfully",
      });
    } catch (error) {
      console.log("error", error);
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

  async detailByGGSheet(req, res, next) {
    try {
      const { code } = req.query;

      const data = await BolServices.detailByExternal(code);

      if (data) {
        return res.status(200).json({
          data,
          status: 200,
          message: "Lấy chi tiết vận đơn thành công",
        });
      }

      const redisKey = `bol:detailBySheet:${code}`;

      const cachedData = await redisService.get(redisKey);

      if (cachedData !== null) {
        if (Object.keys(cachedData).length === 0) {
          redisService.set(redisKey, {}, 60 * 60);

          return res.status(200).json({
            data: null,
            status: 200,
            message: "Không tìm thấy mã vận đơn",
          });
        }
        return res.status(200).json({
          data: cachedData,
          status: 200,
          message: "Lấy chi tiết vận đơn thành công",
        });
      }

      const row = await BolServices.detailBySheet(code);

      if (!row) {
        redisService.set(redisKey, {}, 60 * 60);
        return res.status(200).json({
          data: null,
          status: 200,
          message: "Không tìm thấy mã vận đơn",
        });
      }

      redisService.set(redisKey, row, 60 * 60);
      return res.status(200).json({
        data: row,
        status: 200,
        message: "Lấy chi tiết vận đơn thành công",
      });
    } catch (error) {
      console.log({ error });
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
      const { id } = req.body;

      await BolServices.detroy(id);

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

      await BolServices.upload(req.file.buffer);
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

  // //[POST] /bol/import
  // async uploadTest(req, res, next) {
  //   try {
  //     if (!req.file)
  //       return res.status(404).json({
  //         error: true,
  //         message: "File not found",
  //       });

  //     const workBook = XLSX.read(req.file.buffer);
  //     const wordSheet = workBook.Sheets[workBook.SheetNames[0]];
  //     const countRow = XLSX.utils.sheet_to_json(wordSheet);

  //     let categories = "";

  //     const workbook = new Excel.Workbook();
  //     const worksheets = workbook.addWorksheet("sheets");

  //     worksheets.columns = [
  //       { header: "No.", key: "no", width: 10 },
  //       { header: "Item Code", key: "code", width: 10 },
  //       { header: "Brand", key: "brand", width: 10 },
  //       { header: "Cate", key: "cate", width: 32 },
  //       { header: "Description", key: "desc", width: 10 },
  //       { header: "Bom", key: "bom", width: 10 },
  //       { header: "Bom Qty", key: "bomqty", width: 10 },
  //       { header: "Cost", key: "cost", width: 10 },
  //       { header: "Price", key: "price", width: 10 },
  //       { header: "Unit", key: "unit", width: 10 },
  //       { header: "Tax", key: "vat", width: 10 },
  //     ];

  //     for (let index = 5; index < countRow.length + 1; index++) {
  //       const no = wordSheet[`B${index}`]?.v || "";
  //       const code = wordSheet[`C${index}`]?.v || "";
  //       const quantity = wordSheet[`M${index}`]?.v || 0;
  //       const price = wordSheet[`N${index}`]?.v || 0;
  //       const brand = wordSheet[`Q${index}`]?.v || 0;
  //       if (!no) {
  //         categories = code;
  //         // TODO:
  //       } else {
  //         const payload = {
  //           no: 1,
  //           cate: categories,
  //           code,
  //           desc: code,
  //           bom: "",
  //           bomqty: "",
  //           cost: price,
  //           brand,
  //           unit: "PCS",
  //           vat: "VAT",
  //           quantity,
  //           price,
  //         };
  //         worksheets.addRow(payload);
  //       }
  //     }

  //     await workbook.xlsx
  //       .writeFile("Product.xlsx")
  //       .then((response) => {
  //         // res.sendFile(path.join("newSaveeee.xlsx"));
  //       })
  //       .catch((err) => {
  //         console.log("err", err);
  //       });

  //     return res.status(200).json({
  //       status: "OK",
  //     });
  //   } catch (error) {
  //     res.status(400).json({
  //       message: new Error(error).message,
  //     });
  //   }

  //   // Parse a buffer
  // }
  // [PATH] /bol/endpoint/update
  async updateEndpoint(req, res, next) {
    try {
      const result = await BolServices.updateEndpoint(req.body);

      if (!result) {
        return res.json({
          status: 400,
          message: "Không tìm thấy mã vận đơn",
        });
      }

      return res.json({
        status: 200,
        message: "Cập nhật vận đơn thành công",
      });
    } catch (error) {
      res.status(400).json({
        message: new Error(error).message,
      });
    }
  }
}

export default new BolController();
