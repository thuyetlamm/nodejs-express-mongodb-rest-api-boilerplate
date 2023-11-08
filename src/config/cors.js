const WHITELIST_DOMAINS = [
  "https://www.skypost.vn/",
  "https://lammaiwedding.vercel.app/",
];

export const corsOptions = {
  origin: function (origin, callback) {
    if (!origin && process.env.BUILD_MODE === "dev") {
      return callback(null, true);
    }
    if (WHITELIST_DOMAINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`${origin} not allowed by our CORS policy`));
  },
  // Some legacy browsers (IE11, various SmartTVs) choke on 204
  optionsSuccessStatus: 200,

  // CORS sẽ cho phép nhận cookies từ request, (Nhá hàng :D | Ở khóa MERN Stack Advance nâng cao học trực tiếp mình sẽ hướng dẫn các bạn đính kèm jwt access token và refresh token vào httpOnly Cookies)
  credentials: true,
};
