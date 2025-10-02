import axios from "axios";

/**
 * @typedef {Object} ClientLoginRequest
 * @property {string} Username - Tên đăng nhập
 * @property {string} Password - Mật khẩu
 */

/**
 * @typedef {Object} ClientLoginResponse
 * @property {boolean} IsError - Có lỗi hay không
 * @property {string} Message - Thông báo lỗi
 * @property {string} ClientID - ID của client
 * @property {string} Token - Token xác thực
 * @property {string} ExpireDate - Ngày hết hạn token
 */

/**
 * @typedef {Object} AuthRequest
 * @property {string} ClientID - ID của client
 * @property {string} Token - Token xác thực
 */

/**
 * @typedef {Object} AuthResponse
 * @property {boolean} IsError - Có lỗi hay không
 * @property {string} Message - Thông báo lỗi
 * @property {string} ExpireDate - Ngày hết hạn token
 */

/**
 * @typedef {Object} TrackingRequest
 * @property {string} orderCode - Mã đơn hàng
 * @property {string} apiKey - API key để tracking
 */

/**
 * @typedef {Object} ServiceRequest
 * @property {string} [ClientID] - ID của client (tùy chọn)
 * @property {string} [token] - Token xác thực (tùy chọn)
 * @property {Object} [data] - Dữ liệu bổ sung
 */

/**
 * Cấu hình axios service cho 247 Express API
 * @type {import('axios').AxiosInstance}
 */
