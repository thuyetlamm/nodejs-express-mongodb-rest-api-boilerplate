import { Users } from "~/models/User";

import bcrypt from "bcrypt";

class UserController {
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

      const users = await Users.find(query, {
        password: 0,
      })
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
      const {
        fullname,
        password,
        email,
        type,
        status,
        username,
        avatar,
        address,
        phone,
        role,
      } = req.body;

      // CHECK Email  Exists
      // QUERY OBJECTS
      const query = {
        $or: [
          {
            username: username,
          },
          {
            email: email,
          },
        ],
      };
      const userExistWithEmail = await Users.findOne(query);

      if (userExistWithEmail) {
        res.status(200).json({
          error: true,
          message: "Account or Email already exists",
        });
        return;
      }

      const hasPassword = bcrypt.hashSync(password, 12);

      const payload = {
        fullname,
        username,
        email,
        type,
        status,
        avatar,
        role,
        address,
        phone,
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

  //[PUT] /user/update/:id
  async update(req, res, next) {
    try {
      const {
        fullname,
        email,
        type,
        status,
        username,
        avatar,
        role,
        address,
        phone,
      } = req.body;
      const { id } = req.params;

      const payload = {
        fullname,
        username,
        phone,
        email,
        type,
        avatar,
        role,
        address,
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
