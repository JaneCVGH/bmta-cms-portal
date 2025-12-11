//pages/Employee/page
"use client";

//ใช้ useEffect() เพื่อรันโค้ดเมื่อ component ถูกโหลด
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid"; // ใช้สำหรับสร้าง UUID
import Swal from "sweetalert2"; // สำหรับ popup เตือน
import EmployeeModal from "../../components/EmployeeModal";

// useRouter ใช้สำหรับนำทางไปยังหน้าอื่น, next/navigation คือเวอร์ชันใหม่ที่ใช้ใน App Router
// import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faEye,
  faTrash,
  faSquarePlus,
  faUserTie,
  faImage,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

import styles from "../../style/employee.module.css";
import Navbar from "../../components/Navbar";

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    position: "",
    department: "",
    email: "",
    phone: "",
    username: "",
  });

  // เรียก API FastAPI
  //     .then((res) => res.json())
  //     .then((data) => setEmployees(data))
  //     .catch((err) => console.error(err));
  // }, []);

  const [page, setPage] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const rowsPerPage = 8;
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEmployees();
    fetchEmployeeCount();
  }, [page]);

  //fetchEmployees – ดึงข้อมูลพนักงานจาก API
  const fetchEmployees = async () => {
    try {
      //const skip = (page - 1) * rowsPerPage;

      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("No access token found");
        return;
      }
      //const start = (currentPage - 1) * rowsPerPage;
      const start = (page - 1) * rowsPerPage;

      const res = await fetch(
        `https://welcome-service-stg.metthier.ai:65000/api/v1/users?start=${start}&length=${rowsPerPage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      console.log("User List:", data);

      setEmployees(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("Error fetching user list:", err);
    }
  };

  const handleSearch = async (query) => {
    if (!query) {
      fetchEmployees(); // หากว่าง ให้โหลดพนักงานทั้งหมด
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/employee/search?query=${query}`
      );
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  //const fetchEmployeeCount = async () => {
  //  try {

  //      const res = await fetch(
  //          https://welcome-service-stg.metthier.ai:65000/api/v1/users?start=0&length=1
  //      );
  //      const data = await res.json();
  //      setTotalEmployees(data.recordsTotal || 0);
  //  } catch (err) {
  //      console.error("Error fetching user count:", err);
  //  }
  //};

  const fetchEmployeeCount = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `https://welcome-service-stg.metthier.ai:65000/api/v1/users?start=0&length=1`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setTotalEmployees(data.recordsTotal || 0);
    } catch (err) {
      console.error("Error fetching user count:", err);
    }
  };

  //handleChange – เมื่อพิมพ์ใน input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //generateUniqueId – สร้างรหัสพนักงานแบบ A12345
  const generateUniqueId = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    const randomNumbers = Math.floor(10000 + Math.random() * 90000); // 5 หลักแน่นอน
    return `${randomLetter}${randomNumbers}`;
  };

  //handleOpenModal – เปิด modal พร้อมเซ็ตค่า
  const handleOpenModal = (type, emp = null) => {
    console.log("เปิด modal สำหรับ:", emp);
    setModalType(type);
    setSelectedEmployee(emp);
    setFormData({
      id: emp?.id || generateUniqueId(),
      firstName: emp?.firstName || "",
      lastName: emp?.lastName || "",
      position: emp?.position || "",
      department: emp?.department || "",
      email: emp?.email || "",
      phone: emp?.phone || "",
      username: emp?.username || "",
    });
    setShowModal(true);
  };

  //handleSubmit – บันทึกข้อมูล (เพิ่มหรือแก้ไข)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("No access token found");
      return;
    }

    let url = "";
    let method = "";

    if (modalType === "edit") {
      // ใช้ External API
      url = `https://welcome-service-stg.metthier.ai:65000/api/v1/users/${formData.id}`;
      method = "PUT";
    } else {
      // ใช้ FastAPI ของคุณ (MongoDB เดิม)
      url = `${process.env.NEXT_PUBLIC_API_URL}/employee`;
      method = "POST";
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        fetchEmployees();
        Swal.fire({
          icon: "success",
          title: "สำเร็จ!",
          text:
            modalType === "edit" ? "แก้ไขข้อมูลสำเร็จ" : "เพิ่มข้อมูลสำเร็จ",
        });
      } else {
        const errorText = await res.text();
        console.error("API Error:", errorText);
      }
    } catch (err) {
      console.error("Error submitting employee:", err);
    }
  };

  /*อาจจะไม่มี function */
  //   const generateUserId = () => {
  //   const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
  //   const numbers = Math.floor(10000 + Math.random() * 90000); // 5 digits
  //   return `${letter}${numbers}`;
  // };

  //handleDelete – ลบพนักงานด้วย SweetAlert ยืนยัน
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "การลบข้อมูลนี้จะไม่สามารถย้อนกลับได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#A9A9A9",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/employee/${id}`,
          {
            method: "DELETE",
          }
        );
        if (res.ok) {
          fetchEmployees();
          Swal.fire("ลบแล้ว!", "ข้อมูลถูกลบเรียบร้อยแล้ว", "success");
        }
      } catch (err) {
        console.error("ลบข้อมูลพนักงานไม่สำเร็จ:", err);
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h2 className={styles.title}>รายชื่อพนักงาน</h2>

        {/* searchBox */}
        <div className={styles.topBar}>
          <div className={styles.searchEmployee}>
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
                    handleSearch(e.target.value);
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
              <FontAwesomeIcon icon={faSquarePlus} /> เพิ่มพนักงานใหม่
            </button>
          </div>
        </div>

        {/* ตารางแสดงพนักงาน */}
        <table className={styles.tableEmployee}>
          <thead className={styles.EmployeeThead}>
            <tr>
              <th className={styles.th}>รหัสพนักงาน</th>
              <th className={styles.th}>ชื่อ</th>
              <th className={styles.th}>นามสกุล</th>
              <th className={styles.th}>ตำแหน่ง</th>
              <th className={styles.th}>แผนก</th>
              {/* <th className={styles.th}>อีเมล</th>
                  <th className={styles.th}>บทบาท</th> */}
              <th className={styles.th}>เครื่องมือ</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className={styles.tr}>
                <td className={styles.td}>{emp.id}</td>
                <td className={styles.td}>{emp.firstName}</td>
                <td className={styles.td}>{emp.lastName}</td>
                <td className={styles.td}>{emp.position}</td>
                <td className={styles.td}>{emp.department}</td>

                <td>
                  {/* ปุ่มดู/ แก้ไข/ ลบ */}
                  <button
                    className={styles.viewBtn}
                    onClick={() => handleOpenModal("view", emp)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleOpenModal("edit", emp)}
                  >
                    <FontAwesomeIcon icon={faPencil} />
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(emp.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
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
            disabled={page >= Math.ceil(totalEmployees / rowsPerPage)}
          >
            ถัดไป
          </button>
        </div>
      </div>
      {/* Modal แยกไฟล์ */}
      {showModal && formData && (
        <EmployeeModal
          show={showModal}
          type={modalType}
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

// useEffec
