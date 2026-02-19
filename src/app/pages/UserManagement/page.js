//pages/UserManagement/page.js
"use client"

//ใช้ useEffect() เพื่อรันโค้ดเมื่อ component ถูกโหลด
import React, { useState, useEffect } from "react";
//import { v4 as uuidv4 } from 'uuid';  ใช้สำหรับสร้าง UUID
import Swal from 'sweetalert2'; // สำหรับ popup เตือน
import EmployeeModal from '../../components/UserModal';
//import { fetchWithCache } from "../../utils/apiCache";
import { getOrFetch } from "../../utils/localCache";


// useRouter ใช้สำหรับนำทางไปยังหน้าอื่น, next/navigation คือเวอร์ชันใหม่ที่ใช้ใน App Router
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPencil,
    faEye,
    faTrash,
    faSquarePlus,
    faUserTie, 
    faImage,
    faMagnifyingGlass,
    faTableList, 
    faGrip,
} from "@fortawesome/free-solid-svg-icons";

import styles from "../../style/user.module.css"
import Navbar from "../../components/Navbar";


export default function EmployeePage() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
  const API_V1 = `${API_BASE}/api/v1`;
  //const API_V1 = process.env.NEXT_PUBLIC_API_URL;

  const [formData, setFormData] = useState({
  id: "",  
  empId: '',
  firstName: '',
  lastName: '',
  username: '',
  password: '',
  email: '',
  mobileNo: '',
  address: '',
  deptId: '',
  roleId: '',

  commId: undefined,
  stnId: undefined,
  
   userType: 1,

  active: true

  });
  //  viewMode: "table" | "card"
  const [viewMode, setViewMode] = useState("table");
  const [roles, setRoles] = useState([]);
  const [roleMap, setRoleMap] = useState({});
  const [departments, setDepartments] = useState([]);
  const [deptMap, setDeptMap] = useState({});
  const [orgTree, setOrgTree] = useState([]);
  const [commands, setCommands] = useState([]);
  const [stations, setStations] = useState([]);

  const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return {
      ok: false,
      unauthorized: true,
      message: "Token หมดอายุ",
    };
  }

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    return {
      ok: false,
      networkError: true,
      message: "Network error",
    };
  }

  //  token หมดอายุ
  {/*if (res.status === 401) {
  console.warn("401 Unauthorized:", url);
  
    Swal.fire({
      icon: "warning",
      title: "Session หมดอายุ",
      text: "กรุณาเข้าสู่ระบบใหม่",
      confirmButtonText: "ตกลง",
    }).then(() => {
    localStorage.removeItem("accessToken"); //
    window.location.href = "../pages/login"; // บังคับกลับ login
  });
  return {
      ok: false,
      unauthorized: true,
      message: "Session expired",
    };
  }*/}

    if (res.status === 401) {
  console.warn("401 Unauthorized:", url);

  return {
    ok: false,
    unauthorized: true,
    message: "Unauthorized",
  };
}

    

  let data = null;
  try {
    data = await res.json();
  } catch {
    // บาง endpoint อาจไม่มี body
  }

  return {
    ok: res.ok,
    status: res.status,
    data,
    message: data?.msg || data?.desc || null,
  };
};

 
// เรียก API FastAPI
//     .then((res) => res.json())
//     .then((data) => setEmployees(data))
//     .catch((err) => console.error(err));
// }, []);
  const router = useRouter();
  
  const [allUsers, setAllUsers] = useState([]); 
  const rowsPerPage = 10;
  const [page, setPage] = useState(1);
  const [displayUsers, setDisplayUsers] = useState([]);

  //const [totalUsers, setTotalUsers] = useState(0);
  const totalUsers = displayUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalUsers / rowsPerPage));




  const [searchTerm, setSearchTerm] = useState('');

 useEffect(() => {
  fetchUsers();
  fetchRoles();

  apiRequest(`${API_V1}/department_command_stations`)
    .then(res => {
      if (!res.ok || res.data?.status !== "0") return;

      const list = res.data.data || [];
      setOrgTree(list);

      const deptMapTemp = {};
      const uniqueDepts = [];
      

      list.forEach(d => {
        const deptKey = d.deptId || d.id;
        
        if (!deptMapTemp[deptKey]) {
          deptMapTemp[deptKey] = d.deptTh || d.deptEn || d.name;
          
          uniqueDepts.push({
            deptId: deptKey,
            name: d.deptTh || d.deptEn || d.name,
          });
        }
      });

      setDeptMap(deptMapTemp);
      setDepartments(uniqueDepts);
    });
}, []);




    useEffect(() => {

          if (!formData.deptId || orgTree.length === 0) {
            setCommands([]);
            setStations([]);
            return;
          }

          const filtered = orgTree
            .filter((item) => String(item.deptId) === String(formData.deptId))
            .map((item) => ({
              commId: item.commId,
              name: item.commandTh || item.commandEn,
            }));

          const unique = Array.from(
            new Map(filtered.map((c) => [c.commId, c])).values()
          );

          setCommands(unique);
          setStations([]); // รีเซ็ต station
        }, [formData.deptId, orgTree]);




