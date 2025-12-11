//บอกให้ Next.js รู้ว่าไฟล์นี้ทำงานฝั่ง Client Side, จำเป็นเมื่อคุณใช้ Next.js App Router
"use client";

//ใช้ useEffect() เพื่อรันโค้ดเมื่อ component ถูกโหลด
import { useState } from "react";

// useRouter ใช้สำหรับนำทางไปยังหน้าอื่น, next/navigation คือเวอร์ชันใหม่ที่ใช้ใน App Router
import { useRouter } from "next/navigation";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSun,
  faHome,
  faUsers,
  faFileLines,
  // faGear, //เพิ่มไอคอน gear
  // faUserSecret,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

import styles from "../style/navbar.module.css";
import axios from "axios";
import Logout from "./Logout";

export default function Navbar() {
  // ใช้เพื่อเปลี่ยนเส้นทาง
  const router = useRouter();

  //   const [ShowSubMenu, setShowSubMenu] = useState(false);

  //   const toggleSubMenu = () => {
  //     setShowSubMenu(!ShowSubMenu);
  //   };

  //   const goTo = (path) => {
  //     setShowSubMenu(false); // ซ่อนเมนูหลังคลิก
  //     router.push(path);
  //   };

  const [showLogout, setShowLogout] = useState(false);

  //   const handleLogout = async () => {
  //     const confirmLogout = window.confirm("คุณต้องการออกจากระบบใช่ไหม?");
  //     if (!confirmLogout) return;
  const confirmLogout = async () => {
    setShowLogout(false);
    localStorage.removeItem("token");

    // เรียก API /auth/logout (optional)
    try {
      const response = await axios.post(
        "https://welcome-service-stg.metthier.ai:65000/api/v1/auth/logout",
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // ส่ง cookies ด้วย
        }
      );
      //   if (response.status === 200) {
      //     // ถ้า logout สำเร็จ ให้ไปหน้า login
      //     window.location.href =
      //       "https://welcome-service-stg.metthier.ai:65000/api/v1/auth/login";
      //   } else {
      //     // กรณีไม่ใช่ 200 ก็ redirect ไปหน้า login
      //     window.location.href =
      //       "https://welcome-service-stg.metthier.ai:65000/api/v1/auth/login";
      //   }
    } catch (error) {
      console.error("Logout error:", error);
      // ถ้า error ให้ไปหน้า login อยู่ดี
      //   window.location.href =
      //     "https://welcome-service-stg.metthier.ai:65000/api/v1/auth/login";
      // }
    } finally {
      router.push("/pages/login");
    }
  };

  return (
    <nav className={styles.navbarList}>
      {/* Logo */}
      <div className={styles.logo}>
        <FontAwesomeIcon icon={faSun} className={styles.iconlogo} /> LOGO
      </div>

      {/* router.push("/__name folder หลัก__/__namefile__") */}

      <ul className={styles.navLinks}>
        <li
          onClick={() => router.push("/pages/home")}
          className={styles.navItem}
        >
          <FontAwesomeIcon icon={faHome} className={styles.icon} /> Home
        </li>

        <li
          onClick={() => router.push("/pages/employee")}
          className={styles.navItem}
        >
          <FontAwesomeIcon icon={faUsers} className={styles.icon} /> Employee
        </li>

        <li
          onClick={() => router.push("/pages/project")}
          className={styles.navItem}
        >
          <FontAwesomeIcon icon={faFileLines} className={styles.icon} /> Project
        </li>

        {/* setting มี 2 อัน คือ settingrole กับ settinguser 
                 <li
                    onClick={toggleSubMenu} className= {styles.navItem}>
                    <FontAwesomeIcon icon={ faGear } className={styles.icon} /> Setting
                </li>*/}

        {/*{ShowSubMenu &&(
                    <ul className={styles.subSetting}>
                        
                            <li onClick={() => goTo("/pages/setting/settingprofile")}>
                                <FontAwesomeIcon icon= { faUser } className={styles.subSettingIcon}/> Setting Profile
                            </li>

                            <li onClick={() => goTo("/pages/setting/settingrole")}>
                                <FontAwesomeIcon icon= { faUserSecret } className={styles.subSettingIcon}/> Setting Role
                            </li>
                        
                    </ul>
                )}*/}

        <button
          className={styles.btnLogout}
          onClick={() => setShowLogout(true)}
        >
          {/* {handleLogout} */}
          <FontAwesomeIcon
            icon={faRightFromBracket}
            className={styles.LogOutIcon}
          />
          {/* {" "}   {" "}*/}
          ออกจากระบบ
        </button>
      </ul>
      
      {/* Modal Logout */}
      <Logout
        show={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={confirmLogout}
      />
    </nav>
  );
}

//router.push("/login") จะเปลี่ยนหน้าไป /login เมื่อกดปุ่ม
//const goToHome = () => {
//router.push("/home");
//}

//      const goToSetting = () => {
//         router.push("/setting");
//     }
