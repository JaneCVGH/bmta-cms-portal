// components\EmployeeModal.js

"use client";

import React from "react";
import styles from "../style/usermodal.module.css";

const defaultFieldLabels = {
  empId: "รหัสพนักงาน",
  firstName: "ชื่อ",
  lastName: "นามสกุล",
  username: "Username",
  email: "อีเมล",
  mobileNo: "เบอร์โทร",
  deptId: "แผนก",
  commId: "command",
  stnId: "station",
  roleId: "บทบาท",
  active: "สถานะ",
  birthDate: "วันเกิด",
};

// ===== fields ที่ใช้เฉพาะ VIEW (ตาม UI ใหม่) =====
const viewProfileFields = {
  fullName: (data) =>
    `${data.firstName || ""} ${data.lastName || ""}`.trim() || "-",
  email: "email",
  mobileNo: "mobileNo",
};

// ข้อมูลส่วนบุคคล
const personalInfoFields = [
  { label: "ชื่อ", key: "firstName" },
  { label: "นามสกุล", key: "lastName" },
  { label: "อีเมล", key: "email" },
  { label: "เบอร์มือถือ", key: "mobileNo" },
  { label: "วันเกิด", key: "birthDate" },
  // { label: "เลขบัตรประชาชน", key: "citizenId" }, //  backend ยังไม่มี 
  // { label: "เพศ", key: "gender" },               //  backend ยังไม่มี 
];

// ข้อมูลหน่วยงาน
const organizationFields = [
  { label: "รหัสพนักงาน", key: "empId" },
  { label: "ประเภทผู้ใช้", key: "userType" },
  { label: "แผนก", key: "deptId" },
  { label: "สิทธิ์ใช้งาน", key: "roleId" },
  { label: "สถานะ", key: "active", type: "status" },
];




