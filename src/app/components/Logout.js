// src\app\components\Logout.js

"use client";

import styles from "../style/logout.module.css";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Logout({ show, onClose, onConfirm }) {
  const router = useRouter();

  if (!show) return null; // ถ้าไม่ให้แสดง → ไม่ render อะไรเลย

  const confirmLogout = async () => {
    try {
      localStorage.removeItem("token");

      await axios.post(
        "https://welcome-service-stg.metthier.ai:65000/api/v1/auth/logout",
        {},
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // เด้งไปหน้า login เสมอ
      window.location.href =
        "https://welcome-service-stg.metthier.ai:65000/api/v1/auth/login";
    }
  };

  const handleConfirm = () => {
    // call parent handler if provided, otherwise use internal
    if (typeof onConfirm === "function") {
      onConfirm();
    } else {
      internalLogout();
    }
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
         <h3 className={styles.Logout}>ยืนยันการออกจากระบบ</h3>
         <p>คุณต้องการออกจากระบบใช่หรือไม่?</p>

         <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancel}
            onClick={onClose}
          >
            ยกเลิก
          </button>

          <button
            type="button"
            className={styles.confirm}
            onClick={handleConfirm}
          >
            ตกลง
          </button>
        </div>
        </div>
      </div>
  );
}
