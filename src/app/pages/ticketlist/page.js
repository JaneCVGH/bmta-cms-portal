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
} from "@fortawesome/free-solid-svg-icons";

import {
  safeText,
  safeNormalize,
  safeDate,
  sanitizeCase,
} from "@/app/utils/safe";

import { useRouter } from "next/navigation";
import styles from "../../style/ticketlist.module.css";
import Navbar from "../../components/Navbar";

export default function TicketListPage() {
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
          method: "GET",
            credentials: "include",
          headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(token)
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
        }
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
        }
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

  const handleOpenModal = async () => {
      router.push("/pages/form");
  };

  const getCaseTypeTh = (typeId) =>
    caseTypeMap[normalize(typeId)]?.th ?? typeId;

  const getCaseSubTypeTh = (typeId, sTypeId) =>
    caseTypeMap[normalize(typeId)]?.subTypes?.[normalize(sTypeId)] ?? sTypeId;

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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.pagination}>
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
    </>
  );
}
