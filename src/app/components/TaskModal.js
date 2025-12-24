// components/TaskModal.js
"use client"
import React from 'react';
import styles from "../style/taskmodal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";


export default function TaskModal({ show, type, formData, handleChange, handleSubmit, onClose }) {
  const isView = type === 'view';
  const isEdit = type === 'edit';

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>
          {type === 'add' ? 'เพิ่ม Task' : type === 'edit' ? 'แก้ไข Task' : 'ดู Task'}
        </h2>

        <form onSubmit={handleSubmit}>
          {(type === 'edit' || type === 'add') && (
            <div>
              <div className={styles.editRow}>
                <label className={styles.editLabel}>ชื่อ Task:</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={styles.editInput}
                  required
                />
              </div>

              <div className={styles.editRow}>
                <label className={styles.editLabel}>สถานะ:</label>
                <div className={styles.selectWrapper}>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={styles.editInput}
                  >
                    <option value="pending">pending</option>
                    <option value="in-progress">in-progress</option>
                    <option value="done">done</option>
                    {/* <option value="done">completed</option> */}
                  </select>
                  <span className={styles.caret}>
                    <FontAwesomeIcon icon={faCaretDown} />
                  </span>
                </div>
              </div>

              <div className={styles.editRow}>
                <label className={styles.editLabel}>วันครบกำหนด:</label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className={styles.editInput}
                />
              </div>
            </div>
          )}

          {isView && (
            <div className={styles.viewTask}>
              <div className={styles.viewField}>
                <span className={styles.viewLabel}>ชื่อ Task:</span>
                <span className={styles.viewValue}>{formData.title}</span>
              </div>
              <div className={styles.viewField}>
                <span className={styles.viewLabel}>สถานะ:</span>
                <span className={styles.viewValue}>{formData.status}</span>
              </div>
              <div className={styles.viewField}>
                <span className={styles.viewLabel}>วันครบกำหนด:</span>
                <span className={styles.viewValue}>{new Date(formData.due_date).toLocaleDateString('th-TH')}</span>
              </div>
            </div>
          )}

            <div className={styles.modalButtons}>
                  {!isView && (
                    <button type="submit" className={styles.modalSave}>
                      บันทึก
                    </button>
                  )}
                  <button type="button" className={styles.modalClose} onClick={onClose}>
                    ปิด
                  </button>
            </div>
        </form>
      </div>
    </div>
    
  );
}


