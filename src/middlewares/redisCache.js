import redisService from "../services/redisService.js";

/**
 * Middleware để cache response của API
 * @param {Object} options - Các tùy chọn cache
 * @param {number} options.ttl - Thời gian sống cache (giây)
 * @param {string} options.keyPrefix - Prefix cho cache key
 * @param {Function} options.keyGenerator - Function tạo cache key từ request
 * @param {Function} options.skipCache - Function kiểm tra có nên skip cache không
 * @returns {Function} Express middleware
 */
export const cacheMiddleware = (options = {}) => {
  const {
    ttl = 3600, // 1 giờ mặc định
    keyPrefix = "api:",
    keyGenerator = (req) => {
      // Tạo key dựa trên method, path và query params
      const { method, originalUrl, query } = req;
      const queryString =
        Object.keys(query).length > 0
          ? `?${new URLSearchParams(query).toString()}`
          : "";
      return `${keyPrefix}${method}:${originalUrl}${queryString}`;
    },
    skipCache = (req) => {
      // Skip cache cho POST, PUT, DELETE requests
      return ["POST", "PUT", "DELETE", "PATCH"].includes(req.method);
    },
  } = options;

  return async (req, res, next) => {
    try {
      // Kiểm tra có nên skip cache không
      if (skipCache(req)) {
        return next();
      }

      // Tạo cache key
      const cacheKey = keyGenerator(req);

      // Thử lấy dữ liệu từ cache
      const cachedData = await redisService.get(cacheKey);

      if (cachedData !== null) {
        // Trả về dữ liệu từ cache
        res.set("X-Cache", "HIT");
        return res.json(cachedData);
      }

      // Nếu không có cache, lưu original res.json để override
      const originalJson = res.json.bind(res);

      res.json = function (data) {
        // Lưu response vào cache
        redisService.set(cacheKey, data, ttl).catch((error) => {
          console.error("Cache save error:", error);
        });

        // Set header để biết đây là cache miss
        res.set("X-Cache", "MISS");

        // Gọi original json method
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      // Nếu có lỗi, tiếp tục xử lý request bình thường
      next();
    }
  };
};

/**
 * Middleware để invalidate cache khi có thay đổi dữ liệu
 * @param {string|Array|Function} patterns - Pattern(s) để invalidate
 * @returns {Function} Express middleware
 */
export const invalidateCacheMiddleware = (patterns) => {
  return async (req, res, next) => {
    try {
      // Override res.json để invalidate cache sau khi response
      const originalJson = res.json.bind(res);

      res.json = async function (data) {
        try {
          // Xác định patterns cần invalidate
          let patternsToInvalidate = patterns;

          if (typeof patterns === "function") {
            patternsToInvalidate = patterns(req);
          }

          if (!Array.isArray(patternsToInvalidate)) {
            patternsToInvalidate = [patternsToInvalidate];
          }

          // Invalidate tất cả patterns
          for (const pattern of patternsToInvalidate) {
            await redisService.invalidateCache(pattern);
          }

          console.log(
            `Cache invalidated for patterns: ${patternsToInvalidate.join(", ")}`
          );
        } catch (error) {
          console.error("Cache invalidation error:", error);
        }

        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error("Invalidate cache middleware error:", error);
      next();
    }
  };
};

/**
 * Middleware để cache user-specific data
 * @param {Object} options - Các tùy chọn cache
 * @returns {Function} Express middleware
 */
export const userCacheMiddleware = (options = {}) => {
  const {
    ttl = 1800, // 30 phút mặc định
    keyPrefix = "user:",
    getUserKey = (req) => {
      // Lấy user ID từ token hoặc session
      return req.user?.id || req.userId || "anonymous";
    },
  } = options;

  return async (req, res, next) => {
    try {
      const userKey = getUserKey(req);
      if (!userKey || userKey === "anonymous") {
        return next();
      }

      const cacheKey = `${keyPrefix}${userKey}:${req.originalUrl}`;

      // Thử lấy dữ liệu từ cache
      const cachedData = await redisService.get(cacheKey);

      if (cachedData !== null) {
        res.set("X-Cache", "HIT");
        res.set("X-Cache-Key", cacheKey);
        return res.json(cachedData);
      }

      // Override res.json để cache response
      const originalJson = res.json.bind(res);

      res.json = function (data) {
        redisService.set(cacheKey, data, ttl).catch((error) => {
          console.error("User cache save error:", error);
        });

        res.set("X-Cache", "MISS");
        res.set("X-Cache-Key", cacheKey);

        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error("User cache middleware error:", error);
      next();
    }
  };
};

/**
 * Middleware để rate limiting sử dụng Redis
 * @param {Object} options - Các tùy chọn rate limiting
 * @returns {Function} Express middleware
 */
export const redisRateLimitMiddleware = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 phút
    maxRequests = 100, // Tối đa 100 requests
    keyGenerator = (req) => {
      // Sử dụng IP address hoặc user ID
      return req.ip || req.connection.remoteAddress || "unknown";
    },
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return async (req, res, next) => {
    try {
      const key = `rate_limit:${keyGenerator(req)}`;
      const window = Math.floor(Date.now() / windowMs);
      const redisKey = `${key}:${window}`;

      // Lấy số lượng requests hiện tại
      const currentRequests = (await redisService.get(redisKey)) || 0;

      if (currentRequests >= maxRequests) {
        return res.status(429).json({
          error: "Too Many Requests",
          message: `Rate limit exceeded. Try again in ${Math.ceil(
            windowMs / 1000
          )} seconds.`,
          retryAfter: Math.ceil(windowMs / 1000),
        });
      }

      // Tăng counter
      await redisService.set(
        redisKey,
        currentRequests + 1,
        Math.ceil(windowMs / 1000)
      );

      // Set headers
      res.set({
        "X-RateLimit-Limit": maxRequests,
        "X-RateLimit-Remaining": Math.max(0, maxRequests - currentRequests - 1),
        "X-RateLimit-Reset": new Date((window + 1) * windowMs).toISOString(),
      });

      next();
    } catch (error) {
      console.error("Redis rate limit middleware error:", error);
      // Nếu có lỗi Redis, cho phép request đi qua
      next();
    }
  };
};

export default {
  cacheMiddleware,
  invalidateCacheMiddleware,
  userCacheMiddleware,
  redisRateLimitMiddleware,
};
