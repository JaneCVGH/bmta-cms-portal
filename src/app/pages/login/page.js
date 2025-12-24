//<--------------Login-------------->
// วิธี Run
// 1. cd frontend
// 2. mpm install
// 3.npm install sweetalert2
// 4.  npm install sweetalert2 @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons @fortawesome/fontawesome-svg-core


//บอกให้ Next.js รู้ว่าไฟล์นี้ทำงานฝั่ง Client Side, จำเป็นเมื่อคุณใช้ Next.js App Router 
"use client"

//ใช้ useEffect() เพื่อรันโค้ดเมื่อ component ถูกโหลด
import React, { useState } from "react";

//useRouter ใช้สำหรับนำทางไปยังหน้าอื่น, next/navigation คือเวอร์ชันใหม่ที่ใช้ใน App Router
import { useRouter } from "next/navigation";
import Link from 'next/link';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {//เพิ่มไอคอน 
    faLock,
    faUser,
    faBuilding,
 } from "@fortawesome/free-solid-svg-icons";

//weetalert2 เป็นไลบรารี JavaScript สำหรับแสดง popup สวยงาม
import Swal from 'sweetalert2';

//เพราะ ../../ หมายถึงย้อนกลับ 2 ชั้นจาก pages/home/ ไปหา style///
import styles from "../../style/./login.module.css";
//import { run } from "node:test";

// function หลัก
export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  

   const handleRegisterClick = () => {
    //เพิ่ม console.log เพื่อดูว่าเรียกจริงไหม
    console.log("กำลังลงทะเบียน...");
    router.push("/pages/register"); // เส้นทางไปยังหน้า /register
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

     if (!username.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Information!',
        text: 'กรุณากรอกชื่อผู้ใช้งาน',
        confirmButtonText: 'OK',
        iconColor: '#ff9500'
      });
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Information!',
        text: 'กรุณากรอกรหัสผ่าน',
        confirmButtonText: 'OK',
        iconColor: '#ff9500'
      });
      setIsLoading(false);
      return;
    }

    if (organization.trim().toUpperCase() !== 'SKY-AI') {
    Swal.fire({
    icon: 'error',
    title: 'Access Denied',
    text: 'องค์กรไม่ถูกต้อง',
    confirmButtonText: 'OK',
  });
  setIsLoading(false);
  return;
}

 // --------------------- Call API ---------------------
     
      // ตรวจสอบว่าได้ค่า URL ถูกต้องไหม
      //console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
      // เชื่อมต่อกับ FastAPI backend
      //const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      //  method: 'POST',
      //  headers: { 'Content-Type': 'application/json'},
       // body: JSON.stringify({ 
        //  username, 
        //  password
        //})
       try { 
        const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`,
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

      //console.log(response)
      const data = await response.json();
      console.log("LOGIN RESPONSE =", data);

      
  
    
// --------------------- Success ---------------------
        if (response.ok && data?.data?.accessToken) {
        const user = data.data.user;
        const accessToken = data.data.accessToken;
        const refreshToken = data.data.refreshToken;
          // **เก็บ token และข้อมูล user ใน localStorage**
        const expiresIn = 15 * 60 * 1000; // 15 นาที 
        const expireAt = Date.now() + expiresIn;
        
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem('token_expire_at', expireAt.toString());   // เก็บเวลา Expire
       
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        //localStorage.setItem("permissions", JSON.stringify(data.user.permissions));

        // ข้อมูล user ใน localStorage
         localStorage.setItem("user_data", JSON.stringify(data.data.user));
        localStorage.setItem("user_id", user.id.toString());
        localStorage.setItem("username", user.username);
        localStorage.setItem("user_role", user.role);
        localStorage.setItem("is_verified",user.active?.toString() || "false");

        console.log("ACCESS TOKEN =", data.data.accessToken);
        
        // เก็บ Permission ไว้เช็คเมนู
        if (Array.isArray(user.permission)) {
          localStorage.setItem("permissions", JSON.stringify(user.permission));
        } else {
          localStorage.setItem("permissions", JSON.stringify([])); // ป้องกัน error
        }
        
        //localStorage.setItem('user_id', data.user.id.toString());
        //localStorage.setItem('username', data.user.username);
        //localStorage.setItem('user_role', data.user.role);
        //localStorage.setItem('is_verified', data.user.is_verified.toString());
        

        Swal.fire({
          icon: "success",
          title: "เข้าสู่ระบบสำเร็จ",
          text: `ยินดีต้อนรับ ${data.data.user.username || ""}`,
          confirmButtonText: "OK",
        }).then(() => {
          router.push("../../pages/home");
        });
      }
       
       else {
        Swal.fire({
          icon: 'error',
          title: 'เข้าสู่ระบบไม่สำเร็จ',
          text: data.detail || 'กรุณากรอก ชื่อผู้ใช้ และ รหัสผ่านให้ถูกต้อง',
          confirmButtonText: 'Try Again'
        });
      }
      
    } catch (error) {
      console.error('Login error:', error);
      Swal.fire({
        icon: 'error',
        title: 'เข้าสู่ระบบไม่สำเร็จ',
        text: 'กรุณาลงทะเบียนก่อนเข้าสู่ระบบอีกครั้ง',
        confirmButtonText: 'OK'
      });

    } finally {
      setIsLoading(false);
    }
  };


  return(
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <div className={styles.iconRegister}>
          <FontAwesomeIcon icon={faUser} className={styles.iconUserRegister} />
        </div>
      </div>

      <div className={styles.login}>
        <h2 className={styles.loginHeader}>เข้าสู่ระบบ</h2>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
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
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <div className={styles.inputContainer}>
  <FontAwesomeIcon icon={faBuilding} className={styles.IconInput} />
  <input
    type="text"
    placeholder="องค์กร"
    value={organization}
    onChange={(e) => setOrganization(e.target.value)}
    required
    disabled={isLoading}
  />
</div>


          <div className={styles.ChangePassword}>
            <Link href="/pages/changpassword" className={styles.ForgotPassword}>
              เปลี่ยนรหัสผ่าน ?
            </Link>
          </div>

          <div className={styles.buttonCentered}>
            <button type="submit" className={styles.btnLogin} disabled={isLoading}>
              เข้าสู่ระบบ
            </button>
          </div>

          <div className={styles.buttonCentered}>
            <button type="button" onClick={handleRegisterClick} className={styles.btnLogin}>
              ลงทะเบียน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}