// components\EmployeeModal.js

"use client";

import React from "react";
import styles from "../style/employeeModal.module.css";

const defaultFieldLabels = {
  empId: "รหัสพนักงาน",
  firstName: "ชื่อ",
  lastName: "นามสกุล",
  username: "Username",
  email: "อีเมล",
  mobileNo: "เบอร์โทร",
  deptId: "แผนก",
  roleId: "บทบาท",
  active: "สถานะ"
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
            <p><strong>{labels.empId}:</strong> {formData.empId || "-"}</p>
            <p><strong>{labels.firstName}:</strong> {formData.firstName || "-"}</p>
            <p><strong>{labels.lastName}:</strong> {formData.lastName || "-"}</p>
            <p><strong>{labels.username}:</strong> {formData.username || "-"}</p>
            <p><strong>{labels.email}:</strong> {formData.email || "-"}</p>
            <p><strong>{labels.mobileNo}:</strong> {formData.mobileNo || "-"}</p>
            <p><strong>{labels.deptId}:</strong> {formData.deptId || "-"}</p>
            <p><strong>{labels.roleId}:</strong> {formData.roleId || "-"}</p>
            <p>
              <strong>{labels.active}:</strong>{" "}
              {formData.active ? "ใช้งาน" : "ไม่ใช้งาน"}
            </p>

            <button className={styles.closeBtn} onClick={onClose}>ปิด</button>
          </div>
        ) :

        // กรณี type === 'edit' หรือ 'add'
        (
          <form className={styles.FormVertical} onSubmit={handleSubmit}>
            {[
              "empId",
              "firstName",
              "lastName",
              "username",
              "email",
              "mobileNo",
              "deptId",
              "roleId"
            ].map(field => (
              <div key={field} className={styles.EditandAdd}>
                <label className={styles.inlineLabel}>
                  {labels[field]}:
                </label>
                <input
                  type="text"
                  name={field}
                  value={formData?.[field] || ""}
                  onChange={handleChange}
                  className={styles.inputField}
                  required={["empId", "firstName", "lastName", "username"].includes(field)}
                />
              </div>
            ))}
            
            
            {/* active */}
            <div className={styles.EditandAdd}>
              <label className={styles.inlineLabel}>{labels.active}:</label>
              <select
                name="active"
                value={formData.active ? "true" : "false"}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "active",
                      value: e.target.value === "true"
                    }
                  })
                }
                className={styles.inputField}
              >
                <option value="true">ใช้งาน</option>
                <option value="false">ไม่ใช้งาน</option>
              </select>
            </div>

            <button className={styles.saveBtn} type="submit">
              บันทึก
            </button>
            <button
              className={styles.closeBtn}
              type="button"
              onClick={onClose}
            >
              ยกเลิก
            </button>

          </form>
        )}
      </div>
    </div>
  );
}

//inputField