// src/app/lib/ErrorSwal.js

import Swal from "sweetalert2";
import { getToken } from "@/app/lib/apiClient";

// แสดง error ทั่วไป จากระบบ
export const showErrorSwal = (message = "เกิดข้อผิดพลาดจากระบบ") => {
  return Swal.fire({
    icon: "error",
    title: "เกิดข้อผิดพลาด",
    text: message,
    confirmButtonText: "ตกลง",
  });
};

// error จาก Session หมดอายุ
export const clearSessionAndLogout = (message = "กรุณาเข้าสู่ระบบใหม่") => {
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("permissions");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user_data");
  } catch (e) {
    console.error("clearSessionAndLogout error:", e);
  }

  Swal.fire({
    icon: "warning",
    title: "หมดเวลาเข้าสู่ระบบ",
    text: message || "Session หมดอายุ",
    confirmButtonText: "ตกลง",
    allowOutsideClick: false,
    allowEscapeKey: false,
  }).then(() => {
    window.location.href = "/pages/login";
  });
};

//Session หมดอายุ/ไม่มี token ให้ login ใหม่export const requireSession = () => {
export const requireSession = () => {
  const token = getToken();
  if (!token) {
    clearSessionAndLogout("กรุณาเข้าสู่ระบบใหม่");
    return false;
  }
  return true;
};

// จัดการ error จาก apiFetch
export const handleApiError = (err, fallbackMessage = "เกิดข้อผิดพลาดจากระบบ") => {
  if (err.message === "NO_TOKEN" || err.message === "UNAUTHORIZED") {
    clearSessionAndLogout("กรุณาเข้าสู่ระบบใหม่");
  } else if (err.message === "NETWORK_ERROR") {
    showErrorSwal("ไม่สามารถเชื่อมต่อระบบได้");
  } else {
    showErrorSwal(fallbackMessage);
  }
};

