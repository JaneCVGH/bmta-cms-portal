// pages/changepassword/page.js
"use client"

import { useState } from "react";
import axios from "axios";
import styles from "../../style/changepassword.module.css"
import ChangpasswordModal from "../../components/ChangpasswodModal";

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    username: "",
    // old_password: "",
    passwordNew: "",
    passwordNewConfirm: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // const [message, setMessage] = useState("");
  // const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setMessage("");
    // setError("");

      try {
        const res = await axios.post("http://localhost:8000/auth/change-password", formData);
        setModalMessage(res.data.message);
        setIsError(false);
        setModalOpen(true);
      } catch (err) {
        const detail = err.response?.data?.detail;
        const message =
          Array.isArray(detail)
            ? detail.map((d) => d.msg).join(" / ")
            : typeof detail === "string"
            ? detail
            : "เกิดข้อผิดพลาดบางอย่าง";
        setModalMessage(message);
        setIsError(true);
        setModalOpen(true);
      }
    };

  return (
    <div className={styles.ChangePasswordPage}>
      <div className={styles.ChangePasswordFrom}>
        <h2 className={styles.title}>เปลี่ยนรหัสผ่าน</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputRow}>
            <label className={styles.inputTitle}> ชื่อผู้ใช้ </label>
            <input
              type="text"
              name="username"
              onChange={handleChange}
              value={formData.username}
              required
            />
          </div>

          <div className={styles.inputRow}>
            <label className={styles.inputTitle}> รหัสผ่านใหม่ </label>
            <input
              type="password"
              name="passwordNew"
              onChange={handleChange}
              value={formData.passwordNew}
              required
            />
          </div>

            <div className={styles.inputRow}>
            <label className={styles.inputTitle}> ยืนยันรหัสผ่านใหม่ </label>
            <input
              type="password"
              name="passwordNewConfirm"
              onChange={handleChange}
              value={formData.passwordNewConfirm}
              required
            />
          </div>

      
          <button className={styles.BtnChangPassword} type="submit"> เปลี่ยนรหัสผ่าน </button>
        </form>
      </div>
      <ChangpasswordModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMessage}
        isError={isError}
      />

        {/* {message && (
          <div className={styles.successBox}>
                {`<from>\n  message: "${message}"\n</from>`}
          </div>
        )}

        {/* {message && <p className={styles.message}>{message}</p>}   */}
        {/* {error && <p className={styles.error}>{error}</p>} */} 
      
    </div>
  );
}

// npm install axios คืออะไร?
// axios เป็น ไลบรารี JavaScript ที่ช่วยให้คุณสามารถส่ง HTTP requests 
// (เช่น GET, POST, PUT, DELETE) ไปยัง backend API ได้อย่างสะดวก เช่น 
// เชื่อมต่อกับ FastAPI ที่คุณใช้ในโปรเจกต์ของคุณ




