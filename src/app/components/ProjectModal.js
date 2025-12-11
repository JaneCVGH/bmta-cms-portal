//components\ProjectsModal.js

"use client"

import React from 'react';
import { useState, useEffect } from 'react';
import styles from "../style/projectmodal.module.css" 

export default function ProjectModal({ show, type, formData, handleChange, handleSubmit, onClose }) {
  const isView = type === 'view';
  const isEdit = type === 'edit';

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>
          {type === 'add' ? 'เพิ่มโปรเจกต์' : type === 'edit' ? 'แก้ไขโปรเจกต์' : 'ดูโปรเจกต์'}
        </h2>
        
        {/* inputกรอกข้อความสั้น เช่น ชื่อ, อีเมล */}
        {/* <textarea>กรอกข้อความยาว เช่น รายละเอียด, คำอธิบาย */}
        <form onSubmit={handleSubmit}>
         {type === 'view' && (
            <div>
              <div className={styles.viewField}>
                <span className={styles.viewLabel}>ชื่อโปรเจกต์:</span>
                <span className={styles.viewValue}>{formData.name}</span>
              </div>
              <div className={styles.viewField}>
                <span className={styles.viewLabel}>คำอธิบาย:</span>
                <span className={styles.viewValue}>{formData.description}</span>
              </div>
              <div className={styles.viewField}>
                <span className={styles.viewLabel}>วันที่เริ่มต้น:</span>
                <span className={styles.viewValue}>{new Date(formData.start_date).toLocaleDateString('en-GB')}</span>
              </div>
              <div className={styles.viewField}>
                <span className={styles.viewLabel}>วันที่สิ้นสุด:</span>
                <span className={styles.viewValue}>{new Date(formData.end_date).toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          )}

          {(type === 'edit' || type === 'add') && (
            <div>
              <div className={styles.editRow}>
                <label className={styles.editLabel}>ชื่อโปรเจกต์:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={styles.editInput}
                />
              </div>

              <div className={styles.editRow}>
                <label className={styles.editLabel}>คำอธิบาย:</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={styles.editInput}
                />
              </div>

              <div className={styles.editRow}>
                <label className={styles.editLabel}>วันที่เริ่มต้น:</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className={styles.editInput}
                />
              </div>

              <div className={styles.editRow}>
                <label className={styles.editLabel}>วันที่สิ้นสุด:</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className={styles.editInput}
                />
              </div>
        </div>
      )}

          <div className={styles.modalButtons}>
            {!isView && <button type="submit" className={styles.modalSave} >บันทึก</button>}
             <button className={styles.modalClose} type="button" onClick={onClose}>ปิด</button>
          </div>
        </form>
      </div>
    </div>
  );
}

