//pages/Employee/page
"use client"

//ใช้ useEffect() เพื่อรันโค้ดเมื่อ component ถูกโหลด
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid'; // ใช้สำหรับสร้าง UUID
import Swal from 'sweetalert2'; // สำหรับ popup เตือน
import EmployeeModal from '../../components/EmployeeModal';

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
    faMagnifyingGlass
} from "@fortawesome/free-solid-svg-icons";

import styles from "../../style/employee.module.css"
import Navbar from "../../components/Navbar";

export default function EmployeePage() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    empId: '',
  firstName: null,
  lastName: null,
  username: '',
  password: '',
  email: null,
  mobileNo: null,
  address: null,
  deptId: null,
  roleId: null,

  commId: null,
  stnId: null,

  active: true

  });

 
// เรียก API FastAPI
//     .then((res) => res.json())
//     .then((data) => setEmployees(data))
//     .catch((err) => console.error(err));
// }, []);

  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const rowsPerPage = 8;
  const [searchTerm, setSearchTerm] = useState('');

 useEffect(() => {
          fetchUsers();
          fetchUserCount();
        }, [page]); 

//fetchUsers – ดึงข้อมูลพนักงานจาก API
 const fetchUsers = async () => {
    try {
      //const skip = (page - 1) * rowsPerPage;

      const token = localStorage.getItem("accessToken"); 
    if (!token) { console.error("No access token found");
      return;
    }
      //const start = (currentPage - 1) * rowsPerPage;
      const start = (page - 1) * rowsPerPage;

      const res = await fetch(`https://welcome-service-stg.metthier.ai:65000/api/v1/users?start=${start}&length=${rowsPerPage}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      }
    );
      
      const data = await res.json();
      console.log("User List:", data);

      setUsers(
        Array.isArray(data.data)
          ? data.data.map(u => ({
              ...u,
              id: u.user_id ?? u.id
            }))
          : []
      );    
      } catch (err) {
        console.error("Error fetching user list:", err);
    }
};

  const handleSearch = async (query) => {
    if (!query) {
      fetchUsers(); // หากว่าง ให้โหลดพนักงานทั้งหมด
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employee/search?query=${query}`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const sanitizePayload = (payload) => {
  return Object.fromEntries(
    Object.entries(payload).filter(
      ([_, value]) => value !== "" && value !== null && value !== undefined
    )
  );
};
  //const fetchEmployeeCount = async () => {
  //  try {

  //      const res = await fetch(
  //          `https://welcome-service-stg.metthier.ai:65000/api/v1/users?start=0&length=1`
  //      );
  //      const data = await res.json();
  //      setTotalEmployees(data.recordsTotal || 0);
  //  } catch (err) {
  //      console.error("Error fetching user count:", err);
  //  }
//};

const fetchUserCount = async () => {
  try {
    const token = localStorage.getItem("accessToken");

    const res = await fetch(
      `https://welcome-service-stg.metthier.ai:65000/api/v1/users?start=0&length=1`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      }
    );
    const data = await res.json();
    setTotalUsers(data.recordsTotal || 0);
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
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randomLetter = letters[Math.floor(Math.random() * letters.length)];
  const randomNumbers = Math.floor(10000 + Math.random() * 90000); // 5 หลักแน่นอน
  return `${randomLetter}${randomNumbers}`;
  };

  // ดึง user รายคนด้วย id
const fetchUserById = async (userId) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("No access token found");
      return null;
    }
    const res = await fetch(
      `https://welcome-service-stg.metthier.ai:65000/api/v1/users/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      }
    );
    const data = await res.json();
    console.log("User By ID:", data);
    return data.data ? { ...data.data, id: data.data.user_id ?? data.data.id }
  : null;

  } catch (err) {
    console.error("Error fetching user by id:", err);
    return null;
  }
};


  //handleOpenModal – เปิด modal พร้อมเซ็ตค่า
  const handleOpenModal = async (type, user = null) => {

  console.log("OPEN MODAL:", type, user);

  let userData = user;

  // ถ้าเป็น view หรือ edit → ดึงข้อมูลจาก API by id
  if ((type === "view" || type === "edit") && user?.id) {
    const freshData = await fetchUserById(user.id);
    if (freshData) {
      userData = freshData;
    }
  }
    setModalType(type);
    setSelectedUser(userData);

    setFormData({
    id: userData?.id || null,
    empId: userData?.empId || '',
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    username: userData?.username || '',
    email: userData?.email || '',
    mobileNo: userData?.mobileNo || '',
    address: userData?.address || '',
    deptId: userData?.deptId ?? null,
    roleId: userData?.roleId ?? null,
    active: userData?.active ?? true,
    password: '' 
    });
    setShowModal(true);
  };
  
  const createUser = async (payload) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No access token");

  const res = await fetch(
    "https://welcome-service-stg.metthier.ai:65000/api/v1/users/add",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Create user failed");
  }

  return res.status === 204 ? null : await res.json();
};


  const updateUser = async (userId, payload) => {

  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No access token");

  const res = await fetch(
    `https://welcome-service-stg.metthier.ai:65000/api/v1/users/${userId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Update user failed");
  }

  return res.status === 204 ? null : await res.json();
};

const buildCreatePayload = () =>
  sanitizePayload({
    empId: formData.empId,
    username: formData.username,
    password: formData.password,
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    mobileNo: formData.mobileNo,
    address: formData.address,
    deptId: formData.deptId,
    roleId: formData.roleId,
    commId: formData.commId,
    stnId: formData.stnId,
    active: true
  });
const buildEditPayload = () =>
  sanitizePayload({
    empId: formData.empId,
    username: formData.username,
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    mobileNo: formData.mobileNo,
    address: formData.address,
    deptId: formData.deptId,
    roleId: formData.roleId,
    commId: formData.commId,
    stnId: formData.stnId,
    active: formData.active
  });

  //handleSubmit – บันทึกข้อมูล (เพิ่มหรือแก้ไข)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
      try {
    // ================= ADD =================
    if (modalType === "add") {
      const payload = buildCreatePayload();
      console.log("CREATE payload:", payload);

      await createUser(payload);

      Swal.fire({
        icon: "success",
        title: "สำเร็จ!",
        text: "เพิ่มพนักงานใหม่เรียบร้อยแล้ว"
      });
    }

    // ================= EDIT =================
    if (modalType === "edit") {
      const userId = formData?.id;

      console.log("DEBUG formData:", formData);
      console.log("DEBUG selectedUser:", selectedUser);
      console.log("DEBUG userId:", userId);
      // 🔴 ป้องกัน id หาย / ผิด type
      if (!userId) {
        throw new Error("Invalid user id");
      }

      const payload = buildEditPayload();
      console.log("UPDATE id:", userId);
      console.log("UPDATE payload:", payload);

      await updateUser(userId, payload);

      Swal.fire({
        icon: "success",
        title: "สำเร็จ!",
        text: "แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว"
      });
    }

    setShowModal(false);
    await fetchUsers();
    await fetchUserCount();

  } catch (err) {
    console.error("Submit failed:", err);

    Swal.fire({
      icon: "error",
      title: "ผิดพลาด",
      text: err.message || "ไม่สามารถบันทึกข้อมูลผู้ใช้ได้"
    });
  }
};


  /*อาจจะไม่มี function */
