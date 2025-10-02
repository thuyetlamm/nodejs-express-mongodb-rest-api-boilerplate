import { authen, clientLogin, tracking } from "../lib/247express.js";
import redisService from "../services/redisService.js";

/**
 * @typedef {Object} ClientResponse
 * @property {number} ClientID - ID của client (ví dụ: 627)
 * @property {string} UserID - Mã người dùng (ví dụ: "D33-KH23-0045")
 * @property {string} ClientName - Tên client (ví dụ: "CÔNG TY CỔ PHẦN VFAST")
 * @property {string} Token - Token xác thực (ví dụ: "7c6f28a28627aa78790f6f1a5804252508c29ced56b64e0b7b1958d670dcd4bb")
 * @property {string} ExpireDate - Ngày hết hạn token (ví dụ: "2025-10-11T20:13:28.8128944+07:00")
 * @property {string} CustomerID - Mã khách hàng (ví dụ: "D33-KH23-0045")
 * @property {string} Email - Email liên hệ (ví dụ: "Skypost.vn@gmail.com")
 * @property {string} DisplayName - Tên hiển thị (ví dụ: "CÔNG TY CỔ PHẦN VFAST")
 * @property {string} Phone - Số điện thoại (ví dụ: "0934093402")
 * @property {string} TrackingApiKey - API Key dùng để tracking (ví dụ: "768715B6-3210-4558-995D-87048004BAE2")
 * @property {boolean} IsError - Có lỗi hay không (ví dụ: false)
 * @property {Array} Errors - Danh sách lỗi (ví dụ: [])
 * @property {string} ErrorMessage - Thông báo lỗi (ví dụ: "")
 */

/**
 * @typedef {Object} AuthResponse
 * @property {boolean} Errors - Có lỗi hay không
 * @property {string} Message - Thông báo lỗi
 * @property {string} ExpireDate - Ngày hết hạn token
 */

/**
 * @typedef {Object} TrackingRequest
 * @property {string} OrderCode - Mã đơn hàng cần tracking
 */

/**
 * @typedef {Object} CacheInfo
 * @property {Object} client - Thông tin cache client
 * @property {boolean} client.exists - Cache client có tồn tại không
 * @property {boolean} client.valid - Token client còn hợp lệ không
 * @property {string|null} client.expireDate - Ngày hết hạn token client
 * @property {Object} auth - Thông tin cache auth
 * @property {boolean} auth.exists - Cache auth có tồn tại không
 * @property {boolean} auth.valid - Token auth còn hợp lệ không
 * @property {string|null} auth.expireDate - Ngày hết hạn token auth
 */

/**
 * ExternalService - Service để tương tác với 247 Express API
 * Tự động quản lý authentication và cache token với Redis
 *
 * @class ExternalService
 * @example
 * import externalService from './src/third-party/247.js';
 *
 * // Khởi tạo service (tự động gọi login và auth)
 * await externalService.init();
 *
 * // Sử dụng tracking
 * const result = await externalService.tracking({ OrderCode: '123456' });
 */
class ExternalService {
  #ClientResponse = null;
  #isInitialized = false;