useEffect(() => {
  if (!formData.commId || orgTree.length === 0) {
    setStations([]);
    return;
  }

  const filtered = orgTree
    .filter(item => String(item.commId) === String(formData.commId))
    .map((item) => ({
      stnId: item.stnId,
      name: item.stationTh || item.stationEn,
    }));

  const unique = Array.from(
    new Map(filtered.map((s) => [s.stnId, s])).values()
  );

  setStations(unique);
}, [formData.commId, orgTree]);



//fetchUsers – ดึงข้อมูลพนักงานจาก API
 /*const fetchUsers = async () => {

  const res = await apiRequest(`${API_V1}/users`);
  if (!res.ok) return;

  const all = res.data?.data || [];
  setAllUsers(all);     // เก็บทั้งหมด
  setDisplayUsers(all);
  setPage(1);

    try {
      const start = (page - 1) * rowsPerPage;
      //const start = (currentPage - 1) * rowsPerPage;
      
      const res = await apiRequest(`${API_V1}/users?start=${start}&length=${rowsPerPage}`,
      {
        method: "GET",
      }
    );
      
      if (!res.ok) return;

    console.log("User List:", res.data);

    setUsers(
      Array.isArray(res.data?.data)
        ? res.data.data.map(u => ({
            ...u,
           // id: u.user_id ?? u.id
             id: Number(u.id),
          }))
        : []
    );
  } catch (err) {
    console.error("Error fetching user list:", err);
  }
};*/
      
      const fetchUsers = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return;

  const cacheKey = "user_list";

  try {
    const res = await apiRequest(`${API_V1}/users`, {
  method: "GET",
});

if (!res.ok) return;

const all = res.data?.data || [];

console.log("Users loaded:", all);

setAllUsers(all);
setDisplayUsers(all);
setPage(1);

  } catch (err) {
    console.error("Error loading users:", err);
  }
};





      /*const fetchUsers = async (forceRefresh = false) => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const cacheKey = "users_list";

        // ถ้าไม่ได้บังคับ refresh → ใช้ cache ก่อน
        if (!forceRefresh) {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            console.log("Load users from cache");
            const parsed = JSON.parse(cached);
            setAllUsers(parsed);
            setDisplayUsers(parsed);
            setPage(1);
            return;
          }
        }

        console.log(" Fetch users from API");
        const res = await apiRequest(`${API_V1}/users`);
        if (!res.ok) return;

        const all = res.data?.data || [];

        setAllUsers(all);
        setDisplayUsers(all);
        setPage(1);

        // เก็บ cache
        localStorage.setItem(cacheKey, JSON.stringify(all));
      };*/



      const fetchRoles = async () => {
  const res = await apiRequest(
    `${API_V1}/role?start=0&length=100`,
    { method: "GET" }
  );

  if (!res.ok) return;

  const list = res.data?.data || [];
  setRoles(list);

  // แปลงเป็น map: { uuid: roleName }
  const map = {};
  list.forEach(r => {
    const key = r.roleId || r.id;   
    map[key] = r.name || r.roleName || r.code;
  });

  setRoleMap(map);
};



const startIndex = (page - 1) * rowsPerPage;
const endIndex = startIndex + rowsPerPage;

const pagedUsers = displayUsers.slice(
  startIndex,
  startIndex + rowsPerPage
);
   




const handleSearch = (query) => {
  setSearchTerm(query);

  if (!query.trim()) {
    setDisplayUsers(allUsers);
    setPage(1);
    return;
  }

  const q = query.toLowerCase();

  const filtered = allUsers.filter(u =>
    u.empId?.toLowerCase().includes(q) ||
    u.firstName?.toLowerCase().includes(q) ||
    u.lastName?.toLowerCase().includes(q)
  );

  setDisplayUsers(filtered);
  setPage(1);
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




/*const fetchUserCount = async () => {
  try {

    const res = await apiRequest(
      `${API_V1}/users?start=0&length=1`,
      {
        method: "GET",
      }
    );
    if (!res.ok) return;

    setTotalUsers(res.data?.recordsTotal ??
      res.data?.total ??
      res.data?.count ??
      0
    );

  } catch (err) {
    console.error("Error fetching user count:", err);
  }
};*/



//const totalPages = Math.max(1, Math.ceil(totalUsers / rowsPerPage));

  //handleChange – เมื่อพิมพ์ใน input
  //const handleChange = (e) => {
  //  setFormData({ ...formData, [e.target.name]: e.target.value });
  //};

// ===== JWT UTILS =====
const getPayloadFromToken = () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    const base64Payload = token.split(".")[1];
    const jsonPayload = atob(base64Payload);
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
};

