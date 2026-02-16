// src/app/components/LogoutModal.js
"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import styles from "../style/logoutmodal.module.css";

export default function LogoutModal({ show, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div className={styles.LogoutModal} onClick={onCancel}>
      <div
        className={styles.LogoutModalHeader}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.iconLogout}>
          <FontAwesomeIcon icon={faRightFromBracket} />
        </div>

        <h3 className={styles.LogoutModalTitle}>ออกจากระบบ</h3>
        <p className={styles.LogoutModalText}>
          คุณต้องการออกจากระบบใช่หรือไม่?
        </p>

        <div className={styles.LogoutModalActions}>
          <button className={styles.btnConfirm} onClick={onConfirm}>
            ออกจากระบบ
          </button>
          
          <button className={styles.btnCancel} onClick={onCancel}>
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}
