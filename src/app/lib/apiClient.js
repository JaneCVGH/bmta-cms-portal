// src/app/lib/apiClient.js
import { clearSessionAndLogout } from "./ErrorSwal";

// API ของหน้า casetype/page.js
export const BASE_URL = "https://welcome-service-stg.metthier.ai:65000/api/v1";

export const getToken = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (Date.now() > payload.exp * 1000) return null;
    return token;
  } catch {
    return null;
  }
};

// เก็บ token ของ casetype
export const apiFetch = async (url, options = {}) => {
  const token = getToken();

  if (!token) {
    clearSessionAndLogout("Session หมดอายุ");
    throw new Error("NO_TOKEN");
  }

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  } catch {
    throw new Error("NETWORK_ERROR");
  }

  if (res.status === 401) {
    clearSessionAndLogout("Session หมดอายุ");
    throw new Error("UNAUTHORIZED");
  }
  if (!res.ok) {
    if (res.status === 500) {
      return null;
    }
    let message = `HTTP_${res.status}`;
    try {
      const errData = await res.json();
      message = errData?.message || message;
    } catch {}
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
};

// ส่ง request ไปยัง API
export const fetchData = async (url, options = {}) => {
  try {
    const data = await apiFetch(url, options);
    console.log("✅ API Response:", data);
    return data;
  } catch (error) {
    console.error("API error:", error.message);
    return null;
  }
};
