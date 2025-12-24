// components/ChangpasswodModal.js
"use client";

import styles from "../style/changepasswordModal.module.css";

export default function ChangpasswordModal
    ({ isOpen,
        onClose,
        message,
        isError }) 
{
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>{isError ? "เกิดข้อผิดพลาด" : "สำเร็จ"}</h3>
        <p>{message}</p>
        <button className={styles.modalButton} onClick={onClose}>ปิด</button>
      </div>
    </div>
  );
}
