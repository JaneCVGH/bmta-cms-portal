// components\CaseSubtypeModal.js
"use client";
import React from "react";
import styles from "../style/casesubtypemodal.module.css";
import { useState, useEffect, useRef } from "react";

import Select from "react-select";
import CreatableSelect from "react-select/creatable";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

export default function CaseSubtypeModal({
  show,
  type,
  formData,
  caseTypes,
  handleChange,
  handleSubmit,
  onClose,
}) {
  if (!show) return null;

  const isView = type === "view";
  const isEdit = type === "edit";
  const isAdd = type === "add";

  const sTypeCodeRef = useRef(null);
  const thRef = useRef(null);
  const enRef = useRef(null);

  // ViewBox
  const ViewBox = ({ value }) => (
    <div className={styles.viewBox}>
      {value !== undefined && value !== null && value !== "" ? value : "-"}
    </div>
  );

  // ทักษะ
  const [skills, setSkills] = useState([]);
  const selectedSkills = skills.filter((s) =>
    (formData.userSkillList || []).includes(s.skillId),
  );

  // คุณสมบัติ
  const [properties, setProperties] = useState([]);
  const selectedProperties = properties.filter((p) =>
    (formData.unitPropLists || []).includes(p.propId),
  );

  // เวิร์กโฟลว์
  const [workflows, setWorkflows] = useState([]);

  //ความสำคัญ
  const priorityNum = Number(formData.priority);
  const getPriorityLabel = (p) => {
    if (p === null || p === undefined || isNaN(p)) return "-";
    if (p === 0) return "0 (ความสำคัญวิกฤต)";
    if (p === 1 || p === 2) return `${p} (ความสำคัญสูง)`;
    if (p >= 3 && p <= 5) return `${p} (ความสำคัญปานกลาง)`;
    if (p >= 6 && p <= 9) return `${p} (ความสำคัญต่ำ)`;

    return String(p);
  };

  const priorityOptions = Array.from({ length: 10 }, (_, i) => ({
    value: String(i),
    label: getPriorityLabel(i),
  }));

  //สถานะ
  const statusOptions = [
    { value: true, label: "Active" },
    { value: false, label: "Inactive" },
  ];

  // ทักษะ
  useEffect(() => {
    const fetchSkills = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const res = await fetch(
          "https://welcome-service-stg.metthier.ai:65000/api/v1/skill?start=0&length=100",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );

        const result = await res.json();
        setSkills(result.data || []);
      } catch (err) {
        console.error("fetchSkills error:", err);
        setSkills([]);
      }
    };

    fetchSkills();
  }, []);

  // คุณสมบัติ
  useEffect(() => {
    const fetchProperties = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const res = await fetch(
          "https://welcome-service-stg.metthier.ai:65000/api/v1/mdm/properties?start=0&length=100",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );

        const result = await res.json();
        setProperties(result.data || []);
      } catch (err) {
        console.error("fetchProperties error:", err);
        setProperties([]);
      }
    };

    fetchProperties();
  }, []);

  // เวิร์กโฟลว์
  useEffect(() => {
    const fetchWorkflows = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const res = await fetch(
          "https://welcome-service-stg.metthier.ai:65000/api/v1/workflows",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );

        const result = await res.json();
        console.log("WORKFLOWS RESPONSE:", result);

        const workflowList =
          result.data?.content || result.data || result.content || [];

        setWorkflows(workflowList);
        // setWorkflows(result.data || []);
      } catch (err) {
        console.error("fetchWorkflows error:", err);
        setWorkflows([]);
      }
    };

    fetchWorkflows();
  }, []);

  {
    /* -------modal view ------- */
  }
  const ViewField = ({ label, value }) => (
    <div className={styles.viewField}>
      <span className={styles.viewLabel}>{label}</span>
      <span className={styles.viewValue}>
        {Array.isArray(value)
          ? value.length
            ? value.join(", ")
            : "-"
          : (value ?? "-")}
      </span>
    </div>
  );

  return (
    <div className={styles.modalCaseSubtype} onClick={onClose}>
      <div
        className={styles.modalCaseSubtypeBox}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.CaseSubtypelContent}>
          <button
            className={styles.CloseCTButtons}
            onClick={onClose}
            type="button"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>

          <h2 className={styles.CaseSubtypeTitle}>
            {isAdd
              ? "เพิ่มประเภทย่อย"
              : isEdit
                ? "แก้ไขประเภทย่อย"
                : "ประเภทย่อย"}
          </h2>

          {/* <form onSubmit={handleSubmit}> */}
          <form onSubmit={handleSubmit} noValidate>
            {/* -------Modal ADD / EDIT ------- */}
            {(isAdd || isEdit) && (
              <>
                {/* ประเภท */}
                <div className={styles.editRow}>
                  <label className={styles.editLabel}>ประเภท:</label>
                  <input
                    type="text"
                    value={formData.caseTypeName || ""}
                    readOnly
                    className={styles.editInput}
                  />
                </div>

                <div className={styles.editRow}>
                  <label className={styles.editLabel}>รหัสประเภทย่อย:</label>
                  <input
                    ref={sTypeCodeRef}
                    name="sTypeCode"
                    value={formData.sTypeCode}
                    onChange={handleChange}
                    className={styles.editInput}
                  />
                </div>

                <div className={styles.editRow}>
                  <label className={styles.editLabel}>ชื่อภาษาไทย:</label>
                  <input
                    ref={thRef}
                    name="th"
                    value={formData.th}
                    onChange={handleChange}
                    className={styles.editInput}
                  />
                </div>

                <div className={styles.editRow}>
                  <label className={styles.editLabel}>ชื่อภาษาอังกฤษ:</label>
                  <input
                    ref={enRef}
                    name="en"
                    value={formData.en}
                    onChange={handleChange}
                    className={styles.editInput}
                  />
                </div>

                {/* ความสำคัญ 3-9 ไม่ขึ้นอะไร 2,1 คือความสำคัญสูง 0 คือความสำคัญวิกฤต */}
                <div className={styles.editRow}>
                  <label className={styles.editLabel}>ความสำคัญ:</label>

                  <div className={styles.selectWrapper}>
                    <Select
                      className={styles.reactSelect}
                      classNamePrefix="rs"
                      placeholder="เลือกระดับความสำคัญ"
                      isSearchable={false} // ❌ พิมพ์ไม่ได้
                      options={priorityOptions}
                      value={
                        priorityOptions.find(
                          (p) => p.value === String(formData.priority),
                        ) || null
                      }
                      onChange={(selected) =>
                        handleChange({
                          target: {
                            name: "priority",
                            value: selected ? selected.value : null,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className={styles.editRow}>
                  <label className={styles.editLabel}>คุณสมบัติ:</label>
                  <div className={styles.selectWrapper}>
                    <CreatableSelect
                      className={styles.reactSelect}
                      classNamePrefix="rs"
                      isMulti
                      placeholder="เลือกหรือพิมพ์เพิ่มคุณสมบัติ"
                      options={properties.map((p) => ({
                        value: p.propId,
                        label: p.th,
                      }))}
                      value={(formData.unitPropLists || []).map((v) => {
                        const found = properties.find((p) => p.propId === v);
                        return found
                          ? { value: found.propId, label: found.th }
                          : { value: v, label: v };
                      })}
                      onChange={(selected) =>
                        handleChange({
                          target: {
                            name: "unitPropLists",
                            value: selected ? selected.map((s) => s.value) : [],
                          },
                        })
                      }
                      formatCreateLabel={(inputValue) =>
                        `เพิ่มคุณสมบัติใหม่: "${inputValue}"`
                      }
                      noOptionsMessage={() => "พิมพ์เพื่อเพิ่มคุณสมบัติ"}
                    />
                  </div>
                </div>

                <div className={styles.editRow}>
                  <label className={styles.editLabel}>ทักษะ:</label>
                  <div className={styles.selectWrapper}>
                    <CreatableSelect
                      className={styles.reactSelect}
                      classNamePrefix="rs"
                      isMulti
                      placeholder="เลือกทักษะ"
                      options={skills.map((skill) => ({
                        value: skill.skillId,
                        label: `${skill.th} (${skill.en})`,
                      }))}
                      value={skills
                        .filter((s) =>
                          formData.userSkillList?.includes(s.skillId),
                        )
                        .map((s) => ({
                          value: s.skillId,
                          label: `${s.th} (${s.en})`,
                        }))}
                      onChange={(selected) =>
                        handleChange({
                          target: {
                            name: "userSkillList",
                            value: selected ? selected.map((s) => s.value) : [],
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className={styles.editRow}>
                  <label className={styles.editLabel}>เวิร์กโฟลว์:</label>

                  <div className={styles.selectWrapper}>
                    <Select
                      className={styles.reactSelect}
                      classNamePrefix="rs"
                      placeholder="เลือกเวิร์กโฟลว์"
                      isClearable
                      isSearchable={false} // ❌ ห้ามพิมพ์
                      options={workflows.map((wf) => ({
                        value: wf.wfId,
                        label: wf.title,
                      }))}
                      value={
                        workflows
                          .filter((wf) => wf.wfId === formData.wfId)
                          .map((wf) => ({
                            value: wf.wfId,
                            label: wf.title,
                          }))[0] || null
                      }
                      onChange={(selected) =>
                        handleChange({
                          target: {
                            name: "wfId",
                            value: selected ? selected.value : null,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className={styles.editRow}>
                  <label className={styles.editLabel}>SLA:</label>
                  <input
                    type="text"
                    name="caseSla"
                    value="0"
                    readOnly
                    className={styles.editInput}
                  />
                </div>

                <div className={styles.editRow}>
                  <label className={styles.editLabel}>ประเภทอุปกรณ์:</label>
                  <input
                    type="text"
                    name="mDeviceType"
                    value={formData.mDeviceType || ""}
                    onChange={handleChange}
                    className={styles.editInput}
                  />
                </div>

                <div className={styles.editRow}>
                  <label className={styles.editLabel}>ชื่อประเภทอุปกรณ์:</label>
                  <input
                    type="text"
                    name="mDeviceTypeName"
                    value={formData.mDeviceTypeName || ""}
                    onChange={handleChange}
                    className={styles.editInput}
                  />
                </div>

                <div className={styles.editRow}>
                  <label className={styles.editLabel}>ประเภทใบงาน:</label>
                  <input
                    type="text"
                    name="mWorkOrderType"
                    value={formData.mWorkOrderType || ""}
                    onChange={handleChange}
                    className={styles.editInput}
                  />
                </div>

                {/* ===== สถานะ ===== */}
                <div className={styles.editRow}>
                  <label className={styles.editLabel}>สถานะ:</label>

                  <div className={styles.selectWrapper}>
                    <Select
                      className={styles.reactSelect}
                      classNamePrefix="rs"
                      placeholder="เลือกสถานะ"
                      isClearable
                      isSearchable={false} // ❌ ห้ามพิมพ์
                      options={statusOptions}
                      value={
                        statusOptions.find(
                          (opt) => opt.value === formData.active,
                        ) || null
                      }
                      onChange={(selected) =>
                        handleChange({
                          target: {
                            name: "active",
                            value: selected ? selected.value : null,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </>
            )}

            {/* {/* ------- Modal VIEW ------- */}
            {isView && (
              <>
                <div className={styles.editRow}>
                  <label className={styles.editLabel}>ประเภท:</label>
                  <ViewBox value={formData.caseTypeName} />
                </div>

                {/* รหัสประเภทย่อย */}
                <div className={styles.editRow}>
                  <label className={styles.editLabel}>รหัสประเภทย่อย:</label>
                  <ViewBox value={formData.sTypeCode} />
                </div>

                {/* ชื่อภาษาไทย */}
                <div className={styles.editRow}>
                  <label className={styles.editLabel}>ชื่อภาษาไทย:</label>
                  <ViewBox value={formData.th} />
                </div>

                {/* ชื่อภาษาอังกฤษ */}
                <div className={styles.editRow}>
                  <label className={styles.editLabel}>ชื่อภาษาอังกฤษ:</label>
                  <ViewBox value={formData.en} />
                </div>

                {/* ความสำคัญ */}
                <div className={styles.editRow}>
                  <label className={styles.editLabel}>ความสำคัญ:</label>
                  {(() => {
                    const priorityNum = Number(formData.priority);

                    return (
                      <div
                        className={`${styles.priorityViewBox} ${
                          priorityNum === 0
                            ? styles.priorityCritical
                            : priorityNum === 1 || priorityNum === 2
                              ? styles.priorityHigh
                              : ""
                        }`}
                      >
                        {getPriorityLabel(priorityNum)}
                      </div>
                    );
                  })()}
                </div>

                {/* คุณสมบัติ */}
                <div className={styles.editRow}>
                  <label className={styles.editLabel}>คุณสมบัติ:</label>
                  <ViewBox
                    value={
                      selectedProperties.length
                        ? selectedProperties.map((p) => p.th).join(", ")
                        : "ไม่ระบุ"
                    }
                  />
                </div>

                {/* ทักษะ */}
                <div className={styles.editRow}>
                  <label className={styles.editLabel}>ทักษะ:</label>
                  <ViewBox
                    value={
                      selectedSkills.length
                        ? selectedSkills
                            .map((s) => `${s.th} (${s.en})`)
                            .join(", ")
                        : "-"
                    }
                  />
                </div>

                {/* เวิร์กโฟลว์ */}
                <div className={styles.editRow}>
                  <label className={styles.editLabel}>เวิร์กโฟลว์:</label>
                  <ViewBox
                    value={
                      workflows.find((w) => w.wfId === formData.wfId)?.title ||
                      "-"
                    }
                  />
                </div>

                {/* SLA */}
                <div className={styles.editRow}>
                  <label className={styles.editLabel}>SLA:</label>
                  <ViewBox value={formData.caseSla ?? "0"} />
                </div>

                {/* ประเภทอุปกรณ์ */}
                <div className={styles.editRow}>
                  <label className={styles.editLabel}>ประเภทอุปกรณ์:</label>
                  <ViewBox value={formData.mDeviceType || "-"} />
                </div>

                {/* ชื่อประเภทอุปกรณ์ */}
                <div className={styles.editRow}>
                  <label className={styles.editLabel}>ชื่อประเภทอุปกรณ์:</label>
                  <ViewBox value={formData.mDeviceTypeName || "-"} />
                </div>

                {/* ประเภทใบงาน */}
                <div className={styles.editRow}>
                  <label className={styles.editLabel}>ประเภทใบงาน:</label>
                  <ViewBox value={formData.mWorkOrderType || "-"} />
                </div>

                {/* สถานะ */}
                <div className={styles.editRow}>
                  <label className={styles.editLabel}>สถานะ:</label>
                  <ViewBox
                    value={
                      formData.active === null
                        ? "-"
                        : formData.active
                          ? "Active"
                          : "Inactive"
                    }
                  />
                </div>

                {/* วันที่สร้าง */}
                <div className={styles.editRow}>
                  <label className={styles.editLabel}>วันที่สร้าง:</label>
                  <ViewBox
                    value={
                      formData.createdAt
                        ? new Date(formData.createdAt).toLocaleString("th-TH")
                        : "-"
                    }
                  />
                </div>

                {/* วันที่อัปเดตล่าสุด */}
                <div className={styles.editRow}>
                  <label className={styles.editLabel}>
                    วันที่อัปเดตล่าสุด:
                  </label>
                  <ViewBox
                    value={
                      formData.updatedAt
                        ? new Date(formData.updatedAt).toLocaleString("th-TH")
                        : "-"
                    }
                  />
                </div>
              </>
            )}

            <div className={styles.modalSave}>
              {!isView && (
                <button type="submit" className={styles.SaveCSButtons}>
                  บันทึก
                </button>
              )}

              {/* <button
                type="button"
                className={styles.CloseCSButtons}
                onClick={onClose}
              >
                ปิด
              </button> */}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
