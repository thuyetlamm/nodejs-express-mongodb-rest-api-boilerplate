export const BOL_STATUS_ENUM = {
  ALL: -1,
  NEW: 1,
  TRANSFER: 2,
  DILIVERY: 3,
  FINISHED: 4,
  UNSCCESSFUL: 5,
  REFURNING: 6,
};

export const BOL_STATUS = [
  {
    id: 1,
    title: "Mới",
    key: "DATIEPNHAN",
  },
  {
    id: 2,
    title: "Đang chuyển tiếp",
    key: "DANGVANCHUYEN",
  },
  {
    id: 3,
    title: "Đi phát",
    key: "DANGDIPHAT",
  },
  {
    id: 4,
    title: "Phát thành công",
    key: "PHATTHANHCONG",
  },
  {
    id: 5,
    title: "Phát thất bại",
    key: "PHATTHATBAI",
  },
  {
    id: 6,
    title: "Hoàn lại",
    key: "CHOCHUYENHOAN",
  },
];

export const BOL_STATUS_VI = new Map([
  [1, { id: 1, title: "Mới" }],
  [2, { id: 2, title: "Đang chuyển tiếp" }],
  [3, { id: 3, title: "Đi phát" }],
  [4, { id: 4, title: "Phát thành công" }],
  [5, { id: 5, title: "Phát thất bại" }],
  [6, { id: 6, title: "Hoàn lại" }],
]);
export const CATEGORY_LIST = [
  {
    id: 1,
    code: ["PHG"],
    name: "Phát hẹn giờ",
  },
  {
    id: 2,
    code: ["DE"],
    name: "Chuyển phát nhanh",
  },
  {
    id: 3,
    code: ["HT"],
    name: "Hỏa tốc",
  },
  {
    id: 4,
    code: ["TF"],
    name: "Vận tải chậm",
  },
  {
    id: 5,
    code: ["PTT"],
    name: "Phát tận tay",
  },
  {
    id: 6,
    code: ["BP"],
    name: "Báo phát",
  },
  {
    id: 7,
    code: ["DK"],
    name: "Đồng kiểm",
  },
  {
    id: 8,
    code: ["DVTK", "DVTKKH", "TKKH"],
    name: "Dịch vụ thư ký khách hàng",
  },
  {
    id: 9,
    code: ["PTN"],
    name: "Phát trong ngày",
  },
  {
    id: 10,
    code: ["PUT"],
    name: "Phát ưu tiên",
  },
  {
    id: 11,
    code: ["HDL"],
    name: "Hàng đông lạnh",
  },
  {
    id: 12,
    code: ["HST"],
    name: "Hồ sơ thầu",
  },
];
