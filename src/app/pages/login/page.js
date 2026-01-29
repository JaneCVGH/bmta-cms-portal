// <-------------- Login -------------->

"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faUser, faBuilding } from "@fortawesome/free-solid-svg-icons";

// SweetAlert2
import Swal from "sweetalert2";

// CSS
import styles from "../../style/login.module.css";

// ================== Component ==================
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [organization, setOrganization] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    console.log("API BASE =", process.env.NEXT_PUBLIC_API_BASE_URL);
  }, []);

  const handleRegisterClick = () => {
    console.log("กำลังลงทะเบียน...");
    router.push("/pages/register");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // ------ตรวจสอบ ชื่อผู้ใช้งาน รหัสผ่าน และ ชื่อองค์กร-------
    if (!username.trim() && !password.trim() && !organization.trim()) {
      // ----------ชื่อผู้ใช้งาน รหัสผ่าน และ ชื่อองค์กร ว่าง----------
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: "กรุณากรอกชื่อผู้ใช้งาน รหัสผ่าน และ ชื่อองค์กรให้ถูกต้อง",
        confirmButtonText: "ตกลง",
        iconColor: "#ff9500",
      });
      setIsLoading(false);
      return;
    }

    // ---------- ชื่อผู้ใช้งาน ว่าง----------
    if (!username.trim()) {
      Swal.fire({
        icon: "warning",
        title: "ชื่อผู้ใช้งานไม่ถูกต้อง",
        text: "กรุณากรอกชื่อผู้ใช้งานให้ถูกต้อง",
        confirmButtonText: "ตกลง",
        iconColor: "#ff9500",
      });
      setIsLoading(false);
      return;
    }

    // ---------- รหัสผ่าน ว่าง----------
    if (!password.trim()) {
      Swal.fire({
        icon: "warning",
        title: "รหัสผ่านไม่ถูกต้อง",
        text: "กรุณากรอกรหัสผ่านให้ถูกต้อง",
        confirmButtonText: "ตกลง",
        iconColor: "#ff9500",
      });
      setIsLoading(false);
      return;
    }

    // ---------- องค์กร ว่าง----------
    if (organization.trim().toUpperCase() !== "BMA") {
      Swal.fire({
        icon: "warning",
        title: "องค์กรไม่ถูกต้อง",
        text: "กรุณากรอกองค์กรให้ถูกต้อง",
        confirmButtonText: "ตกลง",
        iconColor: "#ff9500",
      });
      setIsLoading(false);
      return;
    }
    // --------------------- Call API ---------------------
    let data = null;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            username,
            password,
            organization,
          }),
        },
      );

      // // ---------- Error Handling ----------
      // const result = await response.json();

      // // ---------- username ไม่ถูก ----------
      // if (!response.ok && result?.detail === "USER_NOT_FOUND") {
      //   Swal.fire(
      //     "ชื่อผู้ใช้งานไม่ถูกต้อง",
      //     "กรุณากรอกชื่อผู้ใช้งานให้ถูกต้อง",
      //     "error",
      //   );
      //   return;
      // }

      // // ---------- password ไม่ถูก ----------
      // if (!response.ok && result?.detail === "INVALID_PASSWORD") {
      //   Swal.fire("รหัสผ่านไม่ถูกต้อง", "กรุณากรอกรหัสผ่านให้ถูกต้อง", "error");
      //   return;
      // }

      // // ---------- error อื่น ----------
      // if (!response.ok) {
      //   Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถเข้าสู่ระบบได้", "error");
      //   return;
      // }

      //console.log(response)
      // ค่อย parse JSON เฉพาะกรณี success
      // const data = result;
      // console.log("FULL LOGIN RESPONSE =", result);
      // console.log("LOGIN DATA ONLY =", result.data);

      // const data = await response.json();
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      console.log("FULL LOGIN RESPONSE =", data);
      console.log("LOGIN DATA ONLY =", data.data);
      console.log("USER DATA =", data.data?.user);

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
        localStorage.setItem("token_expire_at", expireAt.toString()); // เก็บเวลา Expire

        // ข้อมูล user ใน localStorage
        localStorage.setItem("user_data", JSON.stringify(data.data.user));
        localStorage.setItem("user_id", user.id.toString());
        localStorage.setItem("username", user.username);
        localStorage.setItem("user_role", user.role);
        localStorage.setItem("is_verified", user.active?.toString() || "false");

        console.log("ACCESS TOKEN =", data.data.accessToken);

        // เก็บ Permission ไว้เช็คเมนู บน navbar
        // if (Array.isArray(user.permission)) {
        //   localStorage.setItem("permissions", JSON.stringify(user.permission));
        // } else {
        //   localStorage.setItem("permissions", JSON.stringify([])); // ป้องกัน error
        // }
        // if (Array.isArray(user.permission?.cms)) {
        //   localStorage.setItem(
        //     "permissions",
        //     JSON.stringify(user.permission.cms),
        //   );
        // } else {
        //   localStorage.setItem("permissions", JSON.stringify([]));
        // }

        //localStorage.setItem('user_id', data.user.id.toString());
        //localStorage.setItem('username', data.user.username);
        //localStorage.setItem('user_role', data.user.role);
        //localStorage.setItem('is_verified', data.user.is_verified.toString());

        localStorage.setItem(
          "permissions",
          JSON.stringify(user.permission?.cms || []),
        );

        // ----------เข้าสู่ระบบสำเร็จ----------
        Swal.fire({
          icon: "success",
          title: "เข้าสู่ระบบสำเร็จ",
          text: `ยินดีต้อนรับ ${user.username || ""}`,
          confirmButtonText: "OK",
        }).then(() => {
          router.push("../../pages/home");
        });
      } else {
        const messageMap = {
          USER_NOT_FOUND: "ชื่อผู้ใช้งานไม่ถูกต้อง",
          INVALID_PASSWORD: "รหัสผ่านไม่ถูกต้อง",
        };

        Swal.fire({
          icon: "error",
          title: "เข้าสู่ระบบไม่สำเร็จ",
          text:
            messageMap[data.detail] ||
            "กรุณากรอก ชื่อผู้ใช้ และ รหัสผ่านให้ถูกต้อง",
          confirmButtonText: "ลองอีกครั้ง",
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

  // ================== UI ==================
  return (
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
              disabled={isLoading}
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
              disabled={isLoading}
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
            >
              เข้าสู่ระบบ
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
