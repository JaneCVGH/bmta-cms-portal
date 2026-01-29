// src\app\components\Navbar.js

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
import LogoutModal from "./LogoutModal";

// -------------เมนูที่เห็นได้ บน navbar----------------

const menuConfig = [
  { name: "Home", path: "/pages/home", permission: null, icon: faHome },
  { name: "Employee", path: "/pages/employee", icon: faUsers },
  // { name: "Project", path: "/pages/project", icon: faFileLines },

  // {
  //   name: "Approve Ticket",
  //   path: "/pages/approve-ticket",
  //   permission: "case.view_history",
  //   icon: faCheck,
  // },
  {
    name: "Ticket Lists",
    path: "/pages/ticketlist",
    permission: "case.view_history",
    icon: faList,
  },

  {
    name: "Case Types",
    path: "/pages/casetype",
    permission: "case.create",
    icon: faPlus,
  },

  {
    name: "User Management",
    path: "/pages/user",
    permission: "user.create",
    icon: faUsers,
  },
  {
    name: "Service Type",
    path: "/pages/service-type",
    permission: "service.create",
    icon: faCogs,
  },
  {
    name: "Service Sub Type",
    path: "/pages/service-sub-type",
    permission: "service.create",
    icon: faCogs,
  },
];

export default function Navbar() {
  const router = useRouter();
  const [permissions, setPermissions] = useState([]);
  const [showLogout, setShowLogout] = useState(false);

  // --------------โหลด permission จาก localStorage------------
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("permissions") || "[]");
    setPermissions(stored);
  }, []);

  // --------------Filter เมนูตาม permission---------------
  const visibleMenus = menuConfig.filter((menu) => {
    // Home ไม่ต้องมี permission
    if (!menu.permission) return true;

    // ถ้ามี permission → ผ่าน
    return permissions.includes(menu.permission);
  });

  // ถ้าไม่มี permission ใดๆ → เห็นแค่ Home
  const finalMenus =
    visibleMenus.length > 1
      ? visibleMenus
      : menuConfig.filter((m) => m.name === "Home");

  // -------------Logout (เรียกจาก modal)----------------
  const handleLogout = async () => {
    localStorage.removeItem("permissions");
    localStorage.removeItem("user_data");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    localStorage.removeItem("user_role");

    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
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
        <li>
          <button
            className={styles.btnLogout}
            onClick={() => setShowLogout(true)}
          >
            <FontAwesomeIcon
              icon={faRightFromBracket}
              className={styles.LogOutIcon}
            />
            ออกจากระบบ
          </button>
        </li>
      </ul>

      {/*  Logout Modal */}
      <LogoutModal
        show={showLogout}
        onCancel={() => setShowLogout(false)}
        onConfirm={async () => {
          await handleLogout();
          setShowLogout(false);
          router.push("/pages/login");
        }}
      />
    </nav>
  );
}
