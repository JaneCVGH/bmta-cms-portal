// casetype/page.js

"use client";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import styles from "../../style/casetype.module.css";
import Swal from "sweetalert2";

import CaseTypeModal from "../../components/CaseTypeModal";
import CaseSubtypeModal from "../../components/CaseSubtypeModal";
import CaseSubtypeListModal from "../../components/CaseSubtypeListModal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faEye,
  faTrash,
  faSquarePlus,
  faUserTie,
  faImage,
  faMagnifyingGlass,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";

export default function CaseTypesPage() {
  const [caseTypes, setCaseTypes] = useState([]);
  const [caseSubtypesByType, setCaseSubtypesByType] = useState({});

  const [openCasetypeId, setOpenCasetypeId] = useState(null);
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
    wfId: null, // wfId: subtype.wfId,wfId: st.wfId,

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

  // const [showUpdateCaseType, setshowUpdateCaseType] = useState(false);

  const [modalType, setModalType] = useState("add");
  const [editedCaseTypeIds, setEditedCaseTypeIds] = useState([]);

  // จำกัดจำนวน CaseType ต่อ 1 หน้า
  const [caseTypePage, setCaseTypePage] = useState(1);
  const caseTypeRowsPerPage = 6;

  const pagedCaseTypes = caseTypes.slice(
    (caseTypePage - 1) * caseTypeRowsPerPage,
    caseTypePage * caseTypeRowsPerPage,
  );

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

  const getTokenOrLogout = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const exp = payload.exp * 1000;

      if (Date.now() > exp) {
        localStorage.removeItem("accessToken");
        Swal.fire({
          icon: "warning",
          title: "Session หมดอายุ",
          text: "กรุณาเข้าสู่ระบบใหม่",
          confirmButtonText: "ตกลง",
        }).then(() => {
          window.location.href = "/login";
        });

        return null;
      }
      return token;
    } catch {
      return null;
    }
  };

  // **---ประเภท
  const fetchCaseTypes = async () => {
    const token = getTokenOrLogout();
    if (!token) return;

    try {
      const res = await fetch(
        "https://welcome-service-stg.metthier.ai:65000/api/v1/casetypes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const result = await res.json();

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
      setCaseTypes([]);
    }
  };
  // **---ประเภทย่อย
  const fetchCountCaseSubtypes = async () => {
    const token = getTokenOrLogout();
    if (!token) return;

    const res = await fetch(
      "https://welcome-service-stg.metthier.ai:65000/api/v1/casesubtypes",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    );

    const result = await res.json();

    // นับจำนวน CaseSubtype ต่อ typeId
    const countMap = {};
    result.data.forEach((st) => {
      if (!countMap[st.typeId]) {
        countMap[st.typeId] = 0;
      }
      countMap[st.typeId]++;
    });

    // เอาจำนวนไปใส่ใน caseTypes
    setCaseTypes((prev) =>
      prev.map((ct) => ({
        ...ct,
        subtypeCount: countMap[ct.idCasetype] || 0,
      })),
    );
  };

  const fetchCaseSubTypes = async (casetypeId) => {
    const token = getTokenOrLogout();
    if (!token) return;

    const res = await fetch(
      "https://welcome-service-stg.metthier.ai:65000/api/v1/casesubtypes",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    );

    const result = await res.json();

    // const filtered = result.data
    //   .filter((st) => st.typeId === casetypeId)
    //   .map((st) => ({
    const formatted = result.data
      .filter((st) => st.typeId === casetypeId)
      .map((st) => ({
        idCaseSubtype: st.sTypeId,
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
        createdBy: st.createdBy,
        updatedBy: st.updatedBy,

        mDeviceType: st.mDeviceType,
        mDeviceTypeName: st.mDeviceTypeName,
        mWorkOrderType: st.mWorkOrderType,
      }));

    setCaseSubtypesByType((prev) => ({
      ...prev,
      [casetypeId]: formatted, //filtered
    }));
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchCaseTypes();
      await fetchCountCaseSubtypes();
    };
    loadData();
  }, []);

  const handleToggleCaseSubtypes = async (idCasetype) => {
    // ถ้าคลิกอันเดิม → ปิด
    if (openCasetypeId === idCasetype) {
      setOpenCasetypeId(null);
      return;
    }

    // เปิดได้แค่อันเดียว
    setOpenCasetypeId(idCasetype);

    // reset หน้า subtype ของทุก casetype
    setCaseSubtypePage({
      [idCasetype]: 1,
    });

    // ดึง subtype เฉพาะอันที่เปิด
    await fetchCaseSubTypes(idCasetype);
  };

  const handleCaseTypeChange = (e) => {
    setCaseTypeFormData({
      ...caseTypeFormData,
      [e.target.name]: e.target.value,
    });
  };

  // -------Casetype-------
  const handleOpenCaseTypeModal = (type, casetype = null) => {
    setModalType(type);
    // setshowUpdateCaseType(true);
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

    const token = getTokenOrLogout();
    if (!token) return;

    const isEdit = modalType === "edit";

    const url = isEdit
      ? `https://welcome-service-stg.metthier.ai:65000/api/v1/casetypes/${caseTypeFormData.idCasetype}`
      : `https://welcome-service-stg.metthier.ai:65000/api/v1/casetypes/add`;

    // const method = isEdit ? "PATCH" : "POST";

    const payload = {
      th: caseTypeFormData.th,
      en: caseTypeFormData.en,
      active: true,
    };

    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      await fetchCaseTypes();

      // setshowUpdateCaseType(true);

      setShowCasetypeModal(false);

      const isAdd = modalType === "add";

      //**---แก้ไข Case Type--- **/
      Swal.fire({
        icon: "success",
        title: "สำเร็จ!",
        text: "ข้อมูล ประเภท ถูกบันทึกเรียบร้อยแล้ว",
        confirmButtonText: "ตกลง",
      });
    } else {
      try {
        const errorText = await res.text();
        console.error("❌ API Error:", errorText);
        Swal.fire(
          "เกิดข้อผิดพลาด",
          errorText || "ไม่สามารถบันทึกข้อมูล ประเภท ได้",
          "error",
        );
      } catch (err) {
        Swal.fire(
          "เกิดข้อผิดพลาด",
          "เกิดข้อผิดพลาดจากระบบหรือข้อมูลไม่ถูกต้อง",
          "error",
        );
        console.error("❌ JSON parse error:", err);
      }
    }
  };

  //** ลบ Case_Types */
  const DeleteCaseType = async (caseTypeId) => {
    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "การลบข้อมูล ประเภท จะไม่สามารถย้อนกลับได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonText: "ยกเลิก",
      confirmButtonText: "ยืนยัน",
    });

    if (!result.isConfirmed) return;

    try {
      const token = getTokenOrLogout();
      if (!token) return;

      const res = await fetch(
        `https://welcome-service-stg.metthier.ai:65000/api/v1/casetypes/${caseTypeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Delete CaseType failed");
      }

      await fetchCaseTypes(); // ดึง casetype ใหม่

      Swal.fire({
        icon: "success",
        title: "ลบแล้ว",
        text: "ข้อมูล ประเภท ถูกลบเรียบร้อย",
        confirmButtonText: "ตกลง",
      });
    } catch (error) {
      console.error("DeleteCaseType error:", error);
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถลบข้อมูล ประเภท ได้", "error");
    }
  };

  const refreshCaseSubtypes = async (casetypeId) => {
    const token = getTokenOrLogout();
    if (!token) return;

    const res = await fetch(
      "https://welcome-service-stg.metthier.ai:65000/api/v1/casesubtypes",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    );
    const data = await res.json();

    setCaseSubtypesByType((prev) => ({
      ...prev,
      [casetypeId]: data.data
        .filter((st) => st.typeId === casetypeId)
        .map((st) => ({
          idCaseSubtype: st.sTypeId,
          sTypeCode: st.sTypeCode,
          th: st.th,
          en: st.en,

          priority: st.priority,
          caseSla: st.caseSla,
          wfId: st.wfId,

          userSkillList: st.userSkillList || [],
          unitPropLists: st.unitPropLists || [],

          active: st.active,
          createdAt: st.createdAt,
          updatedAt: st.updatedAt,

          mDeviceType: st.mDeviceType,
          mDeviceTypeName: st.mDeviceTypeName,
          mWorkOrderType: st.mWorkOrderType,
        })),
    }));
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

  const editCaseSubTypeSubmit = async (e) => {
    e.preventDefault();

    const token = getTokenOrLogout();
    if (!token) {
      Swal.fire("ไม่พบ Token", "กรุณาเข้าสู่ระบบใหม่", "error");
      return;
    }

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
      Swal.fire("ข้อมูลไม่ครบ", "กรุณากรอกข้อมูลให้ครบ", "warning");
      return;
    }

    const isEdit = modalType === "edit";

    const url = isEdit
      ? `https://welcome-service-stg.metthier.ai:65000/api/v1/casesubtypes/${caseSubtypeFormData.idCaseSubtype}`
      : `https://welcome-service-stg.metthier.ai:65000/api/v1/casesubtypes/add`;

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

    // ----ถ้า ระดับความสำคัญ ว่าง----
    if (!caseSubtypeFormData.priority && caseSubtypeFormData.priority !== "0") {
      Swal.fire("ข้อมูลไม่ครบ", "กรุณาเลือกระดับความสำคัญ", "warning");
      return;
    }

    // ----ถ้า คุณสมบัติ ว่าง----
    if (
      !caseSubtypeFormData.unitPropLists ||
      caseSubtypeFormData.unitPropLists.length === 0
    ) {
      Swal.fire(
        "ข้อมูลไม่ครบ",
        "กรุณาเลือกคุณสมบัติอย่างน้อย 1 รายการ",
        "warning",
      );
      return;
    }

    // ----ถ้า ทักษะ ว่าง----
    if (
      !caseSubtypeFormData.userSkillList ||
      caseSubtypeFormData.userSkillList.length === 0
    ) {
      Swal.fire("ข้อมูลไม่ครบ", "กรุณาเลือกทักษะอย่างน้อย 1 รายการ", "warning");
      return;
    }

    // ----ถ้า เวิร์กโฟลว์ ว่าง----
    if (!caseSubtypeFormData.wfId) {
      Swal.fire("ข้อมูลไม่ครบ", "กรุณาเลือกเวิร์กโฟลว์ 1 รายการ", "warning");
      return;
    }

    // ----ถ้า สถานะ ว่าง----
    if (caseSubtypeFormData.active === null) {
      Swal.fire("ข้อมูลไม่ครบ", "กรุณาเลือกสถานะ", "warning");
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
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setshowCaseSubTypeModal(false);
        await refreshCaseSubtypes(currentCasetypeId);

        if (modalType === "add") {
          setCaseTypes((prev) =>
            prev.map((ct) =>
              ct.idCasetype === currentCasetypeId
                ? { ...ct, subtypeCount: ct.subtypeCount + 1 }
                : ct,
            ),
          );
        }

        Swal.fire({
          icon: "success",
          title: "สำเร็จ!",
          text: "ข้อมูล ประเภทย่อย ถูกบันทึกเรียบร้อยแล้ว",
          confirmButtonText: "ตกลง",
        });
      } else {
        const errText = await res.text();
        Swal.fire(
          "เกิดข้อผิดพลาด",
          errText || "ไม่สามารถบันทึกข้อมูล ประเภทย่อย ได้",
          "error",
        );
      }
    } catch (error) {
      console.error("editCaseSubTypeSubmit error:", error);
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเชื่อมต่อระบบได้", "error");
    }
  };

  //** ลบ Case_Sub_Types */
  const DeleteCaseSubType = async (idCaseSubtype) => {
    const confirmResult = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "การลบข้อมูล ประเภทย่อย จะไม่สามารถย้อนกลับได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#A9A9A9",
    });

    if (!confirmResult.isConfirmed) return;
    try {
      const token = getTokenOrLogout();
      if (!token) return;

      const res = await fetch(
        `https://welcome-service-stg.metthier.ai:65000/api/v1/casesubtypes/${idCaseSubtype}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await refreshCaseSubtypes(currentCasetypeId);

      // นับจำนวน ประเภทย่อย หลัง ลบประเภทย่อย
      setCaseTypes((prev) =>
        prev.map((ct) =>
          ct.idCasetype === currentCasetypeId
            ? { ...ct, subtypeCount: Math.max(ct.subtypeCount - 1, 0) }
            : ct,
        ),
      );

      Swal.fire({
        icon: "success",
        title: "ลบแล้ว",
        text: "ข้อมูล ประเภทย่อย ถูกลบเรียบร้อย",
        confirmButtonText: "ตกลง",
      });
    } catch (error) {
      console.error("DeleteCaseSubType error:", error);
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถลบข้อมูล ประเภทย่อย ได้", "error");
    }
  };

  return (
    <>
      <Navbar />

      <div className={styles.CaseTypeListheader}>
        {/* ----- Header ----- */}
        <div className={styles.CaseTypeHeaderRow}>
          <div className={styles.CaseTypeheader}>การจัดการบริการ</div>
          <button
            className={styles.AddBtnCaseType}
            onClick={() => handleOpenCaseTypeModal("add")}
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
                  <div className={styles.CaseTypeEN}>({ct.en})</div>
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

                <div className={styles.CaseTypeButtons}>
                  <button
                    className={styles.ViewBtnCaseType}
                    onClick={() => handleOpenCaseTypeModal("view", ct)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>

                  <button
                    className={styles.EditBtnCaseType}
                    onClick={() => handleOpenCaseTypeModal("edit", ct)}
                  >
                    <FontAwesomeIcon icon={faPencil} />
                  </button>

                  <button
                    className={styles.DeleteBtnCaseType}
                    onClick={() => DeleteCaseType(ct.idCasetype)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>

                  <button
                    className={styles.AddBtnCaseType}
                    onClick={async () => {
                      setCurrentCasetypeId(ct.idCasetype);
                      await fetchCaseSubTypes(ct.idCasetype);
                      setShowCaseSubtypeListModal(true);
                    }}
                  >
                    <FontAwesomeIcon icon={faCaretDown} /> ({ct.subtypeCount})
                  </button>
                </div>
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
              {" "}
              กลับ
            </button>{" "}
            <span>หน้า {caseTypePage}</span>{" "}
            <button
              onClick={() =>
                setCaseTypePage((p) =>
                  p < Math.ceil(caseTypes.length / caseTypeRowsPerPage)
                    ? p + 1
                    : p,
                )
              }
              disabled={
                caseTypePage >=
                Math.ceil(caseTypes.length / caseTypeRowsPerPage)
              }
            >
              {" "}
              ถัดไป{" "}
            </button>{" "}
          </div>{" "}
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
            onClose={() => setShowCaseSubtypeListModal(false)}
          />
        )}
      </div>
    </>
  );
}
