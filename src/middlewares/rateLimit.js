const { default: clientRedis } = require("~/config/redis.config");

const rateLimit = async (req, res, next) => {
  const uuid = req.body.uuid;
  if (!uuid) {
    return res.status(400).json({
      error: true,
      message: "Invalid Payload",
    });
  }
  const currentTime = Date.now();

  const client = await clientRedis.hGetAll(`rateLimit-${uuid}`);
  if (Object.keys(client).length === 0) {
    await clientRedis.hSet(`rateLimit-${uuid}`, "createdAt", currentTime);
    await clientRedis.hSet(`rateLimit-${uuid}`, "count", 1);
    return next();
  }

  const difference = (currentTime - +client.createdAt) / 1000;

  if (difference > process.env.LIMIT_RATE_TIME) {
    await clientRedis.hSet(`rateLimit-${uuid}`, "createdAt", currentTime);
    await clientRedis.hSet(`rateLimit-${uuid}`, "count", 1);
    return next();
  }

  if (+client.count > process.env.LIMIT_RATE) {
    return res.status(429).json({
      error: true,
      message: "Maximum rate limit exceeded",
    });
  } else {
    await clientRedis.hSet(`rateLimit-${uuid}`, "count", +client.count + 1);
    return next();
  }
};

export default rateLimit;
