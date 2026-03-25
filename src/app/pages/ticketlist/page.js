//src\app\pages\ticketlist\page.js

"use client";

import React, { useState, useEffect, useRef } from "react";
// import Swal from "sweetalert2";
import TicketListModal from "../../components/TicketListModal";
import ModalForm from "../form/formEditModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faPencil,
  faSquarePlus,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

import {
  safeText,
  safeNormalize,
  safeDate,
  sanitizeCase,
} from "@/app/utils/safe";

import { useRouter, useSearchParams } from "next/navigation";
import styles from "../../style/ticketlist.module.css";
import Navbar from "../../components/Navbar";

import {
  getPriorityTh,
  requireSession,
  handleApiError,
  fireSwal,
  showSuccessSwal,
  showWarningSwal,
  showQuestionSwal,
} from "@/app/lib/ErrorSwal";

import { apiFetch, BASE_URL } from "@/app/lib/apiClient";

export default function TicketListPage() {
  const searchParams = useSearchParams();
  const normalize = (v) => String(v).trim().toLowerCase();
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [totalTickets, setTotalTickets] = useState(0);

  const [showModal, setShowModal] = useState(false);
  // const [modalType, setModalType] = useState("add");
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [page, setPage] = useState(1);

  // จำนวน ticketlist ต่อ 1 หน้า
  const rowsPerPage = 10;
  // จำนวน ticketlist ทั้งหมด
  const totalPages = Math.ceil(totalTickets / rowsPerPage);

  const [caseTypeMap, setCaseTypeMap] = useState({});
  const [show, setShow] = useState(false);
  const [caseId, setcaseId] = useState(null);
  const mobileNo = searchParams.get("mobileNo");
  const method = searchParams.get("method");
  const agentName = searchParams.get("agentName");

  const [formState, setFormState] = useState({
    fields: null,
    response: null,
    caseData: null,
    jsonData: {},
    formSelect: "",
  });

  const [isDefault, setisDefault] = useState(true);
  const [casewithsub, setcasewithsub] = useState(null);
  const [username, setusername] = useState(searchParams.get("username"));

  const latestCaseIdRef = useRef(null);
  const [areaList, setAreaList] = useState([]);
  const [statusMap, setStatusMap] = useState({});

  const [viewMode, setViewMode] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);

  // ค้นหา หมายเลขใบสั่งงาน, สถานะ
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    fetchCaseTypes();
    fetchStatus();
    fetchAreas();
    getDefaultData();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [page, selectedStatus, searchTerm]);

  useEffect(() => {
    if (!requireSession()) return;
  }, []);

  //สถานะ
  const getStatusTh = (statusId) => {
    return statusMap[statusId] || statusId;
  };

  //สถานะ
  const getStatusClass = (statusId) => {
    const map = {
      S000: styles.statusDraft,
      S001: styles.statusNew,
      S003: styles.statusDispatch,
      S004: styles.statusAck,
      S015: styles.statusProgress,
      S016: styles.statusDone,
      S007: styles.statusClosed,
      S014: styles.statusCancel,
    };

    return map[statusId] || styles.statusDefault;
  };

  const fetchStatus = async () => {
    try {
      const data = await apiFetch(`${BASE_URL}/case_status?start=0&length=100`);

      if (!data || !Array.isArray(data.data)) return;
      const map = {};
      data.data.forEach((row) => {
        map[row.statusId] = row.th;
      });

      console.log("STATUS MAP:", map);

      setStatusMap(map);
    } catch (error) {
      handleApiError(error, "โหลดสถานะไม่สำเร็จ");
    }
  };

  const getPriorityClass = (priority) => {
    const p = Number(priority);

    if (p === 0) return styles.priorityCritical;
    if (p >= 1 && p <= 3) return styles.priorityHigh;
    if (p >= 4 && p <= 6) return styles.priorityMedium;
    if (p >= 7 && p <= 9) return styles.priorityLow;

    return "";
  };

  //fetchTickets – ดึงข้อมูลคำร้องจาก API
  const fetchTickets = async () => {
    if (!requireSession()) return;

    try {
      console.log(" FETCH TICKETS...");
      const start = (page - 1) * rowsPerPage;

      // const params = new URLSearchParams({
      //   start: start.toString(),
      //   length: rowsPerPage.toString(),
      // });

      const params = new URLSearchParams({
        start: start.toString(),
        length: rowsPerPage.toString(),
        ...(selectedStatus && { statusId: selectedStatus }),
        ...(searchTerm && { keyword: searchTerm }),
      });

      console.log("SEARCH TERM:", searchTerm);
      console.log("PARAMS:", params.toString());

      const data = await apiFetch(`${BASE_URL}/case?${params.toString()}`);

      const list = Array.isArray(data?.data) ? data.data : [];

      // จำนวนรายการ ticketlist ทั้งหมด
      const total =
        typeof data?.totalFiltered === "number"
          ? data.totalFiltered
          : typeof data?.totalRecords === "number"
            ? data.totalRecords
            : 0;

      setTickets(list.map(sanitizeCase));
      setTotalTickets(total);
    } catch (err) {
      handleApiError(err, "โหลดรายการคำร้องไม่สำเร็จ");
    }
  };

  const fetchCaseTypes = async () => {
    try {
      const result = await apiFetch(`${BASE_URL}/casetypes_with_subtype`);
      if (!Array.isArray(result?.data)) return;

      // แปลงข้อมูลเป็น map
      const map = {};
      result.data.forEach((row) => {
        const typeKey = normalize(row.typeId);
        const subKey = normalize(row.sTypeId);

        // สร้าง caseType
        if (!map[typeKey]) {
          map[typeKey] = {
            th: row.th,
            subTypes: {},
          };
        }

        // ใส่ subtype
        map[typeKey].subTypes[subKey] = {
          code: row.sTypeCode,
          name: row.subTypeTh, //  row.subTypeTh;
        };
      });

      console.log("CASE TYPE MAP (FINAL):", map);
      setCaseTypeMap(map);
    } catch (error) {
      handleApiError(error, "โหลดประเภทคำร้องไม่สำเร็จ");
    }
  };

  const fetchAreas = async () => {
    try {
      const result = await apiFetch(
        `${BASE_URL}/area/country_province_districts`,
      );
      if (!result || !Array.isArray(result.data)) return;

      console.log("AREA LIST:", result.data);
      // setAreaMap(map);
      setAreaList(result.data);
    } catch (err) {
      handleApiError(err, "โหลดพื้นที่ไม่สำเร็จ");
    }
  };

  const handleOpenModal = async () => {
    router.push("/pages/form");
  };

  const getCaseTypeTh = (typeId) => {
    return caseTypeMap[normalize(typeId)]?.th ?? typeId;
  };

  // sTypeCode และ casetype ในคอลัมน์ หัวข้อ
  const getCaseTypeWithCode = (typeId, sTypeId) => {
    const type = caseTypeMap[normalize(typeId)];
    const sub = type?.subTypes?.[normalize(sTypeId)];

    if (!type) return typeId;

    return sub ? `${sub.code} - ${type.th}` : type.th;
  };

  const getCaseSubTypeTh = (typeId, sTypeId) => {
    const sub = caseTypeMap[normalize(typeId)]?.subTypes?.[normalize(sTypeId)];
    return sub?.name || "-"; // return `${sub.name}`;
  };

  const getCaseDetail = (ticket) => {
    const fields = ticket?.formData?.formFieldJson;

    if (!Array.isArray(fields)) return "-";

    const detailField = fields.find(
      (f) => f.label?.includes("รายละเอียด") || f.label?.includes("ทักษะ"),
    );

    return detailField?.value || "-";
  };

  const onFormChange = async (e) => {
    const value = e.target.value;
    console.log("caseSubType ที่ส่ง:", value);

    if (!value || value === "เลือกประเภทคำร้อง") {
      setFormState((prev) => ({
        ...prev,
        formSelect: "",
        fields: [],
        response: null,
      }));
      return;
    }

    setFormState((prev) => ({
      ...prev,
      formSelect: value,
      fields: [],
      response: null,
    }));

    try {
      const data = await apiFetch(`${BASE_URL}/forms/casesubtype`, {
        method: "POST",
        body: JSON.stringify({
          caseSubType: value,
        }),
      });

      setFormState((prev) => ({
        ...prev,
        fields: Array.isArray(data?.data?.formFieldJson)
          ? data.data.formFieldJson
          : [],
        response: data.data,
      }));
    } catch (error) {
      handleApiError(error, "โหลดข้อมูลไม่สำเร็จ");
    }
  };

  const onDataChange = (property, value) => {
    console.log(property, value);

    setFormState((prev) => ({
      ...prev,
      jsonData: {
        ...prev.jsonData,
        [property]: value,
      },
    }));
  };

  const getDefaultData = async () => {
    try {
      console.log("API: casetypes_with_subtype");

      const data = await apiFetch(`${BASE_URL}/casetypes_with_subtype`);
      setcasewithsub(data);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  //ถ้า value = placeholder → ให้ถือว่า “ยังไม่ได้เลือก”
  const isInvalidSelect = (value, placeholderList = []) => {
    if (!value) return true;

    const v = String(value).trim();
    return placeholderList.includes(v);
  };

  //  ตรวจสอบ การกรอกแบบฟอร์ม Updatecase และ CreateCase
  const validateForm = () => {
    let errors = [];
    // เช็คว่า "ไม่กรอกอะไรเลย"

    const { formSelect, jsonData, fields } = formState;

    const isTypeEmpty = isInvalidSelect(formSelect, ["", "เลือกประเภทคำร้อง"]);
    const isMethodEmpty = isInvalidSelect(jsonData.method, [
      "",
      "เลือกแจ้งช่องทาง",
    ]);
    const isAreaEmpty = isInvalidSelect(jsonData.Area, [
      "",
      "เลือกพื้นที่รับผิดชอบ",
    ]);

    const isEmpty = (v) => !v || String(v).trim() === "";

    if ([formSelect, jsonData.method, jsonData.Area].every(isEmpty)) {
      // -------CASE 1: ไม่กรอกอะไรเลย-------
      showWarningSwal(
        "กรอกข้อมูลไม่ครบ",
        "กรุณาเลือก ประเภทคำร้อง / ช่องทาง / พื้นที่",
      );
      return false;
    }

    // -------CASE 2: ไม่กรอก ประเภทคำร้อง-------
    if (isTypeEmpty) {
      showWarningSwal("กรุณาเลือกประเภทคำร้อง");
      return false;
    }

    // -------CASE 3: ไม่กรอก แจ้งช่องทาง-------
    if (isMethodEmpty) {
      showWarningSwal("กรุณาเลือกแจ้งช่องทาง");
      return false;
    }

    // -------CASE 4: ไม่กรอก พื้นที่รับผิดชอบ-------
    if (isAreaEmpty) {
      showWarningSwal("กรุณาเลือกพื้นที่");
      return false;
    }

    if (Array.isArray(fields)) {
      fields.forEach((field) => {
        if (field.required && !String(field.value || "").trim()) {
          errors.push(field.label);
        }

        if (field.type === "InputGroup") {
          field.value?.forEach((child) => {
            if (child.required && !String(child.value || "").trim()) {
              errors.push(child.label);
            }
          });
        }
      });
    }

    if (errors.length > 0) {
      fireSwal({
        icon: "warning",
        title: "กรอกข้อมูลไม่ครบ",
        html: `กรุณากรอก:<br>${errors.join("<br>")}`,
      });
      return false;
    }

    return true;
  };

  // ------- สร้างคำร้อง CreateCase --------
  const CreateCase = async () => {
    if (!validateForm()) return;
    const { formSelect, jsonData, fields, response } = formState;

    const username = localStorage.getItem("username");
    // const selectedArea = areaList?.find((item) => item.id === JsonData.Area);
    const selectedArea = areaList?.find((item) => item.id === jsonData.Area);

    if (!selectedArea) {
      showWarningSwal("กรุณาเลือกพื้นที่");
      return;
    }

    const result = await showQuestionSwal({
      title: "เปิดเหตุ?",
    });

    if (!result.isConfirmed) return;
    try {
      let formData = { ...(response || {}) };
      formData.formFieldJson = fields;

      const item = casewithsub?.data?.find((c) => c.sTypeId === formSelect);
      console.log("formSelect:", formSelect);
      console.log("matched item:", item);

      const json = {
        arrivedDate: null,
        assignUser: "",
        attachments: [],
        caseDetail: "",
        caseDuration: 0,
        caseId: "",
        caseLat: "",
        caseLocAddr: "",
        caseLocAddrDecs: "",
        caseLon: "",
        caseSTypeId: formSelect, //caseSTypeId: null,
        caseTypeId: item?.typeId, //caseTypeId: formSelect,
        caseVersion: "publish",
        closedDate: null,
        commandedDate: null,
        countryId: selectedArea.countryId,
        createdDate: new Date().toISOString(),
        deviceId: "",
        distId: selectedArea.distId,
        extReceive: "",
        formData: formData,
        nodeId: formData.nextNodeId,
        phoneNo: "",
        phoneNoHide: true,
        priority: 0,
        provId: selectedArea.provId,
        receivedDate: null,
        referCaseId: "",
        resDetail: "",
        resId: null,
        scheduleDate: null,
        scheduleFlag: false,
        source: jsonData.method || "1", // source: JsonData.method || "1",
        startedDate: new Date().toISOString(),
        statusId: "S001",
        userarrive: "",
        userclose: "",
        usercommand: "",
        usercreate: username,
        userreceive: "",
        versions: formData.versions,
        wfId: formData.wfId,
      };

      console.log("REQUEST JSON:", json);

      const data = await apiFetch(`${BASE_URL}/case/add`, {
        method: "POST",
        body: JSON.stringify(json),
      });

      console.log("✅ API Response:", data);

      showSuccessSwal("บันทึกคำร้องสำเร็จ");

      fetchTickets();
      setShow(false);
    } catch (error) {
      handleApiError(error, "สร้างคำร้องไม่สำเร็จ");
    }
  };

  //-----แก้ไข คำร้อง-----
  const UpdateCase = async () => {
    if (!validateForm()) return;
    const { jsonData, fields, response, caseData } = formState;

    const selectedArea = areaList.find((item) => item.id === jsonData.Area);

    if (!selectedArea) {
      showWarningSwal("กรุณาเลือกพื้นที่");
      return;
    }

    const result = await showQuestionSwal({
      title: "อัพเดทเหตุ?",
    });

    if (!result.isConfirmed) return;

    try {
      const json = structuredClone(caseData);

      const formData = {
        ...response,
        formFieldJson: fields,
      };

      console.log("response:", response);
      console.log("caseData:", caseData);
      console.log("fields:", fields);

      // update fields
      json.countryId = selectedArea?.countryId || "";
      json.provId = selectedArea?.provId || "";
      json.distId = selectedArea?.distId || "";
      // json.source = JsonData?.method || "1";
      json.source = jsonData?.method || "1";

      // ใส่ formData ที่แก้แล้ว
      json.formData = formData;

      console.log("formFields before send:", fields);
      console.log("REQUEST JSON:", json);

      const data = await apiFetch(`${BASE_URL}/case/${caseId}`, {
        method: "PATCH",
        body: JSON.stringify(json),
      });

      console.log("✅ UPDATE RESPONSE:", data);

      showSuccessSwal("บันทึกสำเร็จ");

      fetchTickets();
      setShow(false);
    } catch (error) {
      handleApiError(error, "อัปเดตคำร้องไม่สำเร็จ");
    }
  };

  // update status ของ ปุ่ม "ส่งออก" และ "ไม่อนุมัติ"
  const updateStatus = async (caseId, newStatusId) => {
    const { caseData } = formState;
    if (!caseData) return;

    try {
      const src = caseData; // const src = FormBycaseIdRes;

      console.log("nodeId:", src.currentStage?.nodeId);
      console.log("currentStage:", src.currentStage);

      const json = {
        id: src.id,
        caseId: src.caseId,
        caseTypeId: src.caseTypeId,
        caseSTypeId: src.caseSTypeId,

        statusId: newStatusId, // เปลี่ยน status

        countryId: src.countryId,
        provId: src.provId,
        distId: src.distId,

        formData: src.formData || src.formAnswer,

        nodeId: src.currentStage?.nodeId,
        versions: src.versions,
        wfId: src.wfId,

        source: src.source || "1",

        updatedBy: localStorage.getItem("username"),
      };

      console.log("UPDATE STATUS:", json);

      const data = await apiFetch(`${BASE_URL}/case/${caseId}`, {
        method: "PATCH",
        body: JSON.stringify(json),
      });

      showSuccessSwal("อัปเดตสถานะสำเร็จ");

      fetchTickets();
      setShow(false);
    } catch (err) {
      handleApiError(err, "อัปเดตสถานะไม่สำเร็จ");
    }
  };

  //-----veie แสดง แบบฟอร์มคำร้อง-----
  const getFormBycaseId = async (caseId) => {
    latestCaseIdRef.current = caseId;

    try {
      console.log("API: getFormBycaseId");

      const data = await apiFetch(`${BASE_URL}/dispatch/${caseId}/SOP`);
      console.log("✅ API Response:", data);
      if (!data) {
        console.log("ไม่มี form สำหรับ case นี้");
        return;
      }
      // กัน response เก่าทับของใหม่
      if (latestCaseIdRef.current !== caseId) {
        console.log("SKIP OLD RESPONSE:", caseId);
        return;
      }

      // กัน data ว่าง
      const formData = data.data?.formData || data.data?.formAnswer || {};

      // const selectedArea = Area?.find(
      const selectedArea = areaList.find(
        (item) =>
          String(item.countryId) === String(data.data.countryId) &&
          String(item.provId) === String(data.data.provId) &&
          String(item.distId) === String(data.data.distId),
      );

      setFormState((prev) => ({
        ...prev,
        response: formData,
        fields: Array.isArray(formData.formFieldJson)
          ? formData.formFieldJson
          : [],
        caseData: data.data,
        jsonData: {
          Area: selectedArea?.id || "",
          method: String(data.data.source || "1"),
        },
        formSelect: data.data.caseSTypeId,
      }));
    } catch (error) {
      console.error("getFormBycaseId error:", error);
    }
  };

  const handleClose = () => {
    setShow(false);
    setcaseId(null);
    setViewMode(false);
    setIsCreateMode(false);
  };

  const handleShow = async (caseId) => {
    console.log("OPEN CASE:", caseId);

    // ✅ reset state ก่อน
    setFormState({
      fields: null,
      response: null,
      caseData: null,
      jsonData: {},
      formSelect: "",
    });

    setcaseId(caseId);

    if (areaList.length === 0) {
      await fetchAreas();
    }

    if (!casewithsub) {
      await getDefaultData();
    }

    setShow(true);
    await getFormBycaseId(caseId);
  };

  const filteredTickets = searchTerm
    ? tickets.filter((t) =>
        t.caseId?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : tickets;

  return (
    <>
      <Navbar />
      <div className={styles.TicketListPage}>
        <div className={styles.container}>
          <h2 className={styles.title}>รายการคำร้องขอ</h2>

          {/* searchBox */}
          <div className={styles.topBar}>
            <div className={styles.searchTicketList}>
              <form className={styles.formSearch}>
                <div className={styles.searchBox}>
                  {/* input + icon */}
                  <div className={styles.SearchBoxInpt}>
                    <FontAwesomeIcon
                      icon={faMagnifyingGlass}
                      className={styles.searchIcon}
                    />

                    <input
                      type="text"
                      placeholder="|ค้นหา หมายเลขใบสั่งงาน"
                      value={searchTerm}
                      onChange={(e) => {
                        setPage(1);
                        setSearchTerm(e.target.value.trim());
                      }}
                      className={styles.searchInput}
                    />
                  </div>

                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setPage(1);
                    }}
                    className={styles.searchSelect}
                  >
                    <option value="">ทุกสถานะ</option>

                    {Object.entries(statusMap).map(([statusId, statusName]) => (
                      <option key={statusId} value={statusId}>
                        {statusName}
                      </option>
                    ))}
                  </select>
                </div>
              </form>
            </div>

            {/*------ปุ่มสร้างคำร้อง------*/}
            <div className={styles.AddTicket}>
              <button
                className={styles.AddBtnTicket}
                onClick={async () => {
                  setViewMode(false);
                  setIsCreateMode(true);

                  // reset state (สำคัญมาก)
                  setFormState({
                    fields: null,
                    response: null,
                    caseData: null,
                    jsonData: {},
                    formSelect: "",
                  });

                  if (areaList.length === 0) {
                    await fetchAreas();
                  }

                  if (!casewithsub) {
                    await getDefaultData();
                  }
                  setShow(true);
                }}
              >
                <FontAwesomeIcon icon={faSquarePlus} /> สร้างคำร้อง
              </button>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.tableTicketList}>
              {/*------หัวข้อ column------*/}
              <thead className={styles.TicketListThead}>
                <tr>
                  <th className={styles.th}>หมายเลขใบสั่งงาน</th>
                  <th className={styles.th}>หัวข้อ</th>
                  <th className={styles.th}>รายละเอียด</th>
                  <th className={styles.th}>สถานะ</th>
                  <th className={styles.th}>ความสำคัญ</th>
                  <th className={styles.th}>สร้างโดย</th>
                  <th className={styles.th}>วันที่สร้าง</th>
                  <th className={styles.th}>การดำเนินการ</th>
                </tr>
              </thead>

              <tbody>
                {/* {tickets.map((ticket, index) => (*/}
                {filteredTickets.map((ticket, index) => (
                  <tr key={index} className={styles.trTicketList}>
                    <td>{ticket.caseId}</td>

                    <td>
                      {getCaseTypeWithCode(
                        ticket.caseTypeId,
                        ticket.caseSTypeId,
                      )}
                    </td>

                    <td>
                      {getCaseDetail(ticket) !== "-"
                        ? getCaseDetail(ticket)
                        : getCaseSubTypeTh(
                            ticket.caseTypeId,
                            ticket.caseSTypeId,
                          )}
                    </td>

                    <td>
                      <span
                        className={`${styles.statusBadge} ${getStatusClass(ticket.statusId)}`}
                      >
                        {getStatusTh(ticket.statusId)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`${styles.priorityBadge} ${getPriorityClass(
                          ticket.priority,
                        )}`}
                      >
                        {getPriorityTh(ticket.priority)}
                      </span>
                    </td>
                    <td>{ticket.createdBy}</td>
                    <td>{safeDate(ticket.createdAt)}</td>

                    {/*------ปุ่ม ดู และ แก้ไข คำร้อง------*/}
                    <td>
                      <button
                        className={styles.ViewBtnTicket}
                        onClick={() => {
                          setViewMode(true);
                          setIsCreateMode(false);
                          handleShow(ticket.caseId);
                        }}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>

                      <button
                        className={styles.EditBtnTicket}
                        onClick={() => {
                          setViewMode(false);
                          setIsCreateMode(false);
                          handleShow(ticket.caseId);
                        }}
                      >
                        <FontAwesomeIcon icon={faPencil} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.PageBackground}>
            <div className={styles.setPage}>
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                กลับ
              </button>

              <span className={styles.PageText}>
                หน้าที่ {page}/{totalPages}
              </span>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(totalTickets / rowsPerPage)}
              >
                ถัดไป
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal แยกไฟล์ */}
      {showModal && areaList.length > 0 && (
        <TicketListModal
          show={showModal}
          onClose={() => setShowModal(false)}
          ticketData={selectedTicket}
          areaList={areaList}
          getCaseTypeTh={getCaseTypeTh}
          getCaseSubTypeTh={getCaseSubTypeTh}
        />
      )}

      {show && (
        <ModalForm
          formFieldJson={formState.fields}
          formSelect={formState.formSelect}
          JsonData={formState.jsonData}
          handleClose={handleClose}
          show={show}
          caseId={caseId}
          UpdateCase={UpdateCase}
          casewithsub={casewithsub}
          onFormChange={onFormChange}
          onDataChange={onDataChange}
          Area={areaList} // Area={Area}
          update={true}
          viewMode={viewMode}
          CreateCase={CreateCase}
          isCreateMode={isCreateMode}
          updateStatus={updateStatus}
          statusId={formState.caseData?.statusId}
          // statusId={FormBycaseIdRes?.statusId}

          setFormFields={(updater) =>
            setFormState((prev) => ({
              ...prev,
              fields:
                typeof updater === "function" ? updater(prev.fields) : updater,
            }))
          }
        />
      )}
    </>
  );
}
