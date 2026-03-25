// src/app/lib/ErrorSwal.js

import Swal from "sweetalert2";
import { getToken } from "@/app/lib/apiClient";

// แสดง error ทั่วไป จากระบบ
export const showErrorSwal = (message = "เกิดข้อผิดพลาดจากระบบ") => {
  return fireSwal({
    icon: "error",
    title: "เกิดข้อผิดพลาด",
    text: message,
  });
};

// ----- error จาก Session หมดอายุ -----
export const clearSessionAndLogout = (message = "กรุณาเข้าสู่ระบบใหม่") => {
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("permissions");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user_data");
  } catch (e) {
    console.error("clearSessionAndLogout error:", e);
  }

  fireSwal({
    icon: "warning",
    title: "หมดเวลาเข้าสู่ระบบ",
    text: message || "Session หมดอายุ",
    allowEscapeKey: false,
  }).then(() => {
    window.location.href = "/pages/login";
  });
};

// ----- Session หมดอายุ/ไม่มี token ให้ login ใหม่ -----
export const requireSession = () => {
  const token = getToken();
  if (!token) {
    clearSessionAndLogout("กรุณาเข้าสู่ระบบใหม่");
    return false;
  }
  return true;
};

// ----- จัดการ error จาก apiFetch -----
export const handleApiError = (
  err,
  fallbackMessage = "เกิดข้อผิดพลาดจากระบบ",
) => {
  if (err.message === "NO_TOKEN") {
    return;
  } else if (err.message === "NETWORK_ERROR") {
    showErrorSwal("ไม่สามารถเชื่อมต่อระบบได้");
  } else if (err.message === "UNAUTHORIZED") {
    clearSessionAndLogout("Session หมดอายุ");
    return;
  } else {
    showErrorSwal(err.message || fallbackMessage);
  }
};

// ----- แปลงค่า priority เป็นภาษาไทย -----
export const getPriorityTh = (priority) => {
  const p = Number(priority);

  if (p === 0) return "วิกฤต";
  if (p >= 1 && p <= 3) return "สูง";
  if (p >= 4 && p <= 6) return "ปานกลาง";
  if (p >= 7 && p <= 9) return "ต่ำ";

  return "-";
};

// ----- ปุ่ม ตกลง ของ swal -----
export const fireSwal = (options = {}) => {
  return Swal.fire({
    confirmButtonText: "ตกลง",
    // cancelButtonText: "ยกเลิก",
    allowOutsideClick: false,
    allowEscapeKey: false,
    ...options,
  });
};

// ----- Swal Success -----
export const showSuccessSwal = (title = "สำเร็จ") => {
  return fireSwal({
    icon: "success",
    title,
  });
};

// ----- Swal Warning -----
export const showWarningSwal = (title = "แจ้งเตือน", text = "") => {
  return fireSwal({
    icon: "warning",
    title,
    text,
  });
};

// ----- Swal question -----
export const showQuestionSwal = ({
  title = "ยืนยันรายการ?",
  text = "",
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
}) => {
  return fireSwal({
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });
};