const getOrgIdFromToken = () => {
  const payload = getPayloadFromToken();
  return payload?.orgId || null;
};


//  const getOrgIdFromToken = () => {
//  try {
//    const token = localStorage.getItem("accessToken");
//    if (!token) return null;

//    const payload = JSON.parse(atob(token.split(".")[1]));
//    return payload.orgId || null;
//  } catch (e) {
//    console.error("Invalid token", e);
//    return null;
//  }
//};



  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "deptId") {
    setFormData(prev => ({
      ...prev,
      deptId: value || undefined,
      commId: undefined,
      stnId: undefined,
    }));
    return;
  }

  // 🟢 เลือก command ใหม่ → ล้าง station
  if (name === "commId") {
    setFormData(prev => ({
      ...prev,
      commId: value || undefined,
      stnId: undefined,
    }));
    return;
  }

    const uuidFields = ["deptId", "roleId", "commId", "stnId"];
    setFormData(prev => ({
      ...prev,
      [name]: uuidFields.includes(name) && value === ""
        ? undefined   // แปลง "" → undefined
        : value
  }) );
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
  const id = Number(userId);
  if (!Number.isInteger(id)) return null;

  const res = await apiRequest(`${API_V1}/users/${id}`, {
    method: "GET",
  });

  if (!res.ok) return null;

  return res.data?.data
   // ? { ...res.data.data, id: res.data.data.user_id ?? res.data.data.id }
   ? { ...res.data.data, id }
    : null;
};



  //handleOpenModal – เปิด modal พร้อมเซ็ตค่า
  const handleOpenModal = async (type, user = null) => {

  console.log("OPEN MODAL:", type, user);

  let userData = user;

  // ถ้าเป็น view หรือ edit → ดึงข้อมูลจาก API by id
  if ((type === "view" || type === "edit")) {
  const fetchId = user?.id;

  if (!fetchId) {
    console.error("Missing user id");
    return;
  }

  const freshData = await fetchUserById(fetchId);

  if (freshData) {
    userData = {
      ...freshData,
      id: fetchId 
    };
  }
  }

    setModalType(type);
    setSelectedUser(userData);

    setFormData({
    //id: userData?.id && userData.id !== "" ? userData.id : userData?.username,
    id: userData?.id ?? "",
    empId: userData?.empId || '',
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    username: userData?.username || '',
    email: userData?.email || '',
    mobileNo: userData?.mobileNo || '',
    address: userData?.address ?? undefined,

    
    roleId: userData?.roleId ?? undefined,
    deptId: userData?.deptId ? String(userData.deptId) : undefined,
commId: userData?.commId ? String(userData.commId) : undefined,
stnId: userData?.stnId ? String(userData.stnId) : undefined,

    userType: Number(userData?.userType ?? 1),

    active: userData?.active ?? true,
    
    birthDate: userData?.bod
      ? userData.bod.split("T")[0]
      : undefined,

    password: '' ,
    });
    setShowModal(true);
  };
  
  // กด "แก้ไข" จาก modal view
const handleEditFromModal = (user) => {
  setShowModal(false); // ปิด view ก่อน (สำคัญ)
  handleOpenModal("edit", user);
};