//   const generateUserId = () => {
//   const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
//   const numbers = Math.floor(10000 + Math.random() * 90000); // 5 digits
//   return `${letter}${numbers}`;
// };

  //handleDelete – ลบพนักงานด้วย SweetAlert ยืนยัน
  const handleDelete = async (userId) => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'การลบข้อมูลนี้จะไม่สามารถย้อนกลับได้!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#A9A9A9',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    });

    if (!result.isConfirmed) return;

  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      Swal.fire('ผิดพลาด', 'ไม่พบ access token', 'error');
      return;
    }
    const res = await fetch(
      `https://welcome-service-stg.metthier.ai:65000/api/v1/users/${userId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      }
    );
    if (!res.ok) {
      throw new Error(`Delete failed: ${res.status}`);
    }
    Swal.fire('ลบแล้ว!', 'ข้อมูลผู้ใช้ถูกลบเรียบร้อยแล้ว', 'success');
    // โหลดข้อมูลใหม่หลังลบ
    fetchUsers();
    fetchUserCount();
  } catch (err) {
    console.error("Delete user failed:", err);
    Swal.fire('ผิดพลาด', 'ไม่สามารถลบข้อมูลผู้ใช้ได้', 'error');
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
                  <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
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
              <button className={styles.btnAdd} onClick={() => handleOpenModal('add')}>
                <FontAwesomeIcon icon={faSquarePlus} /> เพิ่มพนักงานใหม่
              </button>
            </div>
          </div>

          {/* ตารางแสดงพนักงาน */}
          <table className={styles.tableEmployee}>
            <thead className={styles.EmployeeThead}>
                <tr>
                  <th className={styles.th}>รหัส</th>
                  <th className={styles.th}>รหัสพนักงาน</th>
                  <th className={styles.th}>ชื่อ</th>
                  <th className={styles.th}>นามสกุล</th>
                  <th className={styles.th}>แผนก</th>
                  <th className={styles.th}>ตำแหน่ง</th>
                  {/* <th className={styles.th}>อีเมล</th>
                  <th className={styles.th}>บทบาท</th> */}
                  <th className={styles.th}>เครื่องมือ</th>

                </tr>
              </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id} className={styles.tr}>
                  <td className={styles.td}>{user.id}</td>
                  <td className={styles.td}>{user.empId}</td>
                  <td className={styles.td}>{user.firstName}</td>
                  <td className={styles.td}>{user.lastName}</td>
                  <td className={styles.td}>{user.deptId}</td>
                  <td className={styles.td}>{user.roleId}</td>

                  
                  <td>
                     {/* ปุ่มดู/ แก้ไข/ ลบ */}
                    <button className={styles.viewBtn} onClick={() => handleOpenModal('view', user)}>
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className={styles.editBtn} onClick={() => handleOpenModal('edit', user)}>
                      <FontAwesomeIcon icon={faPencil} />
                      </button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(user.id)}>
                      <FontAwesomeIcon icon={faTrash} />
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.pagination}>
            <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>
              กลับ
            </button>
            <span> หน้า {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(totalUsers / rowsPerPage)}
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

