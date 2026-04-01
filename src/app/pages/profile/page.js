"use client";

import { useEffect, useState } from "react";
import styles from "../../style/profile.module.css";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const username = localStorage.getItem("username");

        // ❗ ถ้าไม่มี token → เด้ง login
        if (!token || !username) {
          router.push("/pages/login");
          return;
        }

        const res = await fetch(
          `https://welcome-service-stg.metthier.ai:65000/api/v1/users/username/${username}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // ❗ token หมดอายุ
        if (res.status === 401) {
          localStorage.removeItem("accessToken");
          router.push("/pages/login");
          return;
        }

        const data = await res.json();

        if (data.status === "0") {
          const userData = data.data;

          // ✅ parse address JSON
          let addressObj = {};
          try {
            addressObj = JSON.parse(userData.address || "{}");
          } catch {
            addressObj = {};
          }

          setUser({
            ...userData,
            addressObj,
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchUser();
  }, [router]);

  // ✅ format วันที่
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!user) return <div className={styles.loading}>Loading...</div>;

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.profileLeft}>
            <img
              src={user.photo || "/default-avatar.png"}
              className={styles.avatar}
            />

            <div>
              <h2>{user.displayName}</h2>
              <p>{user.email}</p>

              <p className={styles.address}>
                {user.addressObj?.street} {user.addressObj?.building},{" "}
                {user.addressObj?.district}, {user.addressObj?.province}{" "}
                {user.addressObj?.postalCode}
              </p>
            </div>
          </div>

          {/* <div className={styles.actions}>
            <button className={styles.editBtn}>แก้ไข</button>
            <button className={styles.passwordBtn}>เปลี่ยนรหัสผ่าน</button>
          </div> */}
        </div>

        {/* PERSONAL */}
        <div className={styles.card}>
          <h3>ข้อมูลส่วนบุคคล</h3>

          <div className={styles.grid}>
            <div>
              <label>ชื่อ</label>
              <p>{user.firstName}</p>
            </div>

            <div>
              <label>นามสกุล</label>
              <p>{user.lastName || "-"}</p>
            </div>

            <div>
              <label>อีเมล</label>
              <p>{user.email}</p>
            </div>

            <div>
              <label>เบอร์มือถือ</label>
              <p>{user.mobileNo}</p>
            </div>

            <div>
              <label>เลขบัตรประชาชน</label>
              <p>{user.citizenId}</p>
            </div>

            <div>
              <label>วันเกิด</label>
              <p>{formatDate(user.bod)}</p>
            </div>

            <div>
              <label>เพศ</label>
              <p>{user.gender === "9" ? "อื่นๆ" : user.gender}</p>
            </div>

            <div>
              <label>กรุ๊ปเลือด</label>
              <p>{user.blood}</p>
            </div>
          </div>
        </div>

        {/* ORGANIZATION */}
        <div className={styles.card}>
          <h3>ข้อมูลหน่วยงาน</h3>

          <div className={styles.grid}>
            <div>
              <label>รหัสพนักงาน</label>
              <p>{user.empId}</p>
            </div>

            <div>
              <label>ประเภทผู้ใช้</label>
              <p>{user.userType === "1" ? "ภายใน" : "-"}</p>
            </div>

            <div>
              <label>องค์กร</label>
              <p>{user.orgName}</p>
            </div>

            <div>
              <label>สิทธิ์การใช้งาน</label>
              <p>{user.roleName}</p>
            </div>

            <div>
              <label>สถานะ</label>
              <span className={user.active ? styles.active : styles.inactive}>
                {user.active ? "ใช้งาน" : "ปิดใช้งาน"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
