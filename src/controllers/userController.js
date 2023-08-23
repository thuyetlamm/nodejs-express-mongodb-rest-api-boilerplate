import { Users } from "~/models/User";

import bcrypt from "bcrypt";

class UserController {
  //[GET] /users
  async index(req, res, next) {
    const { limit, page, keyword, status } = req.query;
    try {
      // Convert params to need type
      const perPage = Number(limit) || 10;
      const pageNumber = Math.max(0, page);
      const queryStatus = Number(status) || -1;

      // QUERY OBJECTS
      const query = {
        $or: [
          {
            fullname: { $regex: keyword || "", $options: "i" },
          },
          {
            email: { $regex: keyword || "", $options: "i" },
          },
        ],
      };

      if (queryStatus !== -1) {
        query.status = queryStatus;
      }

      const users = await Users.find(query)
        .limit(perPage)
        .skip(perPage * (Number(pageNumber) - 1))
        .sort([["updatedAt", -1]]);

      const totalUser = await Users.countDocuments(query);

      res.status(200).json({
        data: users,
        meta: {
          pagination: {
            total: totalUser,
            limit: perPage,
            totalPages: Math.ceil(totalUser / perPage),
            currentPage: +page,
          },
        },
        status: 200,
        message: "Get All User successfully",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  //[POST] /user/create
  async store(req, res, next) {
    try {
      const { fullname, password, email, type, status } = req.body;

      // CHECK Email  Exists

      const userExistWithEmail = await Users.findOne({ email: email });

      if (userExistWithEmail) {
        res.status(200).json({
          error: true,
          message: "Email already exists",
        });
        return;
      }

      const hasPassword = bcrypt.hashSync(password, 12);

      const payload = {
        fullname,
        email,
        type,
        status,
        password: hasPassword,
      };

      const user = await Users.create(payload);
      res.json({
        status: 200,
        data: user,
        message: "User created successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: new Error(error).message,
      });
    }
  }

  //[PUT] /user/create/:id
  async update(req, res, next) {
    try {
      const { fullname, email, type, status } = req.body;
      const { id } = req.params;

      const payload = {
        fullname,
        email,
        type,
        status,
      };

      // CHECK Email  Exists

      const user = await Users.findByIdAndUpdate(id, payload);

      res.json({
        status: 200,
        message: "User updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: new Error(error).message,
      });
    }
  }
}

module.exports = new UserController();
