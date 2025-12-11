// components\EmployeeModal.js

"use client";

import React from "react";
import styles from "../style/employeeModal.module.css";

const defaultFieldLabels = {
  firstName: 'ชื่อ',
  lastName: 'นามสกุล',
  position: 'ตำแหน่ง',
  department: 'แผนก',
  email: 'อีเมล',
  phone: 'เบอร์โทร',
  username: 'username'
};

export default function EmployeeModal({
  show,
  type,
  formData,
  handleChange,
  handleSubmit,
  onClose,
  fieldLabels

}) 

{
  if (!show) return null;

  const labels = fieldLabels || defaultFieldLabels;

  return (
    
    <div className={styles.modalShow}>
      <div className={styles.ModalContent}>
        <h2 className={styles.veiwEdit}>
          {type === 'view' ? 'ข้อมูลพนักงาน' : type === 'edit' ? 'แก้ไขข้อมูล' : 'เพิ่มพนักงานใหม่'}
        </h2>

        {/* กรณี type === 'view' */}
        {/* {type === 'view' ? (
          <div className={styles.viewSection}>
             {['firstName', 'lastName', 'position', 'department', 'salary', 'email', 'phone'].map((field) => (
                <p key={field}>
                  <strong>{labels[field]}:</strong> {formData[field] || '-'}
                </p>
              ))}
            <button className={styles.closeBtn} type="button" onClick={onClose}>ปิด</button>
          </div>
        ) : 
         */}

         {type === 'view' ? (
          <div className={styles.viewModal}>
            <p><strong>ชื่อ:</strong> {formData.firstName || '-'}</p>
            <p><strong>นามสกุล:</strong> {formData.lastName || '-'}</p>
            <p><strong>ตำแหน่ง:</strong> {formData.position || '-'}</p>
            <p><strong>แผนก:</strong> {formData.department || '-'}</p>
            <p><strong>อีเมล:</strong> {formData.email || '-'}</p>
            <p><strong>เบอร์โทร:</strong> {formData.phone || '-'}</p>
            <p><strong>username:</strong> {formData.username || '-'}</p>
            <button className={styles.closeBtn} onClick={onClose}>ปิด</button>
          </div>
        ) :

        // กรณี type === 'edit' หรือ 'add'
        (
          <form className={styles.FormVertical} onSubmit={handleSubmit}>
            {['firstName', 'lastName', 'position', 'department', 'email', 'phone', 'username'].map(field => (
              <div key={field} className={styles.EditandAdd}>
                <label className={styles.inlineLabel}>{labels[field]}:</label>
                <input
                  type="text"
                  name={field}
                  placeholder={labels[field]}
                  value={formData?.[field] || ''}
                  onChange={handleChange}
                  required={field !== 'email' && field !== 'phone'}
                  className={styles.inputField}
                />
              </div>
            ))}
            <button className={styles.saveBtn} type="submit">บันทึก</button>
            <button className={styles.closeBtn} type="button" onClick={onClose}>ยกเลิก</button>
          </form>
        )}
      </div>
    </div>
  );
}

//inputField