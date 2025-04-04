import dayjs from "dayjs";
import {
  Button,
  Descriptions,
  Drawer,
  Rate,
  Space,
  Steps,
  Tooltip,
} from "antd";
import {
  FORMAT_DATE_DISPLAY,
  FORMAT_DATE_TIME_DISPLAY,
  shortenFileName,
} from "../../../utils/constant";
import {
  callGetContract,
  callGetCustomer,
  callGetCustomerType,
  callGetDevice,
  callGetDeviceType,
  callGetItemCheck,
  callGetMaintenanceHistory,
  callGetMeter,
  callGetOffice,
  callGetResultCheck,
  callGetRiskAssessment,
  callGetSubcontract,
  callGetSystem,
  callGetSystemMaintenanceService,
  callGetUser,
} from "../../../services/api";
import { useState } from "react";
import Access from "../../share/Access";
import { ALL_PERMISSIONS } from "../Access_Control/Permission/data/permissions";
import { GoPlus } from "react-icons/go";
import { CiEdit } from "react-icons/ci";

const ViewOffice = (props) => {
  const {
    user,
    data,
    setData,
    openViewDetail,
    setOpenViewDetail,
    setOpenModal,
    setOpenModalDevice,
    setOpenModalMaintenanceHistory,
    setOpenModalQuotation,
  } = props;
  const [historyStack, setHistoryStack] = useState([]);

  const onClose = () => {
    setOpenViewDetail(false);
    setData(null);
    setHistoryStack([]);
  };

  const goBack = () => {
    if (historyStack.length > 0) {
      const prevData = historyStack[historyStack.length - 1];
      setHistoryStack(historyStack.slice(0, -1));
      setData(prevData);
    }
  };

  const handleViewDetail = async (newData) => {
    setHistoryStack([...historyStack, data]);
    setData(newData);
    setOpenViewDetail(true);
  };

  const isOffice =
    data?.rentPrice &&
    !(
      data?.deviceId ||
      data?.description ||
      data?.systemName ||
      data?.fileName ||
      data?.role?.name ||
      data?.typeName ||
      data?.assessmentDate ||
      data?.performedDate ||
      data?.contractEndDate ||
      data?.serialNumber ||
      data?.companyName ||
      data?.nextScheduledDate
    );

  const isDevice =
    data?.deviceId &&
    !(
      data?.assessmentDate ||
      data?.performedDate ||
      data?.contractEndDate ||
      data?.description ||
      data?.systemName ||
      data?.fileName ||
      data?.companyName ||
      data?.role?.name ||
      data?.typeName ||
      data?.checkCategory
    );

  const generateItems = () => {
    if (data?.deviceId) {
      return [
        {
          label: "Tên thiết bị",
          children: data?.deviceName || "N/A",
        },
        {
          label: "Loại thiết bị",
          children: data?.deviceType?.typeName ? (
            <a
              onClick={async () => {
                const res = await callGetDeviceType(data?.deviceType?.id);
                if (res?.data) {
                  handleViewDetail(res?.data);
                }
              }}
            >
              {data?.deviceType?.typeName}
            </a>
          ) : (
            "N/A"
          ),
        },
        { label: "Tuổi thọ", children: data?.lifespan || "N/A" },
        { label: "Ngày cài đặt", children: data?.installationDate || "N/A" },
        { label: "Vị trí", children: data?.location?.floor || "N/A" },
        {
          label: "Hệ thống",
          children: data?.system?.systemName ? (
            <a
              onClick={async () => {
                const res = await callGetSystem(data?.system?.id);
                if (res?.data) {
                  handleViewDetail(res?.data);
                }
              }}
            >
              {data?.system?.systemName}
            </a>
          ) : (
            "N/A"
          ),
        },
        { label: "Tọa độ X", children: data?.x || 0 },
        { label: "Tọa độ Y", children: data?.y || 0 },
        {
          label: "Dịch vụ bảo trì",
          children: (
            <>
              {data?.maintenanceService?.serviceType ? (
                <a
                  onClick={async () => {
                    const res = await callGetSystemMaintenanceService(
                      data?.maintenanceService?.id
                    );
                    if (res?.data) {
                      handleViewDetail(res?.data);
                    }
                  }}
                >
                  {data?.maintenanceService?.serviceType === "ELECTRICAL"
                    ? "Hệ thống điện"
                    : data?.maintenanceService?.serviceType === "PLUMBING"
                    ? "Hệ thống cấp thoát nước"
                    : data?.maintenanceService?.serviceType === "HVAC"
                    ? "Hệ thống điều hòa không khí"
                    : "Hệ thống phòng cháy"}
                </a>
              ) : (
                "N/A"
              )}
            </>
          ),
        },
        {
          label: "Đánh giá rủi ro",
          children:
            data?.riskAssessments?.length > 0 ? (
              data?.riskAssessments?.map((x) => (
                <div
                  key={x?.riskAssessmentID}
                  className="flex items-center gap-2 my-1"
                >
                  <a
                    onClick={async () => {
                      const res = await callGetRiskAssessment(
                        x?.riskAssessmentID
                      );
                      if (res?.data) {
                        handleViewDetail(res?.data);
                      }
                    }}
                  >
                    {x?.assessmentDate}
                  </a>
                  <Access
                    permission={ALL_PERMISSIONS.MAINTENANCE_HISTORIES.CREATE}
                    hideChildren
                  >
                    <Tooltip
                      placement="bottom"
                      title="Tạo báo giá & đề xuất bảo trì"
                    >
                      {isDevice && (
                        <Button
                          onClick={() => {
                            setOpenViewDetail(false);
                            setData({ riskAssessmentID: x?.riskAssessmentID });
                            setOpenModalQuotation(true);
                          }}
                          className="p-2 xl:p-3 gap-1 xl:gap-2"
                        >
                          <GoPlus className="h-4 w-4" />
                        </Button>
                      )}
                    </Tooltip>
                  </Access>
                </div>
              ))
            ) : (
              <span>Chưa có đánh giá</span>
            ),
        },
        {
          label: "Kiểm tra mục",
          children:
            data?.itemChecks?.length > 0 ? (
              data?.itemChecks?.map((x) => (
                <a
                  key={x?.id}
                  onClick={async () => {
                    const res = await callGetItemCheck(x?.id);
                    if (res?.data) {
                      handleViewDetail(res?.data);
                    }
                  }}
                >
                  {x?.checkName} <br />
                </a>
              ))
            ) : (
              <span>Chưa có kiểm tra mục</span>
            ),
        },
      ];
    } else if (data?.description) {
      return [
        { label: "Tên", children: data?.typeName || "N/A" },
        {
          label: "Mô tả",
          children: data?.description || "N/A",
        },
      ];
    } else if (data?.systemName) {
      return [
        { label: "Tên", children: data?.systemName || "N/A" },
        { label: "Mô tả", children: data?.description || "N/A" },
        {
          label: "Chu kỳ bảo trì",
          children: data?.maintenanceCycle || "N/A",
        },
      ];
    } else if (data?.startDate) {
      return [
        {
          label: "Khách hàng",
          children: data?.customer?.companyName ? (
            <a
              onClick={async () => {
                const res = await callGetCustomer(data?.customer?.id);
                if (res?.data) {
                  handleViewDetail(res?.data);
                }
              }}
            >
              {data?.customer?.companyName}
            </a>
          ) : (
            "N/A"
          ),
        },
        {
          label: "Tổng số tiền",
          children: data?.totalAmount
            ? data?.totalAmount.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })
            : 0,
        },
        {
          label: "Ngày bắt đầu",
          children: dayjs(data?.startDate).format(FORMAT_DATE_DISPLAY) || "N/A",
        },
        {
          label: "Ngày kết thúc",
          children: dayjs(data?.endDate).format(FORMAT_DATE_DISPLAY) || "N/A",
        },
        {
          label: "Tình trạng hợp đồng",
          children: (
            <span
              className={`${
                data?.leaseStatus === "Active"
                  ? "success"
                  : data?.leaseStatus === "Inactive"
                  ? "danger"
                  : data?.leaseStatus === "Wait"
                  ? "warning"
                  : data?.leaseStatus === "Pending"
                  ? "bg-gray-200"
                  : data?.leaseStatus === "Corrected"
                  ? "bg-gray-200"
                  : data?.leaseStatus === "W_Confirmation"
                  ? "bg-red-500 text-white"
                  : data?.leaseStatus === "Send"
                  ? "bg-green-500 text-white"
                  : data?.leaseStatus === "W_Confirmation_2"
                  ? "bg-red-500 text-white"
                  : data?.leaseStatus === "Rejected"
                  ? "bg-red-700 text-white"
                  : data?.leaseStatus === "Approved"
                  ? "bg-blue-950 text-white"
                  : ""
              } status`}
            >
              {data?.leaseStatus === "Active"
                ? "Hoạt động"
                : data?.leaseStatus === "Inactive"
                ? "Đã chấm dứt"
                : data?.leaseStatus === "Wait"
                ? "Đang chờ gia hạn"
                : data?.leaseStatus === "Pending"
                ? "Đang chờ xử lý"
                : data?.leaseStatus === "Corrected"
                ? "Đã sửa"
                : data?.leaseStatus === "Send"
                ? "Đã gửi hợp đồng"
                : data?.leaseStatus === "W_Confirmation"
                ? "Đang chờ xác nhận"
                : data?.leaseStatus === "W_Confirmation_2"
                ? "Đang chờ xác nhận lần 2"
                : data?.leaseStatus === "Rejected"
                ? "Từ chối"
                : data?.leaseStatus === "Approved"
                ? "Chấp nhận"
                : ""}
            </span>
          ),
        },
      ];
    } else if (data?.role?.name) {
      return [
        { label: "Tên", children: data?.name || "N/A" },
        { label: "Email", children: data?.email || "N/A" },
        { label: "Điện thoại", children: data?.mobile || "N/A" },
        { label: "Vai trò", children: data?.role?.name || "N/A" },
        {
          label: "Trạng thái",
          children:
            (
              <span className={`${data?.status ? "success" : "danger"} status`}>
                {data?.status ? "Hoạt động" : "Không hoạt động"}
              </span>
            ) || "N/A",
        },
      ];
    } else if (data?.typeName) {
      return [
        { label: "Tên", children: data?.typeName || "N/A" },
        {
          label: "Hồ sơ",
          children:
            data?.customerTypeDocuments?.map((x) => (
              <p key={x?.id}>{x?.documentType}</p>
            )) || "N/A",
        },
        {
          label: "Trạng thái",
          children:
            (
              <span className={`${data?.status ? "success" : "danger"} status`}>
                {data?.status ? "Hoạt động" : "Không hoạt động"}
              </span>
            ) || "N/A",
        },
      ];
    } else if (data?.assessmentDate) {
      return [
        {
          label: "Lịch sử bảo trì",
          children: data?.maintenanceHistory?.performedDate ? (
            <a
              onClick={async () => {
                const res = await callGetMaintenanceHistory(
                  data?.maintenanceHistory?.id
                );
                if (res?.data) {
                  handleViewDetail(res?.data);
                }
              }}
            >
              {data?.maintenanceHistory?.performedDate || "N/A"}
            </a>
          ) : (
            "N/A"
          ),
        },
        {
          label: "Tên thiết bị",
          children: data?.device?.deviceName ? (
            <a
              onClick={async () => {
                const res = await callGetDevice(data?.device?.deviceId);
                if (res?.data) {
                  handleViewDetail(res?.data);
                }
              }}
            >
              {data?.device?.deviceName}
            </a>
          ) : (
            "N/A"
          ),
        },
        {
          label: "Nhà thầu phụ",
          children: data?.contractor?.name ? (
            <a
              onClick={async () => {
                const res = await callGetSubcontract(data?.contractor?.id);
                if (res?.data) {
                  handleViewDetail(res?.data);
                }
              }}
            >
              {data?.contractor?.name}
            </a>
          ) : (
            "N/A"
          ),
        },
        {
          label: "Xác xuất rủi ro",
          children: data?.riskProbability || "N/A",
        },
        {
          label: "Tác động rủi ro",
          children: data?.riskImpact || "N/A",
        },
        {
          label: "Phát hiện rủi ro",
          children: data?.riskDetection || "N/A",
        },
        {
          label: "Số ưu tiên rủi ro",
          children: data?.riskPriorityNumber || "N/A",
        },
        {
          label: "Hành động giảm thiểu",
          children: data?.mitigationAction || "N/A",
        },
        {
          label: "Nhận xét",
          children: data?.remarks || "N/A",
        },
        {
          label: "Ngày đánh giá",
          children:
            dayjs(data?.assessmentDate).format(FORMAT_DATE_DISPLAY) || "N/A",
        },
      ];
    } else if (data?.performedDate) {
      return [
        {
          label: "Dịch vụ bảo trì",
          children: data?.maintenanceService?.serviceType ? (
            <a
              onClick={async () => {
                const res = await callGetSystemMaintenanceService(
                  data?.maintenanceService?.id
                );
                if (res?.data) {
                  handleViewDetail(res?.data);
                }
              }}
            >
              {data?.maintenanceService?.serviceType === "ELECTRICAL"
                ? "Hệ thống Điện"
                : data?.maintenanceService?.serviceType === "PLUMBING"
                ? "Hệ thống Cấp thoát nước"
                : data?.maintenanceService?.serviceType === "HVAC"
                ? "Hệ thống Điều hòa không khí"
                : "Hệ thống Phòng cháy" || "N/A"}
            </a>
          ) : (
            "N/A"
          ),
        },
        {
          label: "Ghi chú",
          children: data?.notes || "N/A",
        },
        {
          label: "Vấn đề",
          children: data?.findings || "N/A",
        },
        {
          label: "Giải pháp",
          children: data?.resolution || "N/A",
        },
        {
          label: "Kỹ thuật viên",
          children: data?.technician?.name ? (
            <a
              onClick={async () => {
                const res = await callGetUser(data?.technician?.id);
                if (res?.data) {
                  handleViewDetail(res?.data);
                }
              }}
            >
              {data?.technician?.name}
            </a>
          ) : (
            "N/A"
          ),
        },
        {
          label: "Số điện thoại khác",
          children: data?.phone || "N/A",
        },
      ];
    } else if (data?.rentPrice) {
      return [
        { label: "Tên", children: data?.name || "N/A" },
        {
          label: "Hợp đồng",
          children: (
            <>
              {data?.contracts?.[0]?.customer?.companyName ? (
                <a
                  onClick={async () => {
                    const res = await callGetContract(data?.contracts?.[0]?.id);
                    if (res?.data) {
                      handleViewDetail(res?.data);
                    }
                  }}
                >
                  Công ty - {data?.contracts?.[0]?.customer?.companyName}
                </a>
              ) : (
                "N/A"
              )}
            </>
          ),
        },
        {
          label: "Tổng diện tích",
          children: data?.totalArea + " m²" || 0,
        },
        {
          label: "Giá thuê",
          children:
            data?.rentPrice?.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            }) || 0,
        },
        {
          label: "Phí dịch vụ",
          children:
            data?.serviceFee?.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            }) || 0,
        },
        { label: "Tọa độ bắt đầu X", children: data?.startX || 0 },
        { label: "Tọa độ bắt đầu Y", children: data?.startY || 0 },
        { label: "Tọa độ kết thúc X", children: data?.endX || 0 },
        { label: "Tọa độ kết thúc Y", children: data?.endY || 0 },
        {
          label: "Bản vẽ",
          children:
            (
              <a
                href={`${import.meta.env.VITE_BACKEND_URL}/storage/offices/${
                  data?.drawingFile
                }`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Xem
              </a>
            ) || "N/A",
        },
        {
          label: "Đồng hồ đo",
          children: (
            <>
              {data?.meters?.[0]?.serialNumber ? (
                <a
                  onClick={async () => {
                    const res = await callGetMeter(data?.meters?.[0]?.id);
                    if (res?.data) {
                      handleViewDetail(res?.data);
                    }
                  }}
                >
                  {data?.meters?.[0]?.serialNumber}
                </a>
              ) : (
                "N/A"
              )}
            </>
          ),
        },
        {
          label: "Tình trạng bàn giao",
          children: (
            <>
              {data?.handoverStatuses?.map((x) => (
                <div key={x?.id}>
                  <a
                    href={`${
                      import.meta.env.VITE_BACKEND_URL
                    }/storage/handover_status/${x?.drawingFile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {shortenFileName(x?.drawingFile, 10)}
                  </a>{" "}
                  -{" "}
                  <a
                    href={`${
                      import.meta.env.VITE_BACKEND_URL
                    }/storage/handover_status/${x?.equipmentFile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {shortenFileName(x?.equipmentFile, 10)}
                  </a>
                </div>
              ))}
            </>
          ),
        },
        {
          label: "Trạng thái",
          children:
            (
              <span
                className={`${
                  data?.status === "ACTIV" ? "success" : "danger"
                } status`}
              >
                {data?.status === "ACTIV" ? "Hoạt động" : "Không hoạt động"}
              </span>
            ) || "N/A",
        },
      ];
    } else if (data?.contractEndDate) {
      return [
        { label: "Tên", children: data?.name || "N/A" },
        { label: "Điện thoại", children: data?.phone || "N/A" },
        {
          label: "Rating",
          children: (
            <Rate value={data?.rating} disabled style={{ fontSize: 16 }} />
          ),
        },
        {
          label: "Hệ thống",
          children: data?.system?.systemName || "N/A",
        },
        { label: "Ngày bắt đầu", children: data?.contractStartDate || "N/A" },
        { label: "Ngày kết thúc", children: data?.contractEndDate || "N/A" },
      ];
    } else if (data?.companyName) {
      return [
        { label: "Công ty", children: data?.companyName || "N/A" },
        { label: "Giám đốc", children: data?.directorName || "N/A" },
        { label: "Email", children: data?.email || "N/A" },
        { label: "Điện thoại", children: data?.phone || "N/A" },
        { label: "Địa chỉ", children: data?.address || "N/A" },
        {
          label: "Ngày sinh",
          children: data?.birthday
            ? dayjs(data?.birthday).format("YYYY-DD-MM")
            : "N/A",
        },
        {
          label: "Liên hệ",
          children: data?.user?.name ? (
            <a
              onClick={async () => {
                const res = await callGetUser(data?.user?.id);
                if (res?.data) {
                  handleViewDetail(res?.data);
                }
              }}
            >
              {data?.user?.name}
            </a>
          ) : (
            "N/A"
          ),
        },
        {
          label: "Loại khách hàng",
          children: data?.customerType?.typeName ? (
            <a
              onClick={async () => {
                const res = await callGetCustomerType(data?.customerType?.id);
                if (res?.data) {
                  handleViewDetail(res?.data);
                }
              }}
            >
              {data?.customerType?.typeName}
            </a>
          ) : (
            "N/A"
          ),
        },
      ];
    } else if (data?.nextScheduledDate) {
      return [
        {
          label: "Dịch vụ",
          children:
            data?.serviceType === "ELECTRICAL"
              ? "Hệ thống Điện"
              : data?.serviceType === "PLUMBING"
              ? "Hệ thống Cấp thoát nước"
              : data?.serviceType === "FIRE_PROTECTION"
              ? "Hệ thống Phòng cháy"
              : data?.serviceType === "HVAC"
              ? "Hệ thống Điều hòa không khí"
              : "N/A",
        },
        {
          label: "Phạm vi",
          children: data?.maintenanceScope || "N/A",
        },
        {
          label: "Tần suất",
          children:
            data?.frequency === "MONTHLY"
              ? "Hàng tháng"
              : data?.frequency === "QUARTERLY"
              ? "Hàng quý"
              : data?.frequency === "ANNUALLY"
              ? "Hàng năm"
              : "N/A",
        },
        {
          label: "Ngày dự kiến",
          children:
            dayjs(data?.nextScheduledDate).format("YYYY-MM-DD") || "N/A",
        },
        {
          label: "Trạng thái",
          children:
            (
              <span
                className={`${
                  data?.status === "COMPLETED"
                    ? "success"
                    : data?.status === "PENDING"
                    ? "danger"
                    : "warning"
                } status`}
              >
                {data?.status === "COMPLETED"
                  ? "Hoàn thành"
                  : data?.status === "PENDING"
                  ? "Chưa giải quyết"
                  : "Đang tiến hành"}
              </span>
            ) || "N/A",
        },
        {
          label: "Nhà thầu phụ",
          children: data?.subcontractor?.name ? (
            <a
              onClick={async () => {
                const res = await callGetSubcontract(data?.subcontractor?.id);
                if (res?.data) {
                  handleViewDetail(res?.data);
                }
              }}
            >
              {data?.subcontractor?.name}
            </a>
          ) : (
            "N/A"
          ),
        },
      ];
    } else if (data?.checkName) {
      return [
        {
          label: "Tên mục kiểm tra",
          children: data?.checkName || "N/A",
        },
        {
          label: "Danh mục kiểm tra",
          children: data?.checkCategory || "N/A",
        },
        {
          label: "Tiêu chuẩn kiểm tra",
          children: data?.standard || "N/A",
        },
        {
          label: "Tần suất",
          children:
            data?.frequency === "HÀNG_NGÀY"
              ? "Hàng ngày"
              : data?.frequency === "HÀNG_TUẦN"
              ? "Hàng tuần"
              : data?.frequency === "HÀNG_THÁNG"
              ? "Hàng tháng"
              : data?.frequency === "HÀNG_QUÝ"
              ? "Hàng quý"
              : data?.frequency === "HÀNG_NĂM"
              ? "Hàng năm"
              : "N/A",
        },
        {
          label: "Kết quả kiểm tra",
          children:
            data?.itemCheckResults?.length > 0 ? (
              data?.itemCheckResults?.map((x) => (
                <a
                  key={x?.id}
                  onClick={async () => {
                    const res = await callGetResultCheck(x?.id);
                    if (res?.data) {
                      handleViewDetail(res?.data);
                    }
                  }}
                >
                  {x?.result} <br />
                </a>
              ))
            ) : (
              <span>Chưa có kết quả</span>
            ),
        },
      ];
    } else if (data?.note) {
      return [
        {
          label: "Tên mục kiểm tra",
          children: data?.itemCheck?.checkName ? (
            <a
              onClick={async () => {
                const res = await callGetItemCheck(data?.itemCheck?.id);
                if (res?.data) {
                  handleViewDetail(res?.data);
                }
              }}
            >
              {data?.itemCheck?.checkName}
            </a>
          ) : (
            "N/A"
          ),
        },
        {
          label: "Ghi chú",
          children: data?.note || "N/A",
        },
        {
          label: "Nhân viên phụ trách",
          children: data?.technician?.name ? (
            <a
              onClick={async () => {
                const res = await callGetUser(data?.technician?.id);
                if (res?.data) {
                  handleViewDetail(res?.data);
                }
              }}
            >
              {data?.technician?.name}
            </a>
          ) : (
            "N/A"
          ),
        },
        {
          label: "Kết quả",
          children:
            data?.result === "ĐẠT"
              ? "Đạt"
              : data?.result === "KHÔNG_ĐẠT"
              ? "Không đạt"
              : data?.result === "CẦN_SỬA_CHỮA"
              ? "Cần sửa chữa"
              : "N/A",
        },
        {
          label: "Thời gian kiểm tra",
          children: dayjs(data?.checkedAt).format(FORMAT_DATE_DISPLAY) || "N/A",
        },
      ];
    } else {
      return [
        {
          label: "Serial Number",
          children: data?.serialNumber || "N/A",
        },
        {
          label: "Loại đồng hồ",
          children:
            data?.meterType === "THREE_PHASE" ? "3 Phase" : "1 Phase" || "N/A",
        },
        {
          label: "Ngày cài đặt",
          children:
            dayjs(data?.installationDate).format(FORMAT_DATE_DISPLAY) || "N/A",
        },
        {
          label: "Văn phòng",
          children: data?.office?.name ? (
            <a
              onClick={async () => {
                const res = await callGetOffice(data?.office?.id);
                if (res?.data) {
                  handleViewDetail(res?.data);
                }
              }}
            >
              {`${data?.office?.name} - ${data?.office?.location?.floor}` ||
                "N/A"}
            </a>
          ) : (
            "N/A"
          ),
        },
      ];
    }
  };

  let items = generateItems();

  if (user?.role?.name === "Application_Admin") {
    items = [
      ...items,
      {
        label: "Ngày tạo",
        children:
          dayjs(data?.createdAt).format(FORMAT_DATE_TIME_DISPLAY) || "N/A",
      },
      {
        label: "Ngày cập nhật",
        children:
          dayjs(data?.updatedAt).format(FORMAT_DATE_TIME_DISPLAY) || "N/A",
      },
      {
        label: "Tạo bởi",
        children: data?.createdBy || "N/A",
      },
      {
        label: "Cập nhật bởi",
        children: data?.updatedBy || "N/A",
      },
    ];
  }

  return (
    <Drawer
      title={`${
        data?.deviceId
          ? "Thông tin thiết bị"
          : data?.checkName
          ? "Thông tin kiểm tra mục"
          : data?.result
          ? "Thông tin kết quả kiểm tra mục"
          : data?.description
          ? "Thông tin loại thiết bị"
          : data?.systemName
          ? "Thông tin hệ thống"
          : data?.contractEndDate
          ? "Thông tin nhà thầu phụ"
          : data?.fileName
          ? "Thông tin hợp đồng"
          : data?.companyName
          ? "Thông tin khách hàng"
          : data?.typeName
          ? "Thông tin loại khách hàng"
          : data?.role?.name
          ? "Thông tin liên hệ"
          : data?.assessmentDate
          ? "Thông tin đánh giá rủi ro"
          : data?.performedDate
          ? "Thông tin lịch sử bảo trì"
          : data?.nextScheduledDate
          ? "Thông tin dịch vụ bảo trì"
          : data?.rentPrice
          ? "Thông tin văn phòng"
          : "Thông tin đồng hồ đo"
      }`}
      onClose={onClose}
      open={openViewDetail}
      width={window.innerWidth > 900 ? 800 : window.innerWidth}
      extra={
        <Space>
          {historyStack.length > 0 && (
            <Button onClick={goBack}>Quay lại</Button>
          )}

          <Access permission={ALL_PERMISSIONS.CONTRACTS.UPDATE} hideChildren>
            <Tooltip placement="bottom" title="Chỉnh sửa văn phòng">
              {isOffice && (
                <Button
                  type="primary"
                  onClick={async () => {
                    const res = await callGetContract(data?.contracts[0]?.id);
                    if (res?.data) {
                      setOpenViewDetail(false);
                      setData(res?.data);
                      setOpenModal(res?.data);
                    }
                  }}
                >
                  <CiEdit className="h-4 w-4" />
                </Button>
              )}
            </Tooltip>
          </Access>

          <Access permission={ALL_PERMISSIONS.DEVICES.UPDATE} hideChildren>
            <Tooltip placement="bottom" title="Chỉnh sửa thiết bị">
              {isDevice && (
                <Button
                  type="primary"
                  onClick={async () => {
                    const res = await callGetDevice(data?.deviceId);
                    if (res?.data) {
                      setOpenViewDetail(false);
                      setData(res?.data);
                      setOpenModalDevice(res?.data);
                    }
                  }}
                >
                  <CiEdit className="h-4 w-4" />
                </Button>
              )}
            </Tooltip>
          </Access>

          <Access
            permission={ALL_PERMISSIONS.MAINTENANCE_HISTORIES.CREATE}
            hideChildren
          >
            <Tooltip
              placement="bottom"
              title="Tạo lịch sử bảo trì và đánh giá rủi ro"
            >
              {isDevice && (
                <Button
                  onClick={() => {
                    setOpenViewDetail(false);
                    setData({ deviceId: data?.deviceId });
                    setOpenModalMaintenanceHistory(true);
                  }}
                  className="p-2 xl:p-3 gap-1 xl:gap-2"
                >
                  <GoPlus className="h-4 w-4" />
                </Button>
              )}
            </Tooltip>
          </Access>
        </Space>
      }
    >
      <Descriptions items={items} column={1} bordered />
    </Drawer>
  );
};

export default ViewOffice;
