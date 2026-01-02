// app\components\TicketListModal.js
"use client";

import React from "react";
import { safeText, safeDate, safeNormalize } from "../utils/safe";
import Select from "react-select";
import styles from "../style/ticketlistModal.module.css";

export default function TicketListModal({
  show,
  // type,
  onClose,
  ticketData,
  areaList,
  getCaseTypeTh,
  getCaseSubTypeTh,
  onExport
}) {

  console.log("MODAL RENDER");
  console.log("MODAL ticketData:", ticketData);

  if (!show) return null;

  // loading
  if (!ticketData) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  const handleExport = () => {
  if (!selectedArea) {
    alert("กรุณาเลือกพื้นที่รับผิดชอบ");
    return;
  }

  onExport({
    caseId: ticketData.caseId,
    areaText: selectedArea.label,   
    areaValue: selectedArea.value, 
  });

  onClose();
};


  // error
  if (ticketData.error) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <button className={styles.closeTopRight} onClick={onClose}>✖</button>
          <p>{ticketData.message || "เกิดข้อผิดพลาด"}</p>
        </div>
      </div>
    );
  }

    // console.log("MODAL TICKET:", ticketData);
    //  console.log("AREA MAP:", areaMap);
    // console.log(
    //   "LOOKUP:",
    //   ticketData.countryId,
    //   getCountryTh(ticketData.countryId)
    // );

    // const [selectedArea, setSelectedArea] = React.useState("");

    const [selectedArea, setSelectedArea] = React.useState(null);

    const areaOptions = areaList.map(a => ({
      value: `${a.countryId}|${a.provId}|${a.distId}`,
      label: `${a.countryTh} - ${a.provinceTh} - ${a.districtTh}`
    }));

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <button
            className={styles.closeTopRight}
            onClick={onClose}> ✖ </button>

          <h2 className={styles.modalTitle}>รายละเอียดคำร้อง</h2>

          <div className={styles.modalBody}>
            <div className={styles.field}>
              <span className={styles.label}>รหัสคำร้อง: </span>
              <div className={styles.valueBox}>
                {safeText(ticketData.caseId)}
              </div>
            </div>

           <div className={styles.field}>
              <span className={styles.label}>หัวข้อ: </span>
              <div className={styles.valueBox}>
                {getCaseTypeTh(ticketData.caseTypeId)}
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>รายละเอียด: </span>
              <div className={styles.valueBox}>
                {getCaseSubTypeTh(
                  ticketData.caseTypeId,
                  ticketData.caseSTypeId
                )}
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>สถานะ: </span>
              <div className={styles.valueBox}>
                {safeText(ticketData.statusId)}
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>วันที่ส่ง: </span>
              <div className={styles.valueBox}>
                {safeDate(ticketData.startedDate)}
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>วันที่สิ้นสุด: </span>
              <div className={styles.valueBox}>
                {safeDate(ticketData.createdAt)}
              </div>
            </div>    
            
            <div className={styles.fieldSelect}>
              <span className={styles.label}>พื้นที่รับผิดชอบ: </span>

              <div className={styles.selectWrapper}>
                <Select
                  options={areaOptions}
                  value={selectedArea}
                  onChange={setSelectedArea}
                  placeholder="เลือกพื้นที่รับผิดชอบ"
                  isClearable
                  classNamePrefix="rs"
                />
              </div>
              {/* {selectedArea && (
                <div className={`${styles.valueBox} ${styles.selectedAreaBox}`}>
                  {selectedArea.label}
                </div>
              )} */}
            </div>

            <div className={styles.footerButtons}>
                <button className={styles.rejectBtn} type="submit">ไม่อนุมัติ</button>
                <button className={styles.exportBtn} type="button" onClick={onClose}>ส่งออก</button> 
                {/* handleExport */}
            </div>

          </div>
        </div>
      </div>
    );
  }

   