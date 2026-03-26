//src\app\pages\form\formEditModal.js
import { useState, useRef, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Header from "./header";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";

import RenderForm from "./renderForm";
import { downloadPDF } from "@/app/utils/pdf";
import { showQuestionSwal } from "@/app/lib/ErrorSwal";
import styles from "../../style/form.module.css";

const DynamicFormRenderer = ({
  formFieldJson,
  setFormFields,
  handleClose,
  show,
  caseId,
  casewithsub,
  JsonData,
  onFormChange,
  onDataChange,
  Area,
  formSelect,
  UpdateCase,
  viewMode,
  CreateCase,
  isCreateMode,
  updateStatus,
  statusId,
}) => {
  const handleDownloadPDF = async () => {
    setisPrint(true);

    setTimeout(async () => {
      if (!printRef.current) return;

      await downloadPDF(printRef.current);

      setisPrint(false);
    }, 300);
  };

  const [isPrint, setisPrint] = useState(false);
  const [isEdit, setisEdit] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  // S014 = ยกเลิก, S007 = ปิดงาน
  const isLocked = ["S007", "S014"].includes(statusId);

  const handleReject = async () => {
    if (isLocked) return;

    const result = await showQuestionSwal({
      title: "ไม่อนุมัติคำร้อง",
      text: "รายการนี้จะถูกยกเลิก และไม่สามารถเปลี่ยนสถานะได้",
    });

    if (!result.isConfirmed) return;
    updateStatus(caseId, "S014");
  };

  const handleDispatch = async () => {
    if (isLocked) return;
    const result = await showQuestionSwal({
      title: "ยืนยันส่งออก?",
      text: "รายการนี้จะดำเนินการในขั้นตอนถัดไป",
    });

    if (!result.isConfirmed) return;

    updateStatus(caseId, "S003");
  };

  console.log(formFieldJson);
  return (
    <Modal
      show={show}
      onHide={handleClose}
      dialogClassName={styles.modalA4}
      centered
      scrollable={true} 
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {/* {caseId} */}
          {isCreateMode ? "สร้างคำร้อง" : `${caseId}`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-2">
          <button onClick={handleDownloadPDF} className={styles.btnSavePDF}>
            บันทึก PDF
          </button>

          {!viewMode && (
            <>
              {isCreateMode ? (
                <button
                  onClick={CreateCase}
                  disabled={isCreateMode ? false : !isEdit}
                  // variant="success"
                  className={styles.btnCreateCase}
                >
                  สร้างคำร้อง
                </button>
              ) : (
                <button
                  onClick={UpdateCase}
                  disabled={!isEdit}
                  // variant="warning"
                  className={styles.btnUpdateCase}
                >
                  แก้ไขคำร้อง
                </button>
              )}
            </>
          )}
        </div>
        <Header
          casewithsub={casewithsub}
          formSelect={formSelect}
          onFormChange={onFormChange}
          onDataChange={onDataChange}
          JsonData={JsonData}
          Area={Area}
          update={!isCreateMode}
          isPrint={isPrint}
          viewMode={viewMode}
        />
        <div ref={printRef} className="a4-paper">
          {formFieldJson != null && (
            <RenderForm
              formFieldJson={formFieldJson}
              setisEdit={setisEdit}
              setFormFields={setFormFields}
              isPrint={isPrint}
              viewMode={viewMode}
            />
          )}
        </div>
      </Modal.Body>

      <Modal.Footer>
        {!isCreateMode && (
          <>
            <button
              onClick={handleReject}
              disabled={isLocked}
              className={styles.btnReject}
            >
              ไม่อนุมัติ
            </button>

            <button
              onClick={handleDispatch}
              disabled={isLocked}
              className={styles.btnDispatch}
            >
              ส่งออก
            </button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default DynamicFormRenderer;

{
  /* <Button variant="primary" onClick={handleClose}>
          บันทึกแบบร่าง
        </Button>  */
}