  // Redis keys cho cache
  #CACHE_KEYS = {
    CLIENT_TOKEN: "247:client:token",
    AUTH_TOKEN: "247:auth:token",
    CLIENT_DATA: "247:client:data",
    AUTH_DATA: "247:auth:data",
  };

  /**
   * Tạo instance của ExternalService
   * @constructor
   */
  constructor() {}

  /**
   * Đăng nhập và lấy client token
   * Tự động kiểm tra cache trước khi gọi API
   * @returns {Promise<ClientResponse>} Response từ API login
   * @throws {Error} Khi có lỗi trong quá trình đăng nhập
   * @example
   * const response = await externalService.login();
   * if (!response.IsError) {
   *   console.log('Login thành công:', response.ClientID);
   * }
   */
  async login() {
    // Kiểm tra cache trước
    const cachedClientData = await this.getCachedClientData();
    if (cachedClientData && this.isTokenValid(cachedClientData.ExpireDate)) {
      console.log("Sử dụng client token từ cache");
      return cachedClientData;
    }

    // Nếu không có cache hoặc token hết hạn, gọi API
    console.log("Gọi API login mới");
    const response = await clientLogin({
      Username: process.env.THIRD_PARTY_USERNAME,
      Password: process.env.THIRD_PARTY_PASSWORD,
    });

    // Cache response nếu thành công
    if (!response.Errors?.length > 0 && response.ExpireDate) {
      await this.cacheClientData(response);
    }

    return response;
  }

  /**
   * Xác thực với client token
   * Tự động kiểm tra cache trước khi gọi API
   * @param {Object} params - Tham số xác thực
   * @param {string} params.ClientID - ID của client
   * @param {string} params.token - Token xác thực
   * @returns {Promise<AuthResponse>} Response từ API auth
   * @throws {Error} Khi có lỗi trong quá trình xác thực
   * @example
   * const response = await externalService.auth({
   *   ClientID: '123',
   *   token: 'abc123'
   * });
   */
  async auth({ ClientID, Token }) {
    // Kiểm tra cache trước
    const cachedAuthData = await this.getCachedAuthData();
    if (cachedAuthData && this.isTokenValid(cachedAuthData.ExpireDate)) {
      console.log("Sử dụng auth token từ cache");
      return cachedAuthData;
    }

    // Nếu không có cache hoặc token hết hạn, gọi API
    console.log("Gọi API auth mới");
    const response = authen({
      ClientID,
      Token,
    });

    return true;
  }

  /**
   * Tracking đơn hàng
   * @param {TrackingRequest} params - Tham số tracking
   * @param {string} params.OrderCode - Mã đơn hàng cần tracking
   * @returns {Promise<Object>} Thông tin tracking đơn hàng
   * @throws {Error} Khi có lỗi trong quá trình tracking
   * @example
   * const result = await externalService.tracking({ OrderCode: '123456789' });
   * console.log('Trạng thái đơn hàng:', result.status);
   */
  async tracking({ OrderCode }) {
    const cachedClientData = await this.getCachedClientData();
    const apiKey = cachedClientData.TrackingApiKey;

    const response = await tracking({
      apiKey: apiKey,
      orderCode: OrderCode,
    });
    return response;
  }

  // ===== CACHE MANAGEMENT METHODS =====

  /**
   * Kiểm tra token có còn hợp lệ không
   * @param {string} expireDate - Ngày hết hạn của token
   * @returns {boolean} True nếu token còn hợp lệ, false nếu đã hết hạn
   * @example
   * const isValid = externalService.isTokenValid('2024-12-31T23:59:59Z');
   * if (isValid) {
   *   console.log('Token còn hợp lệ');
   * }
   */
  isTokenValid(expireDate) {
    if (!expireDate) return false;

    const now = new Date();
    const expire = new Date(expireDate);

    // Thêm buffer 5 phút để tránh token hết hạn ngay khi sử dụng
    const bufferTime = 5 * 60 * 1000; // 5 phút
    return expire.getTime() > now.getTime() + bufferTime;
  }

  /**
   * Cache client data vào Redis
   * @param {ClientResponse} clientData - Dữ liệu client từ API login
   * @returns {Promise<void>}
   * @example
   * await externalService.cacheClientData({
   *   IsError: false,
   *   ClientID: '123',
   *   token: 'abc',
   *   ExpireDate: '2024-12-31T23:59:59Z'
   * });
   */
  async cacheClientData(clientData) {
    try {
      if (!clientData.ExpireDate) {
        console.warn("Không có ExpireDate trong client data, không cache");
        return;
      }

      const ttl = this.calculateTTL(clientData.ExpireDate);
      if (ttl <= 0) {
        console.warn("Token đã hết hạn, không cache");
        return;
      }

      await redisService.set(this.#CACHE_KEYS.CLIENT_DATA, clientData, ttl);
      console.log(`Đã cache client data với TTL: ${ttl} giây`);
    } catch (error) {
      console.error("Lỗi khi cache client data:", error);
    }
  }

  /**
   * Cache auth data vào Redis
   * @param {AuthResponse} authData - Dữ liệu auth từ API auth
   * @returns {Promise<void>}
   * @example
   * await externalService.cacheAuthData({
   *   IsError: false,
   *   ExpireDate: '2024-12-31T23:59:59Z'
   * });
   */
  async cacheAuthData(authData) {
    try {
      if (!authData.ExpireDate) {
        console.warn("Không có ExpireDate trong auth data, không cache");
        return;
      }

      const ttl = this.calculateTTL(authData.ExpireDate);
      if (ttl <= 0) {
        console.warn("Token đã hết hạn, không cache");
        return;
      }

      await redisService.set(this.#CACHE_KEYS.AUTH_DATA, authData, ttl);
      console.log(`Đã cache auth data với TTL: ${ttl} giây`);
    } catch (error) {
      console.error("Lỗi khi cache auth data:", error);
    }
  }

  /**
   * Lấy client data từ cache
   * @returns {Promise<ClientResponse|null>} Client data từ cache hoặc null nếu không có
   * @example
   * const clientData = await externalService.getCachedClientData();
   * if (clientData) {
   *   console.log('Client ID:', clientData.ClientID);
   * }
   */
  async getCachedClientData() {
    try {
      return await redisService.get(this.#CACHE_KEYS.CLIENT_DATA);
    } catch (error) {
      console.error("Lỗi khi lấy client data từ cache:", error);
      return null;
    }
  }

  /**
   * Lấy auth data từ cache
   * @returns {Promise<AuthResponse|null>} Auth data từ cache hoặc null nếu không có
   * @example
   * const authData = await externalService.getCachedAuthData();
   * if (authData) {
   *   console.log('Auth token còn hợp lệ:', externalService.isTokenValid(authData.ExpireDate));
   * }
   */
  async getCachedAuthData() {
    try {
      return await redisService.get(this.#CACHE_KEYS.AUTH_DATA);
    } catch (error) {
      console.error("Lỗi khi lấy auth data từ cache:", error);
      return null;
    }
  }

  /**
   * Tính toán TTL từ ExpireDate
   * @param {string} expireDate - Ngày hết hạn
   * @returns {number} TTL tính bằng giây
   * @example
   * const ttl = externalService.calculateTTL('2024-12-31T23:59:59Z');
   * console.log(`Token sẽ hết hạn sau ${ttl} giây`);
   */
  calculateTTL(expireDate) {
    const now = new Date();
    const expire = new Date(expireDate);
    const diffMs = expire.getTime() - now.getTime();
    return Math.floor(diffMs / 1000); // Chuyển từ ms sang giây
  }

  /**
   * Xóa tất cả cache
   * @returns {Promise<void>}
   * @example
   * await externalService.clearCache();
   * console.log('Đã xóa tất cả cache');
   */
  async clearCache() {
    try {
      await redisService.del(this.#CACHE_KEYS.CLIENT_DATA);
      await redisService.del(this.#CACHE_KEYS.AUTH_DATA);
      console.log("Đã xóa tất cả cache");
    } catch (error) {
      console.error("Lỗi khi xóa cache:", error);
    }
  }

  /**
   * Lấy thông tin cache hiện tại
   * @returns {Promise<CacheInfo>} Thông tin chi tiết về cache
   * @example
   * const cacheInfo = await externalService.getCacheInfo();
   * console.log('Client cache:', cacheInfo.client);
   * console.log('Auth cache:', cacheInfo.auth);
   */
  async getCacheInfo() {
    try {
      const clientData = await this.getCachedClientData();
      const authData = await this.getCachedAuthData();

      return {
        client: {
          exists: !!clientData,
          valid: clientData ? this.isTokenValid(clientData.ExpireDate) : false,
          expireDate: clientData?.ExpireDate || null,
        },
        auth: {
          exists: !!authData,
          valid: authData ? this.isTokenValid(authData.ExpireDate) : false,
          expireDate: authData?.ExpireDate || null,
        },
      };
    } catch (error) {
      console.error("Lỗi khi lấy thông tin cache:", error);
      return {
        client: { exists: false, valid: false },
        auth: { exists: false, valid: false },
      };
    }
  }

  /**
   * Khởi tạo service - gọi login và auth
   * @returns {Promise<AuthResponse>} Response từ API auth
   * @throws {Error} Khi có lỗi trong quá trình khởi tạo
   * @example
   * try {
   *   const result = await externalService.init();
   *   console.log('Khởi tạo thành công');
   * } catch (error) {
   *   console.error('Lỗi khởi tạo:', error.message);
   * }
   */
  async init() {
    if (this.#isInitialized) {
      return this.#ClientResponse;
    }

    try {
      // Gọi function 1: login()
      const response = await this.login();
      if (response?.Errors?.length > 0) {
        throw new Error(response.ErrorMessage);
      }
      const { ClientID, Token } = response;
      this.#ClientResponse = response;

      // Gọi function 2: auth()
      const authResponse = await this.auth({ ClientID, Token });

      this.#isInitialized = true;

      return authResponse;
    } catch (error) {
      this.#isInitialized = false;
      throw error;
    }
  }

  /**
   * Kiểm tra xem service đã được khởi tạo chưa
   * @returns {boolean} True nếu đã khởi tạo, false nếu chưa
   * @example
   * if (externalService.isInitialized()) {
   *   console.log('Service đã sẵn sàng');
   * } else {
   *   await externalService.init();
   * }
   */
  isInitialized() {
    return this.#isInitialized;
  }

  /**
   * Reset và khởi tạo lại service
   * Xóa cache và gọi lại login + auth
   * @returns {Promise<AuthResponse>} Response từ API auth
   * @throws {Error} Khi có lỗi trong quá trình khởi tạo lại
   * @example
   * try {
   *   const result = await externalService.reinitialize();
   *   console.log('Khởi tạo lại thành công');
   * } catch (error) {
   *   console.error('Lỗi khởi tạo lại:', error.message);
   * }
   */
  async reinitialize() {
    this.#isInitialized = false;
    this.#ClientResponse = null;
    // Xóa cache khi khởi tạo lại
    await this.clearCache();

    return await this.init();
  }
}

/**
 * Tạo instance singleton của ExternalService
 * @type {ExternalService}
 */
const externalService = new ExternalService();

externalService
  .init()
  .then((res) => {
    console.log("Khởi tạo ExternalService thành công", res);
  })
  .catch((error) => {
    console.error("Lỗi khi khởi tạo ExternalService:", error.message);
  });

/**
 * Export default instance của ExternalService
 * @type {ExternalService}
 * @example
 * import externalService from './src/third-party/247.js';
 *
 * // Service đã được khởi tạo tự động
 * const result = await externalService.tracking({ OrderCode: '123456' });
 */
export default externalService;
