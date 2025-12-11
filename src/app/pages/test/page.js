//project/page.js

// 'use client';
// import { useState, useEffect } from 'react';
// // import ProjectModal from '../../components/ProjectModal';
// import Navbar from "../../components/Navbar";
// // import styles from "../../style/project.module.css"
// import Swal from 'sweetalert2';

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//     faPencil,
//     faEye,
//     faTrash,
//     faSquarePlus,
//     faUserTie, 
//     faImage,
//     faMagnifyingGlass,
//     faCaretDown
// } from "@fortawesome/free-solid-svg-icons";

// export default function ProjectPage() {
//   const [projects, setProjects] = useState([]);
//    const [showModal, setShowModal] = useState(false);
//  const [modalType, setModalType] = useState('add');
//   const [formData, setFormData] = useState({
//     idProject: '',
//     name: '',
//     description: '',
//     start_date: '',
//     end_date: ''
//   });

//   const fetchProjects = async () => {
//     const res = await fetch('http://localhost:8000/project');
//     const data = await res.json();
//     setProjects(Array.isArray(data) ? data : []);
//   };

//   useEffect(() => {
//     fetchProjects();
//   }, []);

//   const handleChange = (e) => {
//     setFormData({...formData, [e.target.name]: e.target.value});
//   };

//   const handleOpenModal = (type, project = null) => {
//     setModalType(type);
//     setFormData({
//       idProject: project?.idProject || '',
//       name: project?.name || '',
//       description: project?.description || '',
//       start_date: project?.start_date || '',
//       end_date: project?.end_date || ''
//     });
//     setShowModal(true);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const method = modalType === 'edit' ? 'PUT' : 'POST';
//     const url = `http://localhost:8000/project${modalType === 'edit' ? `/${formData.idProject}` : ''}`;

//     try {
//       const res = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       });

//       if (res.ok) {
//         fetchProjects();
//         setShowModal(false);
//         Swal.fire("สำเร็จ", "ข้อมูลถูกบันทึกเรียบร้อย", "success");
//       }
//     } catch (err) {
//       console.error("Error saving project:", err);
//     }
//   };

// const handleDelete = async (idProject) => {
//     const result = await Swal.fire({
//       title: 'คุณแน่ใจหรือไม่?',
//       text: 'การลบจะไม่สามารถย้อนกลับได้!',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#dc3545',
//       cancelButtonText: 'ยกเลิก',
//       confirmButtonText: 'ยืนยัน'
//     });

//     if (result.isConfirmed) {
//       await fetch(`http://localhost:8000/project/${idProject}`, {
//         method: 'DELETE'
//       });
//       fetchProjects();
//       Swal.fire("ลบแล้ว", "โปรเจกต์ถูกลบเรียบร้อย", "success");
//     }
//   };

//   // const handleEdit = (project) => {
//   //   setEditProject(project);
//   //   setShowModal(true);
//   // };

  
//   // const handleView = (project) => {
//   //   alert(ดูรายละเอียดโปรเจกต์: ${project.name});
//   //   // หรือคุณจะใช้ modal หรือ router.push ไปหน้าอื่นก็ได้
//   // };

//   return (
//     <>
//       <Navbar />
//       <div className={styles.ProjectList}>
//         <div className={styles.ProjectHeaderRow}>
//           <h1 className={styles.Projectheader}>รายการโปรเจกต์</h1>
//           <button
//             className={styles.AddBtnProject}
//             onClick={() => handleOpenModal('add')}>
//             <FontAwesomeIcon icon={faSquarePlus} /> เพิ่มโปรเจกต์
//           </button>
//         </div>

//         <div className={styles.ProjectList}>
//           {projects.map((proj) => (
//             <div key={proj._id} className={styles.ProjectCard}>
//               <div className={styles.ProjectCardTopRow}>
//                 <div className={styles.ProjectCardName}>{proj.name}</div>
//                   <div className={styles.ProjectCardActions}>

//                     <button className={styles.ViewBtn} onClick={() => handleOpenModal('view', proj)}>
//                       <FontAwesomeIcon icon={faEye} /> ดู
//                     </button>
//                     <button className={styles.EditBtn} onClick={() => handleOpenModal('edit', proj)}>
//                       <FontAwesomeIcon icon={faPencil} /> แก้ไข
//                     </button>
//                     <button className={styles.DeleteBtn} onClick={() => handleDelete(proj.idProject)}>
//                       <FontAwesomeIcon icon={faTrash} /> ลบ
//                     </button>
//                   </div>
//                 </div>
//               <div className={styles.ProjectCardDesc}>{proj.description}</div>
//               <div className={styles.ProjectCardDate}>
//                 <span>เริ่ม: {proj.start_date}</span> | <span>สิ้นสุด: {proj.end_date}</span>
//               </div>
//             </div>
//           ))}
//         </div>

//         {showModal && (
//           <ProjectModal
//             show={showModal}
//             type={modalType}
//             formData={formData}
//             handleChange={handleChange}
//             handleSubmit={handleSubmit}
//             onClose={() => setShowModal(false)}
//           />
//         )}
//       </div>
//     </>
//   );
// }
