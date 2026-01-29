//components\CaseTypeModal.js

"use client";

import React from "react";
import { useState, useEffect } from "react";
import styles from "../style/casetypemodal.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

export default function CaseTypeModal({
  show,
  type,
  formData,
  handleChange,
  handleSubmit,
  onClose,
}) {
  if (!show) return null;

  const isAdd = type === "add";
  const isEdit = type === "edit";
  const isView = type === "view";

  return (
    <div className={styles.CaseTypeModal} onClick={onClose}>
      <div
        className={styles.CaseTypeContent}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={styles.CloseCTButtons}
          onClick={onClose}
          type="button"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <h2 className={styles.CaseTypeTitle}>
          {type === "add"
            ? "สร้างประเภท"
            : type === "edit"
              ? "แก้ไขประเภท"
              : "ประเภท"}
        </h2>

        <form onSubmit={handleSubmit}>
          {/*-----ปุ่ม ดู ประเภท-----*/}
          {isView && (
            <div className={styles.viewCaseType}>
              <div className={styles.editRow}>
                <label className={styles.editLabel}>ชื่อไทยประเภท:</label>
                <input
                  type="text"
                  value={formData.th || "-"}
                  className={styles.editInput}
                  disabled
                />
              </div>

              <div className={styles.editRow}>
                <label className={styles.editLabel}>ชื่ออังกฤษประเภท:</label>
                <input
                  type="text"
                  value={formData.en || "-"}
                  className={styles.editInput}
                  disabled
                />
              </div>

              <div className={styles.editRow}>
                <label className={styles.editLabel}>จำนวนประเภทย่อย:</label>
                <input
                  type="text"
                  value={`${formData.subtypeCount ?? 0} ประเภทย่อย`}
                  className={styles.editInput}
                  disabled
                />
              </div>

              <div className={styles.editRow}>
                <label className={styles.editLabel}>วันที่สร้าง:</label>
                <input
                  type="text"
                  value={
                    formData.createdAt
                      ? new Date(formData.createdAt).toLocaleString("th-TH")
                      : "-"
                  }
                  className={styles.editInput}
                  disabled
                />
              </div>

              <div className={styles.editRow}>
                <label className={styles.editLabel}>วันที่อัปเดตล่าสุด:</label>
                <input
                  type="text"
                  value={
                    formData.updatedAt
                      ? new Date(formData.updatedAt).toLocaleString("th-TH")
                      : "-"
                  }
                  className={styles.editInput}
                  disabled
                />
              </div>
            </div>
          )}

          {/*-----ปุ่ม เพิ่ม, แก้ไข ประเภท-----*/}
          {(isAdd || isEdit) && (
            <div className={styles.AddandEditCT}>
              <div className={styles.editRow}>
                <label className={styles.editLabel}>ชื่อประเภทภาษาไทย:</label>
                <input
                  type="text"
                  name="th"
                  value={formData.th}
                  onChange={handleChange}
                  className={styles.editInput}
                  // disabled={type === "view"}
                />
              </div>

              <div className={styles.editRow}>
                <label className={styles.editLabel}>
                  ชื่อประเภทภาษาอังกฤษ:
                </label>
                <input
                  type="text"
                  name="en"
                  value={formData.en}
                  onChange={handleChange}
                  className={styles.editInput}
                  // disabled={type === "view"}
                />
              </div>

              {isEdit && (
                <>
                  <div className={styles.editRow}>
                    <label className={styles.editLabel}>วันที่สร้าง:</label>
                    <input
                      type="text"
                      value={
                        formData.createdAt
                          ? new Date(formData.createdAt).toLocaleString("th-TH")
                          : "-"
                      }
                      className={styles.editInput}
                      disabled
                    />
                  </div>

                  <div className={styles.editRow}>
                    <label className={styles.editLabel}>
                      วันที่อัปเดตล่าสุด:
                    </label>
                    <input
                      type="text"
                      value={
                        formData.updatedAt
                          ? new Date(formData.updatedAt).toLocaleString("th-TH")
                          : "-"
                      }
                      className={styles.editInput}
                      disabled
                    />
                  </div>
                </>
              )}
            </div>
          )}
          <div className={styles.SaveCTButtons}>
            {!isView && (
              <button type="submit" className={styles.modalSave}>
                บันทึก
              </button>
            )}

            {/* <button
              className={styles.CloseCTButtons}
              type="button"
              onClick={onClose}
            >
              ปิด
            </button> */}
          </div>
        </form>
      </div>
    </div>
  );
}
