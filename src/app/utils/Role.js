export async function getUserRole() {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const res = await fetch(
      "https://welcome-service-stg.metthier.ai:65000/api/v1/role?start=0&length=10",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,   // ถ้า API ใส่ token
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    // ตรวจสอบว่ามีข้อมูล role ไหม
    if (data.status !== "0" || !data.data || data.data.length === 0) {
      return null;
    }

    // *** ดึง role แรกของผู้ใช้ ***
    return data.data[0].role_name; // ปรับตาม field จริง
  } catch (err) {
    console.error("Error fetch role", err);
    return null;
  }
}
