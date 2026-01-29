// components\CaseSubtypeListModal.js

"use client";
import React from "react";
import styles from "../style/casesubtypelistmodal.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faSquarePlus,
  faEye,
  faPencil,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

export default function CaseSubtypeListModal({
  show,
  casetype,
  subtypes,
  currentPage,
  rowsPerPage,
  getPriorityLabelShort,

  onAdd,
  onView,
  onEdit,
  onDelete,
  onPrevPage,
  onNextPage,
  onClose,
}) {
  if (!show) return null;

  const totalPages = Math.ceil(subtypes.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const pagedSubtypes = subtypes.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className={styles.CaseSubtypeListModal} onClick={onClose}>
      <div
        className={styles.CaseSubtypeListHeader}
        onClick={(e) => e.stopPropagation()}
      >
        {/*------ Header CaseSubtype ------*/}
        <div className={styles.CSTinCTHeader}>
          <div className={styles.CasetypeHeader}>
            <div className={styles.CasetypeTH}>ประเภท: {casetype?.th}</div>

            <div className={styles.SubtypeRow}>
              <div className={styles.SubtypeCount}>
                {casetype?.subtypeCount ?? 0} ประเภทย่อย
              </div>
            </div>
          </div>

          {/*------ ปุ่มใน X ออกจาก CaseSubtypeListmodal ------*/}
          <button className={styles.CloseCaseSubtypeBtn} onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>

          {/*------ ปุ่ม เพิ่ม CaseSubtype ------*/}
          <button
            className={styles.AddCaseSubtypeBtn}
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
          >
            <FontAwesomeIcon icon={faSquarePlus} /> เพิ่มประเภทย่อย
          </button>
        </div>

        {/*------ List CaseSubtype ------*/}
        <div className={styles.CaseSubtypeList}>
          {/* เปิด CaseSubtypeListmodal แล้วไม่มี CaseSubtype */}
          {pagedSubtypes.length === 0 && (
            <div className={styles.EmptyText}>ไม่มีข้อมูลประเภทย่อย</div>
          )}

          <ul>
            {pagedSubtypes.map((cs) => (
              <li key={cs.idCaseSubtype}>
                <div className={styles.CaseSubtypeRow}>
                  {/* ปุ่ม ใน CaseSubtypeModal */}
                  <div className={styles.CaseSubtypeBtns}>
                    <div className={styles.CaseSubtypeActionRow}>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.ViewBtnCaseSubtype}
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(cs);
                          }}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>

                        <button
                          className={styles.EditBtnCaseSubtype}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(cs);
                          }}
                        >
                          <FontAwesomeIcon icon={faPencil} />
                        </button>

                        <button
                          className={styles.DeleteBtnCaseSubtype}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(cs.idCaseSubtype);
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>

                    {/*----รายละเอียด CaseSubtype----*/}
                    <div className={styles.CaseSubtypeTH}>
                      ชื่อประเภทย่อย: {cs.th}
                    </div>

                    {/* 
                      <strong className={styles.CaseSubtypeTH}>
                        ชื่อประเภทย่อย: {cs.en}
                      </strong> 
                    </div>
                    </div>*/}
                  </div>

                  <div className={styles.cstpasswordCode}>
                    รหัสประเภทย่อย: {cs.sTypeCode || "-"}
                  </div>

                  {/*---- ความสำคัญ ----*/}
                  <div>
                    {getPriorityLabelShort(cs.priority) && (
                      <div
                        className={`${styles.priorityBox} ${
                          cs.priority === "0"
                            ? styles.priorityCritical
                            : styles.priorityHigh
                        }`}
                      >
                        {getPriorityLabelShort(cs.priority)}
                      </div>
                    )}
                  </div>
                  <div className={styles.cstStatus}>
                    สถานะ: {cs.active ? "Active" : "Inactive"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* จำกัด จำนวน CaseSubtype ต่อหน้า */}
        <div className={styles.setPage}>
          <button
            className={styles.BackBtnCaseSubtype}
            disabled={currentPage === 1}
            onClick={onPrevPage}
          >
            กลับ
          </button>

          <span className={styles.pageshowCaseSubtype}>
            หน้า {currentPage} / {totalPages}
          </span>

          <button
            className={styles.NextBtnCaseSubtype}
            disabled={currentPage >= totalPages}
            onClick={onNextPage}
          >
            ถัดไป
          </button>
        </div>
      </div>
    </div>
  );
}