// กด "ลบ" จาก modal view
const handleDeleteFromModal = async (userId) => {
  setShowModal(false); // ปิด modal view
  await handleDelete(userId); // ใช้ของเดิมได้เลย
};


  const createUser = async (payload) => {
   const res = await apiRequest(
    `${API_V1}/users/add`,
    //`${API_V1}/users`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error(res.message || "Create user failed");
  }

  return res.data;
};


  const updateUser = async (userId, payload) => {
    const res = await apiRequest(
    `${API_V1}/users/${encodeURIComponent(userId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error(res.message || "Update user failed");
  }

  return res.data;
};

/**
 * buildSafePayload
 * ใช้สำหรับ CREATE + EDIT
 * - ตัดค่า "", null, undefined ออก
 * - รองรับ date fields
 */
const buildSafePayload = (data, options = {}) => {
  const {
    mode = "edit",        // "create" | "edit"
    dateFields = [],      // ['birthDate', 'startDate']
  } = options;

  const payload = {};
  const uuidFields = ["deptId", "roleId", "commId", "stnId", "orgId"];

Object.entries(data).forEach(([key, value]) => {
    //  ตัด empty
    if (value === "" || value === undefined || value === null) return;


if (uuidFields.includes(key)) {
  if (typeof value !== "string" || value.trim() === "") return; // ไม่ส่งเลย
  payload[key] = value;
  return;
}

  if (dateFields.includes(key)) {
      payload[key === "birthDate" ? "bod" : key] = `${value}T00:00:00Z`;
      return;
    }

    payload[key] = value;
  }); 

  //  password
  if (mode === "create" && data.password) {
    payload.password = data.password;
  }

  return payload;
};


  const timeAgo = (dateString) => {
  if (!dateString) return "-";

  const now = new Date();
  const past = new Date(dateString);

  if (isNaN(past.getTime())) return "-";

  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "เมื่อสักครู่";
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  if (diffHour < 24) return `${diffHour} ชั่วโมงที่แล้ว`;
  if (diffDay < 7) return `${diffDay} วันที่แล้ว`;
  if (diffWeek < 4) return `${diffWeek} สัปดาห์ที่แล้ว`;
  if (diffMonth < 12) return `${diffMonth} เดือนที่แล้ว`;
  return `${diffYear} ปีที่แล้ว`;
};




  //handleSubmit – บันทึกข้อมูล (เพิ่มหรือแก้ไข)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
      try {
    // ================= ADD =================
    if (modalType === "add") {

      const orgId = getOrgIdFromToken();

      if (!orgId) {
        Swal.fire("ผิดพลาด", "ไม่พบ orgId", "error");
        return;
      }

      const payload = buildSafePayload(
    {
      ...formData,
      orgId, 
    }, 
    {
    mode: "create",
    dateFields: ["birthDate", "startDate", "endDate"],
    });

    console.log("CREATE payload:", payload);

    const res = await createUser(payload).catch(err => {
  if (err.message?.includes("Unauthorized")) {
    Swal.fire("ไม่มีสิทธิ์", "คุณไม่มีสิทธิ์เพิ่มผู้ใช้", "error");
    return null;
  }
  throw err;
});

if (!res) return;


      Swal.fire({
        icon: "success",
        title: "สำเร็จ!",
        text: "เพิ่มผู้ใช้ใหม่เรียบร้อยแล้ว"
      });
    }

    // ================= EDIT =================
    if (modalType === "edit") {
      //const userId = formData?.id;
      //const userId = String(formData.id || "").trim();
      //const userId = selectedUser?.id;
      const userId = Number(selectedUser?.id);

      if (!Number.isInteger(userId)) {
        throw new Error("Invalid user id");
      }

      const payload = buildSafePayload(formData, {
    mode: "edit",
    dateFields: ["birthDate", "startDate", "endDate"],
  });

    
  console.log("EDIT payload:", payload);
  await updateUser(userId, payload);
      Swal.fire({
        icon: "success",
        title: "สำเร็จ!",
        text: "แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว"
      });
    }

    setShowModal(false);
    await fetchUsers(true); // true = โหลดจาก API
    

  } catch (err) {
     setShowModal(false);
    Swal.fire(
      "ผิดพลาด",
      err.message || "ไม่สามารถบันทึกข้อมูลได้",
      "error"
    );
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
    
    const res = await apiRequest(
      `${API_V1}/users/${userId}`,
      {
        method: "DELETE",
      
      }
    );
    if (!res.ok) {
      throw new Error(res.message || "Delete failed");
    }
    Swal.fire('ลบแล้ว!', 'ข้อมูลผู้ใช้ถูกลบเรียบร้อยแล้ว', 'success');
    // โหลดข้อมูลใหม่หลังลบ
    fetchUsers(true);

    //fetchUserCount();
  } catch (err) {
    Swal.fire('ผิดพลาด', err.message, 'error');
  }
  };

  return (
    <>
      <Navbar />
        <div className={styles.container}>
          <h2 className={styles.title}>รายชื่อพนักงาน</h2>

          

            {/* searchBox */}
          <div className={styles.topBar}>
            {/*สลับการ์ดกับตาราง */}
          <div className={styles.leftTools}>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.toggleBtn} ${
                viewMode === "table" ? styles.active : ""
              }`}
              onClick={() => setViewMode("table")}
              title="มุมมองตาราง"
            >
              <FontAwesomeIcon icon={faTableList} />
            </button>

            <button
              className={`${styles.toggleBtn} ${
                viewMode === "card" ? styles.active : ""
              }`}
              onClick={() => setViewMode("card")}
              title="มุมมองการ์ด"
            >
              <FontAwesomeIcon icon={faGrip} />
            </button>
          </div>


            
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
                <FontAwesomeIcon icon={faSquarePlus} /> สร้างผู้ใช้
              </button>
            </div>
          </div>

          {/* ตารางแสดงพนักงาน */}
          {/* ================= TABLE VIEW (DEPRECATED) ================= */}
          
          {viewMode === "table" ? (
  /* ===== TABLE VIEW ===== */
  <table className={styles.tableEmployee}>
    <thead>
      <tr>
        <th>ผู้ใช้</th>
        <th>บทบาท</th>
        <th>แผนก</th>
        <th>สถานะ</th>
        <th>เข้าสู่ระบบครั้งล่าสุด</th>
        <th>การดำเนินการ</th>
      </tr>
    </thead>

    <tbody>
      {pagedUsers.map((user) => (
        <tr key={user.id}>
          <td>
            <div className={styles.userCell}>

               <div className={styles.avatar}>
                {user.firstName?.charAt(0)}
                {user.lastName?.charAt(0)}
              </div>
              <div className={styles.userInfo}>

                <div className={styles.userName}>
                  {user.firstName} {user.lastName}
                </div>
                <div className={styles.userEmail}>{user.email}</div>
              </div>
            </div>
          </td>

          <td>{roleMap[user.roleId] ?? "-"}</td>
          <td>{deptMap[user.deptId] ?? "-"}</td> 

          <td>
            <span
              className={`${styles.statusBadge} ${
              user.active ? styles.active : styles.inactive
            }`}
            >
              <span className={styles.statusIcon}>
                {user.active ? "✓" : "✕"}
              </span>
              {user.active ? "ใช้งานอยู่" : "ไม่ใช้งาน"}
            </span>
          </td>

          <td>{timeAgo(user.lastLogin)}</td>

          <td className={styles.actionCol}>
            <button className={styles.viewBtn} onClick={() => handleOpenModal("view", user)}>แสดง</button>
            <button className={styles.editBtn} onClick={() => handleOpenModal("edit", user)}>แก้ไข</button>

            <button className={styles.deleteBtn}onClick={() => handleDelete(user.id)}>ลบ</button>
          </td>

        </tr>
      ))}
    </tbody>
      
  </table>
  /* ================= END TABLE VIEW ================= */
   

) : (
 <>
      {/* ================= CARD VIEW ================= */}
<div className={styles.userGrid}>
  {pagedUsers.map((user) => {
    const initials =
      `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();

    return (
      <div key={user.id} className={styles.userCard}>
        {/* Avatar */}
        <div className={styles.avatar}>
          {initials || <FontAwesomeIcon icon={faUserTie} />}
        </div>

        {/* User info */}
        <div className={styles.userInfo}>
          <div className={styles.userName}>
            {user.firstName} {user.lastName}
          </div>

          <div className={styles.userEmail}>
            {user.email || "-"}
          </div>

          <div className={styles.userRole}>
            {roleMap[user.roleId] || "Staff"}
          </div>

          <div className={styles.userStatus}>
            <span className={styles.activeBadge}>
              ✓ ใช้งานอยู่
            </span>
          </div>
        </div>

        <hr className={styles.cardDivider} />

        {/* Actions */}
        <div className={styles.cardActions}>
      <button className={styles.viewBtn} onClick={() => handleOpenModal("view", user)}>แสดง</button>
      <button className={styles.editBtn} onClick={() => handleOpenModal("edit", user)}>แก้ไข</button>
      <button className={styles.deleteBtn} onClick={() => handleDelete(user.id)}>ลบ</button>
        </div>
      </div>
    );
  })}
</div>
  </>
)}

{/* ================= END CARD VIEW ================= */}


          <div className={styles.pagination}>
            

            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              กลับ
            </button>

            <span>หน้า {page}</span>

            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages}
            >
              ถัดไป
            </button>

        </div>   

            {/*ส่วนของ Modal แยกไฟล์ */}
            {showModal && formData && (
              <EmployeeModal
                show={showModal}
                type={modalType}
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                onClose={() => setShowModal(false)}
                onEdit={handleEditFromModal}
                onDelete={handleDeleteFromModal}
                roles={roles}
                roleMap={roleMap}
                departments={departments}   
                deptMap={deptMap}
                commands={commands}    
                stations={stations}

              />
            )}
      </div>
    </>
  );

}

