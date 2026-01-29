// frontend\src\app\pages\ticketlist\page.js

"use client";

import React, { useState, useEffect } from "react";
//import Swal from "sweetalert2";  สำหรับ popup เตือน
import TicketListModal from "../../components/TicketListModal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faSquarePlus,
  faMagnifyingGlass,
  faPenToSquare,
  faCircleCheck,
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

export default function TicketListPage() {
  // const normalize = (v) => String(v).trim().toLowerCase();

  const searchParams = useSearchParams();
  const normalize = (v) => String(v).trim().toLowerCase();
  const router = useRouter();

  const [tickets, setTickets] = useState([]);
  const [totalTickets, setTotalTickets] = useState(0);

  const [showModal, setShowModal] = useState(false);
  // const [modalType, setModalType] = useState("add");
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  const [searchTerm, setSearchTerm] = useState("");
  const [caseTypeMap, setCaseTypeMap] = useState({});

  const [show, setShow] = useState(false);
  const [caseId, setcaseId] = useState("CASE-001");
  const mobileNo = searchParams.get("mobileNo");
  const method = searchParams.get("method");
  // const username = searchParams.get("username");
  const agentName = searchParams.get("agentName");
  const [formFields, setFormFields] = useState(null);
  const [formResponse, setformResponse] = useState(null);
  const [isDefault, setisDefault] = useState(true);
  const [casewithsub, setcasewithsub] = useState(null);
  const [username, setusername] = useState(searchParams.get("username"));
  const [JsonData, setJsonData] = useState({});
  const [Area, setArea] = useState(null);
  const [formSelect, setformSelect] = useState("");
  const [FormBycaseIdRes, setFormBycaseIdRes] = useState(null);
  const [loading, setLoading] = useState(true);

  // const [areaMap, setAreaMap] = useState({
  //   countries: {},
  //   provinces: {},
  //   districts: {},
  // });

  const [areaList, setAreaList] = useState([]);

  useEffect(() => {
    fetchTickets();
    fetchCaseTypes();
    fetchAreas();

    const init = async () => {
      try {
        await fetchTickets();
        await fetchCaseTypes();
        await fetchAreas();

        if (isDefault) {
          await getArea();
          await getDefaultData();
          setisDefault(false);
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [page, searchTerm]);

  const safeJson = async (res) => {
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  //fetchTickets – ดึงข้อมูลคำร้องจาก API
  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const start = (page - 1) * rowsPerPage;

      const params = new URLSearchParams({
        // page: page.toString(),
        // limit: rowsPerPage.toString(),
        start: start.toString(),
        length: rowsPerPage.toString(),
        // search: searchTerm,
      });

      const res = await fetch(
        "https://welcome-service-stg.metthier.ai:65000/api/v1/case?" +
          params.toString(),
        {
          // method: "GET",
          headers: {
            // Accept: "application/json",

            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",

              Authorization: `Bearer ${token}`,
            },
          },
        },
      );

      console.log(token);

      if (!res.ok) {
        console.error("fetchTickets status:", res.status);
        return;
      }

      const data = await safeJson(res);
      console.log("CASE LIST RESPONSE:", data);

      const list = Array.isArray(data?.data) ? data.data : [];
      const total =
        typeof data?.totalRecords === "number"
          ? data.totalRecords
          : typeof data?.recordsTotal === "number"
            ? data.recordsTotal
            : 0;

      setTickets(list.map(sanitizeCase));
      setTotalTickets(total);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
  };

  const fetchCaseTypes = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(
        "https://welcome-service-stg.metthier.ai:65000/api/v1/casetypes_with_subtype",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await safeJson(res);
      if (!result || !Array.isArray(result.data)) {
        return;
      }

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
        map[typeKey].subTypes[subKey] = row.subTypeTh;
      });

      console.log("CASE TYPE MAP (FINAL):", map);
      setCaseTypeMap(map);
    } catch (error) {
      console.error("fetchCaseTypes error:", error);
    }
  };

  const fetchAreas = async () => {
    try {
      // console.log("AREA: start fetching");
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(
        "https://welcome-service-stg.metthier.ai:65000/api/v1/area/country_province_districts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await safeJson(res);
      if (!result || !Array.isArray(result.data)) return;

      console.log("AREA LIST:", result.data);
      // setAreaMap(map);
      setAreaList(result.data);
    } catch (err) {
      console.error("fetchAreas error:", err);
    }
  };

  const handleOpenModal = async (ticket) => {
    // สำหรับ "add" หรือ ticket เป็น null
    // setModalType(type);
    setShowModal(true);
    setSelectedTicket(null);

    if (!ticket) return;

    console.log("FETCH DETAIL CASE:", ticket.caseId);

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/case/${ticket.caseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        setSelectedTicket({
          ...ticket,
          // countryId: ticket.countryId ?? null,
          // provId: ticket.provId ?? null,
          // distId: ticket.distId ?? null,
          _fallback: true,
        });
        return;
      }

      const detail = await res.json();

      // console.log("CASE DETAIL:", detail.data);

      setSelectedTicket({
        ...ticket,
        ...detail.data,
      });
    } catch (err) {
      // console.error("Network or JSON error", err);
      setSelectedTicket({
        error: true,
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      });
    }

    const handleOpenModal = async () => {
      router.push("/pages/form");
    };

    const getCaseTypeTh = (typeId) =>
      caseTypeMap[normalize(typeId)]?.th ?? typeId;

    const getCaseSubTypeTh = (typeId, sTypeId) =>
      caseTypeMap[normalize(typeId)]?.subTypes?.[normalize(sTypeId)] ?? sTypeId;

    const onFormChange = async (e) => {
      var value = e.target.value;
      setformSelect(value);
      setFormFields(null);
      const token = localStorage.getItem("accessToken");
      try {
        console.log("ส่ง request ไปยัง API:");
        const response = await fetch(
          "https://welcome-service-stg.metthier.ai:65000/api/v1/forms/casesubtype",
          // `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // ✅ correct
            },
            body: JSON.stringify({
              caseSubType: value,
            }),
          },
        );

        // console.log("Response status:", response.status);
        const data = await response.json();
        console.log("✅ API Response:", data);
        // console.log("Response data:", data);
        if (response.ok) {
          setformResponse(data.data);
          setFormFields(data.data.formFieldJson);
        }
      } catch (error) {
        console.error("Login error:", error);
      }

      console.log(e.target.value);
    };

    const onDataChange = (property, value) => {
      console.log(property, value);
      const selectedArea = Area.find((item) => item.id === value);

      console.log(selectedArea);
      setJsonData((prev) => ({
        ...prev,
        [property]: value,
      }));
    };

    const getDefaultData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }
      try {
        console.log("API: casetypes_with_subtype");
        const response = await fetch(
          "https://welcome-service-stg.metthier.ai:65000/api/v1/casetypes_with_subtype",
          // `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // ✅ correct
            },
          },
        );

        const data = await response.json();
        console.log("✅ API Response:", data);
        if (response.ok) {
          setcasewithsub(data);
        }
      } catch (error) {
        console.error("Login error:", error);
      }
    };

    const UpdateCase = async () => {
      const token = localStorage.getItem("accessToken");
      if (username != null || username != "") {
        setusername(localStorage.getItem("username"));
      }
      const selectedArea = Area.find((item) => item.id === JsonData.Area);
      Swal.fire({
        html: `<span class="${styles.fontTH}">อัพเดทเหตุ?</span>`,
        // text: "You won't be able to revert this!",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: `<span class="${styles.fontTH}">ยืนยัน</span>`,
        cancelButtonText: `<span class="${styles.fontTH}">ยกเลิก</span>`,
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            let formData = { ...formResponse };
            let json = { ...FormBycaseIdRes };
            ((json.countryId = selectedArea.countryId),
              (json.distId = selectedArea.distId),
              (json.formData = formData),
              (json.provId = selectedArea.provId),
              (json.source = JsonData.method),
              console.log("REQUEST JSON:", json));

            const response = await fetch(
              `https://welcome-service-stg.metthier.ai:65000/api/v1/case/${caseId}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(json),
              },
            );

            const data = await response.json();
            console.log("✅ API Response:", data);

            if (response.ok) {
              Swal.fire({
                title: "Success",
                icon: "success",
                draggable: true,
                timer: 1500,
                showConfirmButton: false,
              });
              setShow(false);
              setFormFields(null);
              setformResponse(null);
              setisDefault(true);
              setJsonData(null);
              // setcasewithsub(null)
              // setArea(null)
              setformSelect(null);
            }
          } catch (error) {
            console.error("API error:", error);
          }
        }
      });
    };

    const getFormBycaseId = async (caseId) => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }
      try {
        console.log("API: getFormBycaseId");
        const response = await fetch(
          `https://welcome-service-stg.metthier.ai:65000/api/v1/dispatch/${caseId}/SOP`,
          // `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();
        console.log("✅ API Response:", data);
        if (response.ok) {
          setFormFields(data.data.formAnswer.formFieldJson);
          setFormBycaseIdRes(data.data);
          const selectedArea = Area.find(
            (item) =>
              item.countryId === data.data.countryId &&
              item.distId === data.data.distId &&
              item.provId === data.data.provId,
          );
          setJsonData({
            Area: selectedArea.id,
            method: data.data.source,
          });
          setformSelect(data.data.caseSTypeId);
        }
      } catch (error) {
        console.error("Login error:", error);
      }
    };

    const getArea = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }
      try {
        console.log("API: GetArea");
        const response = await fetch(
          "https://welcome-service-stg.metthier.ai:65000/api/v1/area/country_province_districts",
          // `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();
        console.log("✅ API Response:", data);
        if (response.ok) {
          setArea(data.data);
        }
      } catch (error) {
        console.error("Login error:", error);
      }
    };

    const handleClose = () => {
      setShow(false);
      setcaseId(null);
    };

    const handleShow = async (caseId) => {
      setcaseId(caseId);
      setformSelect(caseId);
      await getFormBycaseId(caseId);
      setShow(true);
    };

    // if (isDefault) return null;

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
                    <FontAwesomeIcon
                      icon={faMagnifyingGlass}
                      className={styles.searchIcon}
                    />
                    <input
                      type="text"
                      placeholder="|ค้นหา รหัส / ชื่อ / นามสกุล"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                      }}
                      className={styles.searchInput}
                    />
                  </div>
                </form>
              </div>

              <div className={styles.edit}>
                <button
                  className={styles.btnAdd}
                  onClick={() => handleOpenModal("add")}
                >
                  <FontAwesomeIcon icon={faSquarePlus} /> เพิ่มคำร้องใหม่
                </button>
              </div>
            </div>

            <table className={styles.tableTicketList}>
              <thead className={styles.TicketListThead}>
                <tr>
                  <th className={styles.th}>รหัสคำร้อง</th>
                  <th className={styles.th}>หัวข้อ</th>
                  <th className={styles.th}>รายละเอียดคำร้อง</th>
                  <th className={styles.th}>สถานะ</th>
                  <th className={styles.th}>วันที่ส่งคำร้อง</th>
                  <th className={styles.th}>วันที่สิ้นสุดคำร้อง</th>
                  <th className={styles.th}>ดูเพิ่มเติม</th>
                </tr>
              </thead>

              <tbody>
                {tickets.map((ticket, index) => (
                  <tr key={index} className={styles.trTicketList}>
                    <td>{ticket.caseId}</td>
                    <td>{getCaseTypeTh(ticket.caseTypeId)}</td>
                    <td>
                      {getCaseSubTypeTh(ticket.caseTypeId, ticket.caseSTypeId)}
                    </td>
                    <td>{ticket.statusId}</td>
                    <td>{safeDate(ticket.startedDate)}</td>
                    <td>{safeDate(ticket.createdAt)}</td>
                    {/* <td>{formatArea(areaMap.provinces, ticket.provId)}</td> */}

                    <td>
                      <button
                        className={styles.viewBtn}
                        onClick={() => handleOpenModal(ticket)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>

                      <button
                        className={styles.viewBtn}
                        onClick={() => handleShow(ticket.caseId)}
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </button>

                      {/* <button
                      className={styles.viewBtn}
                      onClick={() => handleShow(ticket.caseId)}
                    >
                      <FontAwesomeIcon icon={faCircleCheck} />
                    </button> */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.setPage}>
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                กลับ
              </button>
              <span> หน้า {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(totalTickets / rowsPerPage)}
              >
                ถัดไป
              </button>
            </div>
          </div>
        </div>

        {/* Modal แยกไฟล์ */}
        {showModal &&
          // Object.keys(areaMap.countries).length > 0 && (
          areaList.length > 0 && (
            <TicketListModal
              // type={modalType}
              show={showModal}
              onClose={() => setShowModal(false)}
              ticketData={selectedTicket}
              areaList={areaList}
              getCaseTypeTh={getCaseTypeTh}
              getCaseSubTypeTh={getCaseSubTypeTh}
            />
          )}

        {formFields != null && (
          <ModalForm
            formFieldJson={formFields}
            setFormFields={setFormFields}
            handleClose={handleClose}
            show={show}
            caseId={caseId}
            UpdateCase={UpdateCase}
            casewithsub={casewithsub}
            formSelect={formSelect}
            onFormChange={onFormChange}
            onDataChange={onDataChange}
            JsonData={JsonData}
            Area={Area}
            update={true}
          />
        )}
      </>
    );
  };
}
