"use client";
import React, { useState } from "react";
import { useEffect } from 'react';
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from"../../style/register.module.css";   
import Swal from "sweetalert2";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faUser, faEye } from "@fortawesome/free-solid-svg-icons";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//   document.body.style.background = 'linear-gradient(to right, #4e54c8, #8f94fb)';
//   return () => {
//     document.body.style.background = '';
//   };
// }, []);

// const LoginComponent = dynamic(() => import("../components/Login"), {
//   ssr: false
// });


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!username.trim() || !password.trim()) {
      Swal.fire("Incomplete Information!", "กรุณากรอกให้ครบ", "warning");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "https://welcome-service-stg.metthier.ai:65000/api/v1/auth/login",
        // `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // credentials: "include",
          body: JSON.stringify({ username, password }),
        }
      );

      if (res.ok) {
        Swal.fire("ลงทะเบียนสำเร็จ", "กรุณาเข้าสู่ระบบ", "success").then(() => {
          router.push("../../pages/login");
        });
      } else {
        const data = await res.json();
        Swal.fire("Error", data.detail || "ไม่สามารถลงทะเบียนได้", "error");
      }
      //
    } catch (err) {
        console.error(err);
        Swal.fire("Error", "เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ", "error");
      } finally {
        setIsLoading(false);
      }
    };

   return (
    <div className={styles.container}>
      {/* ไอคอนอยู่นอกกล่อง register */}
      <div className={styles.iconWrapper}>
        <FontAwesomeIcon icon={faUser} className={styles.icon} />
      </div>

      <div className={styles.register}>
        <h2 className={styles.registerHeader}> สมัครสมาชิก</h2>

        <form onSubmit={handleSubmit} className={styles.registerForm}>
          <div className={styles.inputContainer}>
            <input
              type="text"
              placeholder="ชื่อผู้ใช้"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              autoComplete="off"
            />
          </div>

          <div className={styles.inputContainer}>
            <input
              type="password"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="off"
            />
          </div>

          <div className={styles.buttonCentered}>
            <button type="submit" className={styles.btnRegister} disabled={isLoading}>
              {isLoading ? "Registering..." : "สมัครสมาชิก"}
            </button>
          </div>
        </form>

        <div>
          <Link href="/pages/login" className={styles.loginLink}>
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
}