const service = axios.create({
  baseURL: process.env.THIRD_PARTY_API_URL,
  timeout: 30 * 1000, // API request timeout set to 30s
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Cấu hình interceptor cho request và response
 * @param {AuthRequest} configSettings - Cấu hình xác thực
 * @returns {void}
 * @example
 * await authen({ ClientID: '123', token: 'abc' });
 */
export const authen = (configSettings) => {
  service.interceptors.request.use(function (config) {
    config.headers.ClientID = configSettings.ClientID;
    config.headers.token = configSettings.Token;
    return config;
  });

  service.interceptors.response.use(
    function (response) {
      return response;
    },
    function (error) {
      return Promise.reject(error);
    }
  );
};

/**
 * Đăng nhập client và lấy token xác thực
 * @param {ClientLoginRequest} request - Thông tin đăng nhập
 * @returns {Promise<ClientLoginResponse>} Response từ API đăng nhập
 * @throws {Error} Khi có lỗi trong quá trình đăng nhập
 * @example
 * const response = await clientLogin({
 *   Username: 'your_username',
 *   Password: 'your_password'
 * });
 */
export const clientLogin = async (request) => {
  try {
    const response = await service.post("/api/Client/ClientLogin", request);

    if (response.data && response.data.IsError === false) {
      // Cấu hình interceptor với thông tin từ response
      service.interceptors.request.use(function (config) {
        config.headers.ClientID = response.data.ClientID;
        config.headers.token = response.data.token;
        return config;
      });

      service.interceptors.response.use(
        function (response) {
          return response;
        },
        function (error) {
          return Promise.reject(error);
        }
      );
    }

    return response.data;
  } catch (error) {
    console.error("Client login error:", error);
    throw error;
  }
};

/**
 * Lấy danh sách loại dịch vụ
 * @param {ServiceRequest} request - Request parameters
 * @returns {Promise<Object>} Danh sách loại dịch vụ
 * @throws {Error} Khi có lỗi API
 * @example
 * const serviceTypes = await getServiceTypes({ ClientID: '123', token: 'abc' });
 */
export const getServiceTypes = async (request) => {
  try {
    const response = await service.post(
      "/api/Customer/GetServiceTypes",
      request
    );
    return response.data;
  } catch (error) {
    console.error("Get service types error:", error);
    throw error;
  }
};

/**
 * Lấy danh sách dịch vụ
 * @param {ServiceRequest} request - Request parameters
 * @returns {Promise<Object>} Danh sách dịch vụ
 * @throws {Error} Khi có lỗi API
 * @example
 * const services = await getServices({ ClientID: '123', token: 'abc' });
 */
export const getServices = async (request) => {
  try {
    const response = await service.post("/api/MasterData/Services", request);
    return response.data;
  } catch (error) {
    console.error("Get services error:", error);
    throw error;
  }
};

/**
 * Lấy danh sách điểm gửi hàng của khách hàng
 * @param {ServiceRequest} request - Request parameters
 * @returns {Promise<Object>} Danh sách điểm gửi hàng
 * @throws {Error} Khi có lỗi API
 * @example
 * const clientHubs = await getClientHubs({ ClientID: '123', token: 'abc' });
 */
export const getClientHubs = async (request) => {
  try {
    const response = await service.post(
      "/api/Customer/CustomerGetClientHubs",
      request
    );
    return response.data;
  } catch (error) {
    console.error("Get client hubs error:", error);
    throw error;
  }
};

/**
 * Cập nhật đơn hàng
 * @param {ServiceRequest} request - Request parameters
 * @returns {Promise<Object>} Kết quả cập nhật đơn hàng
 * @throws {Error} Khi có lỗi API
 * @example
 * const result = await updateOrder({
 *   ClientID: '123',
 *   token: 'abc',
 *   data: { orderId: '123', status: 'updated' }
 * });
 */
export const updateOrder = async (request) => {
  try {
    const response = await service.post(
      "/api/Customer/CustomerAPIUpdateOrder",
      request
    );
    return response.data;
  } catch (error) {
    console.error("Update order error:", error);
    throw error;
  }
};

/**
 * Hủy đơn hàng
 * @param {ServiceRequest} request - Request parameters
 * @returns {Promise<Object>} Kết quả hủy đơn hàng
 * @throws {Error} Khi có lỗi API
 * @example
 * const result = await cancelOrder({
 *   ClientID: '123',
 *   token: 'abc',
 *   data: { orderId: '123' }
 * });
 */
export const cancelOrder = async (request) => {
  try {
    const response = await service.post("/api/Customer/CancelOrder", request);
    return response.data;
  } catch (error) {
    console.error("Cancel order error:", error);
    throw error;
  }
};

/**
 * Lấy hình ảnh đơn hàng
 * @param {ServiceRequest} request - Request parameters
 * @returns {Promise<Object>} Hình ảnh đơn hàng
 * @throws {Error} Khi có lỗi API
 * @example
 * const images = await getOrderImages({
 *   ClientID: '123',
 *   token: 'abc',
 *   data: { orderId: '123' }
 * });
 */
export const getOrderImages = async (request) => {
  try {
    const response = await service.post(
      "/api/Customer/GetOrderImages",
      request
    );
    return response.data;
  } catch (error) {
    console.error("Get order images error:", error);
    throw error;
  }
};

/**
 * Lấy giá dịch vụ
 * @param {ServiceRequest} request - Request parameters
 * @returns {Promise<Object>} Thông tin giá dịch vụ
 * @throws {Error} Khi có lỗi API
 * @example
 * const price = await getPrice({
 *   ClientID: '123',
 *   token: 'abc',
 *   data: { from: 'HCM', to: 'HN', weight: 1 }
 * });
 */
export const getPrice = async (request) => {
  try {
    const response = await service.post(
      "/api/Customer/GetPriceForCustomerAPI",
      request
    );
    return response.data;
  } catch (error) {
    console.error("Get price error:", error);
    throw error;
  }
};

/**
 * Tạo đơn hàng mới
 * @param {ServiceRequest} request - Request parameters
 * @returns {Promise<Object>} Kết quả tạo đơn hàng
 * @throws {Error} Khi có lỗi API
 * @example
 * const order = await createOrder({
 *   ClientID: '123',
 *   token: 'abc',
 *   data: {
 *     from: 'HCM',
 *     to: 'HN',
 *     weight: 1,
 *     serviceType: 'standard'
 *   }
 * });
 */
export const createOrder = async (request) => {
  try {
    const response = await service.post(
      "/api/Customer/CustomerAPICreateOrder",
      request
    );
    return response.data;
  } catch (error) {
    console.error("Create order error:", error);
    throw error;
  }
};

/**
 * Tạo điểm gửi hàng mới
 * @param {ServiceRequest} request - Request parameters
 * @returns {Promise<Object>} Kết quả tạo điểm gửi hàng
 * @throws {Error} Khi có lỗi API
 * @example
 * const hub = await createClientHub({
 *   ClientID: '123',
 *   token: 'abc',
 *   data: {
 *     name: 'Hub Name',
 *     address: 'Hub Address',
 *     phone: '0123456789'
 *   }
 * });
 */
export const createClientHub = async (request) => {
  try {
    const response = await service.post(
      "/api/Customer/CustomerInsertClientHub",
      request
    );
    return response.data;
  } catch (error) {
    console.error("Create client hub error:", error);
    throw error;
  }
};

/**
 * Tracking đơn hàng
 * @param {TrackingRequest} request - Request parameters
 * @returns {Promise<Object>} Thông tin tracking đơn hàng
 * @throws {Error} Khi có lỗi API
 * @example
 * const tracking = await tracking({
 *   orderCode: '123456789',
 *   apiKey: 'your_api_key'
 * });
 */
export const tracking = async (request) => {
  try {
    const response = await axios.get(
      `${process.env.THIRD_PARTY_TRACKING_URL}/api/Order/v1/Tracking`,
      {
        params: {
          ordercode: request.orderCode,
          apikey: request.apiKey,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Tracking error:", error);
    throw error;
  }
};

/**
 * Default export với tất cả các functions
 * @type {Object}
 */
export default {
  authen,
  clientLogin,
  getServiceTypes,
  getServices,
  getClientHubs,
  updateOrder,
  cancelOrder,
  getOrderImages,
  getPrice,
  createOrder,
  createClientHub,
  tracking,
};
