export const BOL_STATUS_ENUM = {
  ALL: -1,
  NEW: 0,
  FINISHED: 1,
  UNSCCESSFUL: 2,
  REFURNING: 3,
};

export const BOL_STATUS = [
  {
    id: 1,
    title: "Mới",
  },
  {
    id: 2,
    title: "Phát thành công",
  },
  {
    id: 3,
    title: "Phát thất bại",
  },
  {
    id: 4,
    title: "Hoàn lại",
  },
];

export const BOL_STATUS_VI = new Map([
  [1, { id: 1, title: "Mới" }],
  [2, { id: 2, title: "Phát thành công" }],
  [3, { id: 3, title: "Phát thất bại" }],
  [4, { id: 4, title: "Hoàn về" }],
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
