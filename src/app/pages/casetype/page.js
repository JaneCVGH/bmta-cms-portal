// casetype/page.js

"use client";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import styles from "../../style/casetype.module.css";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

import CaseTypeModal from "../../components/CaseTypeModal";
import CaseSubtypeModal from "../../components/CaseSubtypeModal";
import CaseSubtypeListModal from "../../components/CaseSubtypeListModal";

import { apiFetch, BASE_URL } from "@/app/lib/apiClient";
import {
  clearSessionAndLogout,
  showErrorSwal,
  requireSession,
  handleApiError,
} from "@/app/lib/ErrorSwal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faEye,
  faTrash,
  faSquarePlus,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";

export default function CaseTypesPage() {
  const [caseTypes, setCaseTypes] = useState([]);
  const [caseSubtypesByType, setCaseSubtypesByType] = useState({});

  const [currentCasetypeId, setCurrentCasetypeId] = useState(null);

  // **---ประเภท
  const [caseTypeFormData, setCaseTypeFormData] = useState({
    idCasetype: "",
    th: "",
    en: "",
    subtypeCount: 0,
    createdAt: "",
    createdBy: "",
    updatedAt: "",
    updatedBy: "",
  });

  // **---ประเภทย่อย
  const [caseSubtypeFormData, setCaseSubtypeFormData] = useState({
    idCaseSubtype: "",
    typeId: "",
    caseTypeName: "",
    sTypeCode: "",
    th: "",
    en: "",

    priority: "0",
    caseSla: "0",
    wfId: null,
    unitPropLists: [],
    userSkillList: [],

    createdAt: "",
    updatedAt: "",
    createdBy: "",
    updatedBy: "",

    mDeviceType: "",
    mWorkOrderType: "",
    mDeviceTypeName: "",

    active: null,
  });

  const [showCasetypeModal, setShowCasetypeModal] = useState(false);
  const [showCaseSubTypeModal, setshowCaseSubTypeModal] = useState(false);

  const [modalType, setModalType] = useState("add");
  const [editedCaseTypeIds, setEditedCaseTypeIds] = useState([]);

  // จำกัดจำนวน CaseType ต่อ 1 หน้า
  const [caseTypePage, setCaseTypePage] = useState(1);
  const caseTypeRowsPerPage = 6;

  const pagedCaseTypes = caseTypes.slice(
    (caseTypePage - 1) * caseTypeRowsPerPage,
    caseTypePage * caseTypeRowsPerPage,
  );

  const totalCaseTypePages = Math.ceil(caseTypes.length / caseTypeRowsPerPage);

  // จำกัดจำนวน 6 CaseSubType ต่อ 1 หน้า
  const [caseSubtypePage, setCaseSubtypePage] = useState({});
  const caseSubtypeRowsPerPage = 4;

  //ความสำคัญ
  const getPriorityLabelShort = (p) => {
    const n = Number(p);
    if (n === 0) return "0 (ความสำคัญวิกฤต)";
    if (n === 1 || n === 2) return `${n} (ความสำคัญสูง)`;
    return null; // 3–9 ไม่แสดง
  };

  // เรียก CaseSubtypeListModal
  const [showCaseSubtypeListModal, setShowCaseSubtypeListModal] =
    useState(false);

  const router = useRouter();

  // **---ประเภท
  const fetchCaseTypes = async () => {
    try {
      const result = await apiFetch(`${BASE_URL}/casetypes`);

      const mappedCaseTypes = (result.data || [])
        .map((type) => ({
          idCasetype: type.typeId,
          th: type.th,
          en: type.en,
          createdAt: type.createdAt,
          createdBy: type.createdBy,
          updatedAt: type.updatedAt,
          updatedBy: type.updatedBy,
          subtypeCount: 0,
        }))

        .sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

      setCaseTypes(mappedCaseTypes);
    } catch (err) {
      console.error("fetchCaseTypes error:", err);
      handleApiError(err, "ไม่สามารถโหลดข้อมูลประเภทได้");
      setCaseTypes([]);
    }
  };

  // **---นับจำนวน ประเภทย่อย
  const fetchCountCaseSubtypes = async () => {
    try {
      const result = await apiFetch(`${BASE_URL}/casesubtypes`);

      const countMap = {};
      (result.data || []).forEach((st) => {
        if (!countMap[st.typeId]) countMap[st.typeId] = 0;
        countMap[st.typeId]++;
      });

      setCaseTypes((prev) =>
        prev.map((ct) => ({
          ...ct,
          subtypeCount: countMap[ct.idCasetype] || 0,
        })),
      );
    } catch (err) {
      console.error("fetchCountCaseSubtypes error:", err);

      handleApiError(err, "ไม่สามารถโหลดข้อมูลประเภทได้");
      showErrorSwal("ไม่สามารถโหลดจำนวนประเภทย่อยได้");
    }
  };

  const getCaseSubtypes = async () => {
    try {
      const result = await apiFetch(`${BASE_URL}/casesubtypes`);

      return (result.data || []).map((st) => ({
        idCaseSubtype: st.sTypeId,
        typeId: st.typeId,
        sTypeCode: st.sTypeCode,
        th: st.th,
        en: st.en,
        priority: String(st.priority ?? "0"),
        caseSla: String(st.caseSla ?? "0"),
        wfId: st.wfId ?? null,
        userSkillList: st.userSkillList || [],
        unitPropLists: st.unitPropLists || [],
        active: st.active,
        createdAt: st.createdAt,
        updatedAt: st.updatedAt,
        mDeviceType: st.mDeviceType,
        mDeviceTypeName: st.mDeviceTypeName,
        mWorkOrderType: st.mWorkOrderType,
      }));
    } catch (err) {
      console.error("getCaseSubtypes error:", err);
      throw err;
    }
  };

  const loadCaseSubtypesByType = async (casetypeId, errorMessage) => {
    try {
      const allSubtypes = await getCaseSubtypes();

      setCaseSubtypesByType((prev) => ({
        ...prev,
        [casetypeId]: allSubtypes
          .filter((st) => st.typeId === casetypeId)
          .sort((a, b) => {
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          }),
      }));
    } catch (error) {
      showErrorSwal(errorMessage || "ไม่สามารถโหลดข้อมูลประเภทย่อยได้");
    }
  };

  useEffect(() => {
    // if (!requireSession()) return;

    const loadData = async () => {
      await fetchCaseTypes();
      await fetchCountCaseSubtypes();
    };
    loadData();
  }, []);

  const handleCaseTypeChange = (e) => {
    setCaseTypeFormData({
      ...caseTypeFormData,
      [e.target.name]: e.target.value,
    });
  };

  // -------Casetype Modal-------
  const handleOpenCaseTypeModal = (type, casetype = null) => {
    setModalType(type);
    setShowCasetypeModal(false);

    setCaseTypeFormData({
      idCasetype: casetype?.idCasetype || "",
      th: casetype?.th || "",
      en: casetype?.en || "",
      subtypeCount: casetype?.subtypeCount || 0,

      createdAt: casetype?.createdAt || "",
      createdBy: casetype?.createdBy || "",

      updatedAt: casetype?.updatedAt || "",
      updatedBy: casetype?.updatedBy || "",
    });
    setShowCasetypeModal(true);
  };

  //** แก้ไข Case_Types, เพิ่ม Case_Types */
  const editCaseTypeSubmit = async (e) => {
    e.preventDefault();

    // กรณีไม่กรอกอะไรเลย
    if (!caseTypeFormData.th?.trim() && !caseTypeFormData.en?.trim()) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณากรอกชื่อประเภทภาษาไทยและชื่อประเภทภาษาอังกฤษ",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    // ชื่อประเภทภาษาไทย
    if (!caseTypeFormData.th?.trim()) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณากรอกชื่อประเภทภาษาไทย",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    // ชื่อประเภทภาษาอังกฤษ
    if (!caseTypeFormData.en?.trim()) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณากรอกชื่อประเภทภาษาอังกฤษ",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    const isEdit = modalType === "edit";

    const url = isEdit
      ? `${BASE_URL}/casetypes/${caseTypeFormData.idCasetype}`
      : `${BASE_URL}/casetypes/add`;

    const payload = {
      th: caseTypeFormData.th,
      en: caseTypeFormData.en,
      active: true,
    };

    try {
      await apiFetch(url, {
        method: isEdit ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });

      await fetchCaseTypes();
      await fetchCountCaseSubtypes();
      setShowCasetypeModal(false);

      //**---แก้ไข Case Type--- **/
      Swal.fire({
        icon: "success",
        title: "สำเร็จ!",
        text: "ข้อมูลประเภทถูกบันทึกเรียบร้อยแล้ว",
        confirmButtonText: "ตกลง",
      });
    } catch (err) {
      console.error("editCaseTypeSubmit error:", err);
      handleApiError(err, "ไม่สามารถโหลดข้อมูลประเภทได้");
      showErrorSwal("ไม่สามารถบันทึกข้อมูลประเภทได้");
    }
  };

  //** ลบ Case_Types */
  const DeleteCaseType = async (caseTypeId) => {
    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "การลบข้อมูลประเภทจะไม่สามารถย้อนกลับได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonText: "ยกเลิก",
      confirmButtonText: "ยืนยัน",
    });

    if (!result.isConfirmed) return;

    try {
      await apiFetch(`${BASE_URL}/casetypes/${caseTypeId}`, {
        method: "DELETE",
      });

      await fetchCaseTypes();
      await fetchCountCaseSubtypes();

      Swal.fire({
        icon: "success",
        title: "ลบแล้ว",
        text: "ข้อมูลประเภทถูกลบเรียบร้อย",
        confirmButtonText: "ตกลง",
      });
    } catch (err) {
      console.error("DeleteCaseType error:", err);
      handleApiError(err, "ไม่สามารถโหลดข้อมูลประเภทได้");
      showErrorSwal("ไม่สามารถลบข้อมูลประเภทได้");
    }
  };

  const refreshCaseSubtypes = async (casetypeId) => {
    try {
      console.log("_refreshCaseSubtypes CALLED_", casetypeId);

      const allSubtypes = await getCaseSubtypes();
      setCaseSubtypesByType((prev) => ({
        ...prev,
        [casetypeId]: allSubtypes.filter((st) => st.typeId === casetypeId),
      }));
      return true;
    } catch (err) {
      console.log("❌ refreshCaseSubtypes CATCH", err);
      handleApiError(err, "ไม่สามารถโหลดข้อมูลประเภทได้");
      showErrorSwal("ไม่สามารถรีเฟรชข้อมูลประเภทย่อยได้");
      return false;
    }
  };

  const handleOpenCaseSubtypeModal = (type, casetypeId, subtype = null) => {
    setModalType(type);
    setCurrentCasetypeId(casetypeId);

    setCaseSubtypeFormData(
      subtype
        ? {
            ...subtype,
            typeId: casetypeId,

            priority: String(subtype.priority ?? "0"),
            caseSla: String(subtype.caseSla ?? "0"),
            wfId: subtype.wfId ?? null,

            userSkillList: Array.isArray(subtype.userSkillList)
              ? subtype.userSkillList
              : [],
            unitPropLists: Array.isArray(subtype.unitPropLists)
              ? subtype.unitPropLists
              : [],

            caseTypeName:
              caseTypes.find((ct) => ct.idCasetype === casetypeId)?.th || "",
          }
        : {
            idCaseSubtype: "",
            typeId: casetypeId,
            sTypeCode: "",
            th: "",
            en: "",

            priority: null,
            caseSla: "0",
            wfId: null, // wfId: st.wfId,

            userSkillList: [],
            unitPropLists: [],
            active: null,
            caseTypeName:
              caseTypes.find((ct) => ct.idCasetype === casetypeId)?.th || "",
          },
    );

    setshowCaseSubTypeModal(true);
  };

  const handleCaseSubtypeChange = (e) => {
    setCaseSubtypeFormData({
      ...caseSubtypeFormData,
      [e.target.name]: e.target.value,
    });
  };

  //** แก้ไข Case_Sub_Types, เพิ่ม Case_Types */
  const editCaseSubTypeSubmit = async (e) => {
    e.preventDefault();

    // ----ตรวจสอบ ประเภทย่อย ว่า อันไหนว่าง  (รวม)----
    const isAllEmpty =
      !caseSubtypeFormData.sTypeCode?.trim() &&
      !caseSubtypeFormData.th?.trim() &&
      !caseSubtypeFormData.en?.trim() &&
      // priority ต้องเป็น null หรือ undefined เท่านั้น ถึงถือว่าว่าง
      caseSubtypeFormData.priority === null &&
      (!Array.isArray(caseSubtypeFormData.unitPropLists) ||
        caseSubtypeFormData.unitPropLists.length === 0) &&
      (!Array.isArray(caseSubtypeFormData.userSkillList) ||
        caseSubtypeFormData.userSkillList.length === 0) &&
      !caseSubtypeFormData.wfId &&
      caseSubtypeFormData.active === null;

    // ----ถ้า ข้อมูลไม่ครบ ว่าง----
    if (isAllEmpty) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณากรอกข้อมูลให้ครบ",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    const isEdit = modalType === "edit";

    const url = isEdit
      ? `${BASE_URL}/casesubtypes/${caseSubtypeFormData.idCaseSubtype}`
      : `${BASE_URL}/casesubtypes/add`;

    // ----ถ้า ชื่อประเภทย่อยภาษาไทย ว่าง----
    if (!caseSubtypeFormData.th?.trim()) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณากรอกชื่อประเภทย่อยภาษาไทย",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    // ----ถ้า ชื่อประเภทย่อยภาษาอังกฤษ ว่าง----
    if (!caseSubtypeFormData.en?.trim()) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณากรอกชื่อประเภทย่อยภาษาอังกฤษ",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    // ---- ถ้า รหัสประเภทย่อย ว่าง ----
    if (!caseSubtypeFormData.sTypeCode?.trim()) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณากรอกรหัสประเภทย่อย",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    // ----ถ้า ระดับความสำคัญ ว่าง----
    if (!caseSubtypeFormData.priority && caseSubtypeFormData.priority !== "0") {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณาเลือกระดับความสำคัญ  1 รายการ",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    // ----ถ้า คุณสมบัติ ว่าง----
    if (
      !caseSubtypeFormData.unitPropLists ||
      caseSubtypeFormData.unitPropLists.length === 0
    ) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณาเลือกคุณสมบัติอย่างน้อย 1 รายการ",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    // ----ถ้า ทักษะ ว่าง----
    if (
      !caseSubtypeFormData.userSkillList ||
      caseSubtypeFormData.userSkillList.length === 0
    ) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณาเลือกทักษะอย่างน้อย 1 รายการ",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    // ----ถ้า เวิร์กโฟลว์ ว่าง----
    if (!caseSubtypeFormData.wfId) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณาเลือกเวิร์กโฟลว์ 1 รายการ",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    // ----ถ้า สถานะ ว่าง----
    if (caseSubtypeFormData.active === null) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบ",
        text: "กรุณาเลือกสถานะ 1 รายการ",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    const payload = {
      typeId: caseSubtypeFormData.typeId,
      sTypeCode: caseSubtypeFormData.sTypeCode,
      th: caseSubtypeFormData.th,
      en: caseSubtypeFormData.en,

      priority:
        caseSubtypeFormData.priority === "" ||
        caseSubtypeFormData.priority === null
          ? null
          : String(caseSubtypeFormData.priority),

      caseSla: String(caseSubtypeFormData.caseSla || "0"),
      active: caseSubtypeFormData.active,

      unitPropLists: caseSubtypeFormData.unitPropLists || [],
      userSkillList: caseSubtypeFormData.userSkillList || [],

      mDeviceType: caseSubtypeFormData.mDeviceType || null,
      mDeviceTypeName: caseSubtypeFormData.mDeviceTypeName || null,
      mWorkOrderType: caseSubtypeFormData.mWorkOrderType || null,

      wfId: caseSubtypeFormData.wfId || null,
    };
    console.log(typeof caseSubtypeFormData.priority);

    if (caseSubtypeFormData.wfId) {
      payload.wfId = caseSubtypeFormData.wfId;
    }

    try {
      await apiFetch(url, {
        method: isEdit ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });

      console.log("_BEFORE refreshCaseSubtypes_");

      setshowCaseSubTypeModal(false);

      const ok = await refreshCaseSubtypes(currentCasetypeId);
      if (!ok) return;

      //เพิ่ม ประเภทย่อย ใหม่--> เห็น ประเภทย่อย ใหม่ทันทีที่หน้า 1
      setCaseSubtypePage((prev) => ({
        ...prev,
        [currentCasetypeId]: 1,
      }));

      //นับจำนวน ประเภทย่อย หลังเพิ่มประเภทย่อย
      await fetchCountCaseSubtypes();

      console.log("_AFTER refreshCaseSubtypes_");

      Swal.fire({
        icon: "success",
        title: "สำเร็จ!",
        text: "ข้อมูลประเภทย่อยถูกบันทึกเรียบร้อยแล้ว",
        confirmButtonText: "ตกลง",
      });
    } catch (err) {
      console.error("editCaseSubTypeSubmit error:", err);
      handleApiError(err, "ไม่สามารถโหลดข้อมูลประเภทได้");
      showErrorSwal("ไม่สามารถบันทึกข้อมูลประเภทย่อยได้");
    }
  };

  //** ลบ Case_Sub_Types */
  const DeleteCaseSubType = async (idCaseSubtype) => {
    const confirmResult = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "การลบข้อมูลประเภทย่อยจะไม่สามารถย้อนกลับได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#A9A9A9",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await apiFetch(`${BASE_URL}/casesubtypes/${idCaseSubtype}`, {
        method: "DELETE",
      });

      await fetchCaseTypes();
      await fetchCountCaseSubtypes();
      await refreshCaseSubtypes(currentCasetypeId);

      Swal.fire({
        icon: "success",
        title: "ลบแล้ว",
        text: "ข้อมูลประเภทย่อยถูกลบเรียบร้อย",
        confirmButtonText: "ตกลง",
      });
    } catch (err) {
      console.error("DeleteCaseSubType error:", err);
      handleApiError(err, "ไม่สามารถโหลดข้อมูลประเภทได้");
      showErrorSwal("ไม่สามารถลบข้อมูลประเภทย่อยได้");
    }
  };

  return (
    <>
      <Navbar />

      <div className={styles.CaseTypeListheader}>
        {/* ----- Header ----- */}
        <div className={styles.CaseTypeHeaderRow}>
          <div className={styles.CaseTypeheader}>การจัดการบริการ</div>
          {/* ปุ่ม เพิ่ม CaseType */}
          <button
            className={styles.AddBtnCaseType}
            onClick={() => {
              if (!requireSession()) return;
              handleOpenCaseTypeModal("add");
            }}
          >
            <FontAwesomeIcon icon={faSquarePlus} /> สร้างประเภท
          </button>
        </div>

        {/* ----- CaseSubtype List ----- */}
        <div className={styles.CaseTypeList}>
          {pagedCaseTypes.map((ct) => (
            <div key={ct.idCasetype} className={styles.CaseTypeBlock}>
              {/* ---- Casetype Row ---- */}
              <div className={styles.CaseTypeTopRow}>
                <div className={styles.CaseTypeNameBlock}>
                  <div className={styles.CaseTypeTH}>{ct.th}</div>
                  <div className={styles.CaseTypeEN}>{ct.en}</div>
                  <div className={styles.CountSubCasetype}>
                    {ct.subtypeCount} ประเภทย่อย
                  </div>

                  {editedCaseTypeIds.includes(ct.idCasetype) && (
                    <div className={styles.UpdateDate}>
                      อัปเดตล่าสุด:{" "}
                      {ct.updatedAt
                        ? new Date(ct.updatedAt).toLocaleString("th-TH")
                        : "-"}
                    </div>
                  )}
                </div>
              </div>

              {/* เส้นคั่น ระหว่าง ประเภท กับ ปุ่ม */}
              <hr className={styles.CaseTypeDivider} />

              {/* แถบปุ่มล่างซ้าย ปุ่มดู, แก้ไข, ลบ CaseType */}
              <div className={styles.CaseTypeButtons}>
                <div className={styles.LeftBtnActions}>
                  <button
                    className={styles.ViewBtnCaseType}
                    onClick={() => {
                      if (!requireSession()) return;
                      handleOpenCaseTypeModal("view", ct);
                    }}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>

                  <button
                    className={styles.EditBtnCaseType}
                    onClick={() => {
                      if (!requireSession()) return;
                      handleOpenCaseTypeModal("edit", ct);
                    }}
                  >
                    <FontAwesomeIcon icon={faPencil} />
                  </button>

                  <button
                    className={styles.DeleteBtnCaseType}
                    onClick={() => {
                      if (!requireSession()) return;
                      DeleteCaseType(ct.idCasetype);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>

                {/* ปุ่มฝั่งขวา ดู ประเภทย่อย */}
                <button
                  className={styles.BtnCasesubType}
                  onClick={async () => {
                    if (!requireSession()) return;

                    setCurrentCasetypeId(ct.idCasetype);
                    await loadCaseSubtypesByType(
                      ct.idCasetype,
                      "ไม่สามารถดึงข้อมูลประเภทย่อยได้",
                    );
                    setShowCaseSubtypeListModal(true);
                  }}
                >
                  <FontAwesomeIcon icon={faCaretDown} /> ({ct.subtypeCount})
                </button>
              </div>
              {/* ----- CaseSubtype List ----- */}
            </div>
          ))}
        </div>

        {/* ---- ปุ่ม กลับ, หน้า...., ถัดไป Casetype ---- */}
        <div className={styles.PageBackground}>
          <div className={styles.setPage}>
            <button
              onClick={() => setCaseTypePage((p) => Math.max(p - 1, 1))}
              disabled={caseTypePage === 1}
            >
              กลับ
            </button>
            <span className={styles.PageText}>
              หน้า {caseTypePage} / {totalCaseTypePages}
            </span>
            <button
              onClick={() =>
                setCaseTypePage((p) => (p < totalCaseTypePages ? p + 1 : p))
              }
              disabled={caseTypePage >= totalCaseTypePages}
            >
              ถัดไป
            </button>
          </div>
        </div>

        {/* ----- Casetype Modal ----- */}
        {showCasetypeModal && (
          <CaseTypeModal
            show={showCasetypeModal}
            type={modalType}
            formData={caseTypeFormData}
            handleChange={handleCaseTypeChange}
            handleSubmit={editCaseTypeSubmit}
            onClose={() => setShowCasetypeModal(false)}
          />
        )}

        {/* ----- CaseSubtype Modal ----- */}
        {showCaseSubTypeModal && (
          <CaseSubtypeModal
            show={showCaseSubTypeModal}
            type={modalType}
            formData={caseSubtypeFormData}
            caseTypes={caseTypes}
            handleChange={handleCaseSubtypeChange}
            handleSubmit={editCaseSubTypeSubmit}
            onClose={() => setshowCaseSubTypeModal(false)}
          />
        )}

        {/* ----- CaseSubtype LIST Modal ----- */}
        {showCaseSubtypeListModal && (
          <CaseSubtypeListModal
            show
            casetype={caseTypes.find(
              (ct) => ct.idCasetype === currentCasetypeId,
            )}
            subtypes={caseSubtypesByType[currentCasetypeId] || []}
            currentPage={caseSubtypePage[currentCasetypeId] || 1}
            rowsPerPage={caseSubtypeRowsPerPage}
            getPriorityLabelShort={getPriorityLabelShort}
            onAdd={() => handleOpenCaseSubtypeModal("add", currentCasetypeId)}
            onView={(cs) =>
              handleOpenCaseSubtypeModal("view", currentCasetypeId, cs)
            }
            onEdit={(cs) =>
              handleOpenCaseSubtypeModal("edit", currentCasetypeId, cs)
            }
            onDelete={DeleteCaseSubType}
            onPrevPage={() =>
              setCaseSubtypePage((p) => ({
                ...p,
                [currentCasetypeId]: (p[currentCasetypeId] || 1) - 1,
              }))
            }
            onNextPage={() =>
              setCaseSubtypePage((p) => ({
                ...p,
                [currentCasetypeId]: (p[currentCasetypeId] || 1) + 1,
              }))
            }
            onClose={() => {
              setShowCaseSubtypeListModal(false);
              setCaseSubtypePage((prev) => ({
                ...prev,
                [currentCasetypeId]: 1,
              }));
            }}
          />
        )}
      </div>
    </>
  );
}