export default function EmployeeModal({
  show,
  type,
  formData,
  handleChange,
  handleSubmit,
  onClose,
  fieldLabels,
  onEdit,     
  onDelete,
  roles,
  roleMap,
  departments,
  deptMap, 
  commands,   
  stations,
}) {
  if (!show) return null;

  const labels = fieldLabels || defaultFieldLabels;

  

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        
        {/* Header */}

        
        <div className={styles.modalHeader}>
  <h2 className={styles.modalTitle}>
    {type === "view"
      ? "ข้อมูลผู้ใช้"
      : type === "edit"
      ? "แก้ไขข้อมูล"
      : "สร้างผู้ใช้"}
  </h2>

  <button
    className={styles.closeIcon}
    onClick={onClose}
    aria-label="close"
  >
    ✕
  </button>
</div>

        {/* Body */}
        {/* <div className={styles.modalBody}>*/}
          {/* ===== OLD VIEW MODE (TABLE STYLE) ===== */}
        {/*
          {type === "view" ? (
            <div className={styles.viewGrid}>
              {Object.keys(defaultFieldLabels).map((field) => (
                <div key={field} className={styles.viewRow}>
                <span className={styles.viewLabel}>
                  {labels[field]}
                </span>
                <span className={styles.viewValue}>
                  {field === "active"
                    ? formData.active
                      ? "ใช้งาน"
                      : "ไม่ใช้งาน"
                    : formData[field] || "-"}
                </span>
              </div>
              
            ))}
            </div>
          ) : (
           */}
           <div className={styles.modalBody}>
            {type === "view" ? (
              <div className={styles.viewContainer}>

                {/* ================== PROFILE HEADER ================== */}
                <div className={styles.profileHeader}>
                  <div className={styles.avatar}>
                    {viewProfileFields.fullName(formData)
                      .split(" ")
                      .map(w => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>

                  <div className={styles.profileInfo}>
                    <div className={styles.profileName}>
                      {viewProfileFields.fullName(formData)}
                    </div>
                    <div className={styles.profileEmail}>
                      {formData.email || "-"}
                    </div>
                  </div>
                </div>

                {/* ================== PERSONAL INFO  ================== */}
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>ข้อมูลส่วนบุคคล</h3>

                  <div className={styles.infoGrid}>
                    {personalInfoFields.map(({ label, key }) => (
                      <div key={key} className={styles.infoItem}>
                        <span className={styles.infoLabel}>{label}</span>
                        <span className={styles.infoValue}>
                          {formData[key] || "ไม่มี"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ================== ORGANIZATION INFO  ================== */}
                <div className={styles.section}>
                  <h3 className={styles.sectionTitle}>ข้อมูลหน่วยงาน</h3>

                  <div className={styles.infoGrid}>
                    {organizationFields.map(({ label, key, type }) => (
                      <div key={key} className={styles.infoItem}>
                        <span className={styles.infoLabel}>{label}</span>
                        <span className={styles.infoValue}>
                          {type === "status"
                            ? formData.active
                              ? "ใช้งาน"
                              : "ไม่ใช้งาน"
                            : key === "roleId"
                            ? roleMap?.[formData.roleId] || "-"
                            : key === "deptId"
                            ? deptMap?.[formData.deptId] || "-"
                            : formData[key] || "-"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>


              </div>
            ) : (
    


            /* ===== ADD / EDIT MODE ===== */
            <form className={styles.formGrid} onSubmit={handleSubmit}>
              {/* hidden id (ใช้ตอน edit) */}
              <input type="hidden" name="id" value={formData.id || ""} />

              {[
                "empId",
                "firstName",
                "lastName",
                "username",
                "email",
                "mobileNo",
                "deptId",
                "commId",   
                "stnId",
                //"roleId"
              ].map((field) => (
                <div key={field} className={styles.formRow}>
                  <label>{labels[field]}</label>
                  
                  {field === "deptId" ? (
                    <select
                      name="deptId"
                      className={styles.selectField}
                      value={formData.deptId || ""}
                      onChange={handleChange}
                    >
                      <option value="">-- เลือกแผนก --</option>
                      {departments?.map( (dept, index) => (
                        <option key={`${dept.deptId}-${index}`} value={dept.deptId}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  ) : field === "commId" ? (
                    <select
                  name="commId"
                  className={styles.selectField}
                  value={formData.commId || ""}
                  onChange={handleChange}
                  disabled={!formData.deptId}
                >
                  <option value="">-- เลือก Command --</option>
                  {commands?.map(comm => (
                    <option key={comm.commId} value={comm.commId}>
                      {comm.name}
                    </option>
                  ))}
                </select>
                ) : field === "stnId" ? (
                <select
                  name="stnId"
                  className={styles.selectField}
                  value={formData.stnId || ""}
                  onChange={handleChange}
                  disabled={!formData.commId}
                >
                  <option value="">-- เลือก Station --</option>
                  {stations?.map(stn => (
                    <option key={stn.stnId} value={stn.stnId}>
                      {stn.name}
                    </option>
                  ))}
                </select>
                ) : (
                <input
                  type="text"
                  name={field}
                  className={styles.inputField}
                  value={formData?.[field] ?? ""}
                  onChange={handleChange}
                />
                  )}

                </div>
                

              ))}

              {/* ===== ROLE FIELD ===== */}
<div className={styles.formRow}>
  <label>{labels.roleId}</label>

  <select
    name="roleId"
    className={styles.selectField}
    value={formData.roleId || ""}
    onChange={handleChange}
  >
    <option value="">-- เลือกบทบาท --</option>

    {roles?.map((role) => (
      <option key={role.id} value={role.id}>
        {role.name || role.roleName || role.code}
      </option>
    ))}
  </select>
</div>


    {/* ===== DATE FIELD ===== */}
<div className={styles.formRow}>
  <label>{labels.birthDate}</label>
  <input
    type="date"
    name="birthDate"
    className={styles.inputField}
    value={formData.birthDate || ""}
    onChange={handleChange}
  />
</div>

              <div className={styles.formRow}>
                <label>{labels.active}</label>
                <select
                  name="active"
                  className={styles.selectField}
                  value={formData.active ? "true" : "false"}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "active",
                        value: e.target.value === "true"
                      }
                    })
                  }
                >
                  <option value="true">ใช้งาน</option>
                  <option value="false">ไม่ใช้งาน</option>
                </select>
              </div>

              {/* Footer */}
              <div className={styles.modalFooter}>
                <button type="submit" className={styles.saveBtn}>บันทึก</button>
                <button type="button" onClick={onClose} className={styles.closeBtn}>
                  ยกเลิก
                </button>
              </div>
            </form>
          )}
        </div>




        {type === "view" && (
  <div className={styles.modalFooter}>
    <button
      type="button"
      className={styles.editBtn}
      onClick={() => onEdit?.(formData)}
    >
      แก้ไข
    </button>

    <button
      type="button"
      className={styles.deleteBtn}
      onClick={() => onDelete?.(formData.id)}
    >
      ลบ
    </button>

    {/*<button
      type="button"
      className={styles.closeBtn}
      onClick={onClose}
    >
      ปิด
    </button>*/}

  </div>
)}


      </div>
    </div>
  );
}


//inputField