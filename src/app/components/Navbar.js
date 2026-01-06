"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSun,
    faHome,
    faUsers,
    faFileLines,
    faRightFromBracket,
    faPlus,
    faCheck,
    faList,
    faCogs,

} from "@fortawesome/free-solid-svg-icons";

// import { hasPermission } from "../utils/checkPermission";
import styles from "../style/navbar.module.css";


// -----------------------------
// เมนูที่เห็นได้
// -----------------------------
const menuConfig = [
    { name: "Home", path: "/pages/home", permission: null, icon: faHome },

    //
    { name: "Employee", path: "/pages/employee",  icon: faUsers },
    { name: "Project", path: "/pages/project",  icon: faFileLines },
    { name: "Create Ticket", path: "/pages/create-ticket", permission: "case.create", icon: faPlus },
    
    { name: "Approve Ticket", path: "/pages/approve-ticket", permission: "case.view_history", icon: faCheck },
    { name: "Ticket Lists", path: "/pages/ticketlist",  permission: "case.view_history", icon: faList },
    
    { name: "User Management", path: "/pages/user", permission: "user.create", icon: faUsers },
    { name: "Service Type", path: "/pages/service-type", permission: "service.create", icon: faCogs },
    { name: "Service Sub Type", path: "/pages/service-sub-type", permission: "service.create", icon: faCogs },
];


export default function Navbar() {
    const router = useRouter();
    const [permissions, setPermissions] = useState([]);
    


    // -----------------------------
    // โหลด permission จาก localStorage
    // -----------------------------

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("permissions") || "[]");
        setPermissions(stored);
    }, []);


    // -----------------------------
    // Filter เมนูตาม permission
    // -----------------------------
    const visibleMenus = menuConfig.filter(menu => {
        // Home ไม่ต้องมี permission
        if (!menu.permission) return true;

        // ถ้ามี permission → ผ่าน
        return permissions.includes(menu.permission);
    });


    // ถ้าไม่มี permission ใดๆ → เห็นแค่ Home
    const finalMenus = visibleMenus.length > 1 ? visibleMenus : menuConfig.filter(m => m.name === "Home");


    // -----------------------------
    // Logout
    // -----------------------------
    const handleLogout = () => {
        const confirmLogout = window.confirm("คุณต้องการออกจากระบบใช่ไหม?");
        if (confirmLogout) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("permissions");

            router.push("../pages/login");
        }
    };


    return (
        <nav className={styles.navbarList}>
            {/* LOGO */}
            <div className={styles.logo}>
                <FontAwesomeIcon icon={faSun} className={styles.iconlogo} /> LOGO
            </div>

            <ul className={styles.navLinks}>

                {/* แสดงเมนูที่มีสิทธิ์ */}
                {finalMenus.map((menu, index) => (
                    <li
                        key={index}
                        onClick={() => router.push(menu.path)}
                        className={styles.navItem}
                    >
                        <FontAwesomeIcon icon={menu.icon} className={styles.icon} />
                        {menu.name}
                    </li>
                ))}

                {/* Logout */}
                <button className={styles.btnLogout} onClick={handleLogout}>
                    <FontAwesomeIcon icon={faRightFromBracket} className={styles.LogOutIcon} />
                    ออกจากระบบ
                </button>

            </ul>
        </nav>
    );
}




