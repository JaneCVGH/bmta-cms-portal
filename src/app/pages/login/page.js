//<--------------Login-------------->

//บอกให้ Next.js รู้ว่าไฟล์นี้ทำงานฝั่ง Client Side, จำเป็นเมื่อคุณใช้ Next.js App Router
"use client";

//ใช้ useEffect() เพื่อรันโค้ดเมื่อ component ถูกโหลด
import React, { useState } from "react";

//useRouter ใช้สำหรับนำทางไปยังหน้าอื่น, next/navigation คือเวอร์ชันใหม่ที่ใช้ใน App Router
import { useRouter } from "next/navigation";
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  //เพิ่มไอคอน
  faLock,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

//weetalert2 เป็นไลบรารี JavaScript สำหรับแสดง popup สวยงาม
import Swal from "sweetalert2";

//เพราะ ../../ หมายถึงย้อนกลับ 2 ชั้นจาก pages/home/ ไปหา style///
import styles from "../../style/./login.module.css";
//import { run } from "node:test";

// import { setToken } from "../../../components/Token";

// function หลัก
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // ปุ่มไป Register
  const handleRegisterClick = () => {
    //เพิ่ม console.log เพื่อดูว่าเรียกจริงไหม
    console.log("กำลังกดปุ่มลงทะเบียน...");
    router.push("/pages/register"); // เส้นทางไปยังหน้า /register
  };

  // input องค์กร แบบล็อกค่า
  const [organization, setOrganization] = useState("");

  // Login Submit
  const handleSubmit = async (e) => {
    console.log("Submit ถูกเรียกแล้ว");
    e.preventDefault();
    // if (e?.preventDefault);  ป้องกันการรีเฟรชหน้า

    setIsLoading(true);

    if (!username.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Information!",
        text: "กรุณากรอกชื่อผู้ใช้งาน",
        confirmButtonText: "ตกลง",
        iconColor: "#ff9500",
      });
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Information!",
        text: "กรุณากรอกรหัสผ่าน",
        confirmButtonText: "ตกลง",
        iconColor: "#ff9500",
      });
      setIsLoading(false);
      return;
    }

    if (organization.trim().toUpperCase() !== "SKY-AI") {
      Swal.fire({
        icon: "error",
        title: "องค์กรไม่ถูกต้อง",
        text: "กรุณากรอกองค์กรให้ถูกต้อง",
        confirmButtonText: "ตกลง",
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log("ส่ง request ไปยัง API:");
      const response = await fetch(
        "https://welcome-service-stg.metthier.ai:65000/api/v1/auth/login",
        // `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            password,
            organization,
          }),
        }
      );

      // console.log("Response status:", response.status);
      const data = await response.json();
      console.log("✅ API Response:", data);
      // console.log("Response data:", data);

      //response.ok && data.access_token
      if (response.ok && data?.data?.accessToken && data?.data?.user) {
        // **เก็บ token และข้อมูล user ใน localStorage**
        localStorage.setItem("access_token", data.data.accessToken);
        localStorage.setItem("refresh_token", data.data.refreshToken);
        localStorage.setItem("token_type", data.data.token_type);

        // **ข้อมูล user ใน localStorage
        localStorage.setItem("user_data", JSON.stringify(data.data.user));
        localStorage.setItem("user_id", data.data.user.id.toString());
        localStorage.setItem("username", data.data.user.username);
        localStorage.setItem("user_role", data.data.user.role);
        localStorage.setItem(
          "is_verified",
          data.data.user.active?.toString() || "false"
        );

        // ✅ เช็คว่าเก็บได้จริงไหม (จุดสำคัญ)
        console.log("ACCESS TOKEN =", data.data.accessToken);
        
        Swal.fire({
          icon: "success",
          title: "เข้าสู่ระบบสำเร็จ",
          text: `ยินดีต้อนรับ ${data.data.user.username || ""}`,
          confirmButtonText: "ตกลง",
        }).then(() => {
          router.push("../../pages/home");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "เข้าสู่ระบบไม่สำเร็จ",
          text: data.detail || "กรุณากรอก ชื่อผู้ใช้ และ รหัสผ่านให้ถูกต้อง",
          confirmButtonText: "ตกลง",
        });
      }
    } catch (error) {
      console.error("Login error:", error);

      Swal.fire({
        icon: "error",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        text: "กรุณาลงทะเบียนก่อนเข้าสู่ระบบอีกครั้ง",
        confirmButtonText: "ตกลง",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <div className={styles.iconRegister}>
          <FontAwesomeIcon icon={faUser} className={styles.iconUserRegister} />
        </div>
      </div>

      <div className={styles.login}>
        <h2 className={styles.loginHeader}>เข้าสู่ระบบ</h2>

        {/* <form className={styles.loginForm} noValidate> */}
        <form onSubmit={handleSubmit} className={styles.loginForm} noValidate>
          <div className={styles.inputContainer}>
            <FontAwesomeIcon icon={faUser} className={styles.IconInput} />
            <input
              type="text"
              placeholder="ชื่อผู้ใช้"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              // autocomplete —>เพื่อ "ไม่ให้ Browser จำค่าที่เคยกรอกไว้" แล้วเติมค่าให้โดยอัตโนมัติ ทำให้ตอนโหลดหน้าใหม่ช่อง username ไม่มีค่าเป็น "Admin"
              autoComplete="new-username"
            />
          </div>

          <div className={styles.inputContainer}>
            <FontAwesomeIcon icon={faLock} className={styles.IconInput} />
            <input
              type="password"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              // required
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <div className={styles.inputContainer}>
            <FontAwesomeIcon icon={faUser} className={styles.IconInput} />
            <input
              type="text"
              placeholder="ชื่อองค์กร"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className={styles.ChangePassword}>
            <Link href="/pages/changpassword" className={styles.ForgotPassword}>
              เปลี่ยนรหัสผ่าน ?
            </Link>
          </div>

          <div className={styles.buttonCentered}>
            <button
              type="submit"
              className={styles.btnLogin}
              disabled={isLoading}
              // onClick={handleSubmit}
            >
              {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </div>

          <div className={styles.buttonCentered}>
            <button
              type="button"
              onClick={handleRegisterClick}
              className={styles.btnLogin}
            >
              ลงทะเบียน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
