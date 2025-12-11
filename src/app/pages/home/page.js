//บอกให้ Next.js รู้ว่าไฟล์นี้ทำงานฝั่ง Client Side, จำเป็นเมื่อคุณใช้ Next.js App Router 
"use client"

//ใช้ useEffect() เพื่อรันโค้ดเมื่อ component ถูกโหลด
// import { useState } from "react";

 // useRouter ใช้สำหรับนำทางไปยังหน้าอื่น, next/navigation คือเวอร์ชันใหม่ที่ใช้ใน App Router
//import { useRouter } from "next/navigation";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {//เพิ่มไอคอน 
//     faLock,
//     //faUser,
//     //faPencil,
//     //faTrashCan
// } from "@fortawesome/free-solid-svg-icons";

import Navbar from "../../components/Navbar";
//เพราะ ../../ หมายถึงย้อนกลับ 2 ชั้นจาก pages/home/ ไปหา style///
import styles from "../../style/./home.module.css";



export default function Homepage(){

    return(
        <div className={styles.homepage}>
            <Navbar/>
            <h1 className={styles.title}> ยินดีต้อนรับเข้าสู่เว็บไซต์ของเรา </h1>
            <img src= "/picture/home.png" alt="Home image" className={styles.image}/>
        </div>
        
    );
}