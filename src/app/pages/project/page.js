// project/page.js

'use client';
import { useState, useEffect } from 'react';
import ProjectModal from '../../components/ProjectModal';
import Navbar from '../../components/Navbar';
import styles from '../../style/project.module.css';
import Swal from 'sweetalert2';
import TaskModal from '../../components/TaskModal';
import { v4 as uuidv4 } from 'uuid';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPencil,
    faEye,
    faTrash,
    faSquarePlus,
    faUserTie, 
    faImage,
    faMagnifyingGlass,
    faCaretDown
} from "@fortawesome/free-solid-svg-icons";

export default function ProjectPage() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [formData, setFormData] = useState({
    idProject: '',
    name: '',
    description: '',
    start_date: '',
    end_date: ''
  });

  const [taskModalType, setTaskModalType] = useState('add');
  const [showTaskModal, setShowTaskModal] = useState(false);
  
  const [tasksByProject, setTasksByProject] = useState({});
  const [openProjectId, setOpenProjectId] = useState(null);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    idTask: '',
    title: '',
    status: 'pending',
    due_date: ''
  });

   const parseDateToInputFormat = (dateStr) => {
      if (!dateStr) return "";
      const [day, month, year] = dateStr.split("/");
      return `${year}-${month}-${day}`;
    };


  const fetchProjects = async () => {
    const res = await fetch('http://localhost:8000/project');
    const data = await res.json();
    setProjects(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // -------Project-------
  const handleOpenModal = (type, project = null) => {
    setModalType(type);
    setFormData({
      idProject: project?.idProject || generateUniqueProjectId(),
      name: project?.name || '',
      description: project?.description || '',
      start_date: project?.start_date ? parseDateToInputFormat(project.start_date) : '',
      end_date: project?.end_date ? parseDateToInputFormat(project.end_date) : ''
    });
    setShowModal(true);
  };

  const generateUniqueProjectId = () => {
    const prefix = 'P';
    const randomNumbers = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${randomNumbers}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = modalType === 'edit' ? 'PUT' : 'POST';
    const url = `http://localhost:8000/project${modalType === 'edit' ? `/${formData.idProject}` : ''}`;

    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      const [year, month, day] = dateStr.split("-");
      const buddhistYear = parseInt(year);
      return `${day}/${month}/${buddhistYear}`;
    };

    const payload = {
      ...formData,
      start_date: formatDate(formData.start_date),
      end_date: formatDate(formData.end_date)
    };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log("🔎 Request URL:", url);
    console.log("📦 Payload:", payload);
    console.log("📡 Response status:", res.status);

    if (res.ok) {
      fetchProjects();
      setShowModal(false);
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: 'ข้อมูลโปรเจกต์ถูกบันทึกเรียบร้อยแล้ว',
        confirmButtonText: 'ตกลง'
      });
    } else {
      try {
        const errorText = await res.text();
        console.error("❌ API Error:", errorText);
        Swal.fire("เกิดข้อผิดพลาด", errorText || "ไม่สามารถบันทึกข้อมูลได้", "error");
      } catch (err) {
        Swal.fire("เกิดข้อผิดพลาด", "เกิดข้อผิดพลาดจากระบบหรือข้อมูลไม่ถูกต้อง", "error");
        console.error("❌ JSON parse error:", err);
      }
    }
  };

  const handleDelete = async (idProject) => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'การลบจะไม่สามารถย้อนกลับได้!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonText: 'ยกเลิก',
      confirmButtonText: 'ยืนยัน'
    });

    if (result.isConfirmed) {
      await fetch(`http://localhost:8000/project/${idProject}`, {
        method: 'DELETE'
      });
      fetchProjects();
       Swal.fire({
        icon: 'success',
        title: 'ลบแล้ว',
        text: 'ข้อมูลโปรเจกต์ถูกลบเรียบร้อย',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  // -------Task-------
  // const handleToggleTasks = async (idProject) => {
  //   if (openProjectId === idProject) {
  //     setOpenProjectId(null);
  //   } else {
  //     setOpenProjectId(idProject);
  //     const res = await fetch(`http://localhost:8000/project/${idProject}/tasks`);
  //     const data = await res.json();
  //     setTasksByProject(prev => ({ ...prev, [idProject]: data }));
  //   }
  // };

  // -------Task-------
  const handleToggleTasks = async (idProject) => {
    if (openProjectId === idProject) {
      setOpenProjectId(null);
    } else {
      setOpenProjectId(idProject);
      await refreshTasks(idProject);
    }
  };
    const refreshTasks = async (projectId) => {
    const res = await fetch(`http://localhost:8000/project/${projectId}/tasks`);
    const data = await res.json();
    setTasksByProject(prev => ({ ...prev, [projectId]: data }));
  };


  const handleOpenTaskModal = (type, projectId, task = null) => {
    setTaskModalType(type);
    setCurrentProjectId(projectId);
    setTaskFormData({
      idTask: task?.idTask || '',
      title: task?.title || '',
      status: task?.status || 'pending',
      due_date: task?.due_date || ''
    });
    setShowTaskModal(true);
  };

  const handleTaskChange = (e) => {
    setTaskFormData({ ...taskFormData, [e.target.name]: e.target.value });
  };

  
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    const method = taskModalType === 'edit' ? 'PUT' : 'POST';
    const url = taskModalType === 'edit'
      ? `http://localhost:8000/task/${taskFormData.idTask}`
      : `http://localhost:8000/task`;

    const payload = {
      ...taskFormData,
      idTask: taskFormData.idTask || uuidv4(),  
      idProject: currentProjectId
    };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setShowTaskModal(false);
      const refreshed = await fetch(`http://localhost:8000/project/${currentProjectId}/tasks`);
      const updatedTasks = await refreshed.json();
      setTasksByProject(prev => ({ ...prev, [currentProjectId]: updatedTasks }));

       Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: 'ข้อมูล Task ถูกบันทึกเรียบร้อยแล้ว',
        confirmButtonText: 'ตกลง'
      });
    }
      else {
      const errText = await res.text();
      Swal.fire("เกิดข้อผิดพลาด", errText || "ไม่สามารถบันทึก Task ได้", "error");
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirm = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'การลบ Task จะไม่สามารถย้อนกลับได้!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#dc3545',     
      cancelButtonColor: '#A9A9A9'
    });

    if (confirm.isConfirmed) {
      await fetch(`http://localhost:8000/task/${taskId}`, { method: 'DELETE' });
      await refreshTasks(currentProjectId);
       Swal.fire({
        icon: 'success',
        title: 'ลบแล้ว',
        text: 'ข้อมูล Task ถูกลบเรียบร้อย',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.ProjectList}>
        <div className={styles.ProjectHeaderRow}>
          <h1 className={styles.Projectheader}>รายการโปรเจกต์</h1>
          <button
            className={styles.AddBtnProject}
            onClick={() => handleOpenModal('add')}>
            <FontAwesomeIcon icon={faSquarePlus} /> เพิ่มโปรเจกต์
          </button>
        </div>

        <div className={styles.ProjectList}>
          {projects.map((proj) => (
            <div key={proj._id} className={styles.ProjectCard}>
              <div className={styles.ProjectCardTopRow}>
                <div className={styles.ProjectCardName}>{proj.name}</div>
                <div className={styles.ProjectCardActions}>
                  <button className={styles.ViewBtn} onClick={() => handleOpenModal('view', proj)}>
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  <button className={styles.EditBtn} onClick={() => handleOpenModal('edit', proj)}>
                    <FontAwesomeIcon icon={faPencil} />
                  </button>
                  <button className={styles.DeleteBtn} onClick={() => handleDelete(proj.idProject)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                  <button className={styles.AddTaskBtn} onClick={() => handleToggleTasks(proj.idProject)}>
                    <FontAwesomeIcon icon={faCaretDown} /> 
                  </button>
                </div>
              </div>
              <div className={styles.ProjectCardDate}>
                <span>เริ่ม: {proj.start_date}</span> | <span>สิ้นสุด: {proj.end_date}</span>
              </div>

              {openProjectId === proj.idProject && tasksByProject[proj.idProject] && (
                <div className={styles.TaskList}>
                  <div className={styles.TaskButtonContainer}>
                    <h4 className={styles.TaskHeader}>รายการ Task</h4>
                    <button className={styles.AddTaskButton} onClick={() => handleOpenTaskModal('add', proj.idProject)} >
                      <FontAwesomeIcon icon={faSquarePlus} /> เพิ่ม Task
                    </button>
                  </div>

                  <ul>
                    {tasksByProject[proj.idProject].map(task => (
                      <li key={task.idTask}>
                        <div className={styles.TaskRow}>
                          <div className={styles.TaskHeaderRow}>
                            <div className={styles.TaskTitle}>
                              <strong className={styles.InputNametask}>ชื่อ Task: {task.title}</strong>
                            </div>
                            <div className={styles.TaskActionButtons}>
                              <button className={styles.ViewBtnTask} onClick={() => handleOpenTaskModal('view', proj.idProject, task)}>
                                <FontAwesomeIcon icon={faEye} />
                              </button>
                              <button className={styles.EditBtnTask} onClick={() => handleOpenTaskModal('edit', proj.idProject, task)}>
                                <FontAwesomeIcon icon={faPencil} />
                              </button>
                              <button className={styles.DeleteBtnTask} onClick={() => handleDeleteTask(task.idTask)}>
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </div>
                          <div className={styles.inputTask}>
                            <strong className={styles.InputStatetask}>สถานะ {task.status}</strong>
                          </div>
                          <div className={styles.inputTask}>
                            <strong className={styles.InputDatetask}>วันครบกำหนด {task.due_date}</strong>
                          </div>   
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {showModal && (
          <ProjectModal
            show={showModal}
            type={modalType}
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            onClose={() => setShowModal(false)}
          />
        )}

        {showTaskModal && (
          <TaskModal
            show={showTaskModal}
            type={taskModalType}
            formData={taskFormData}
            handleChange={handleTaskChange}
            handleSubmit={handleTaskSubmit}
            onClose={() => setShowTaskModal(false)}
          />
        )}
      </div>
    </>
  );
}

// project สามารถ
// 1. เพิ่ม,แก้ไข,ลบ project
// 2. เพิ่มเพิ่ม,แก้ไข,ลบ Task ใน project 

// บันทึก

