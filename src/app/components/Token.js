// // src/app/component/token.js

// // **--- บันทึก Token ลง localStorage ---**
// export const setToken = (data) => {
//   if (!data) return;

//   localStorage.setItem("access_token", data.access_token);
//   localStorage.setItem("refresh_token", data.refresh_token);
//   localStorage.setItem("token_type", data.token_type);

//   localStorage.setItem("user_data", JSON.stringify(data.user));
//   localStorage.setItem("user_id", data.user.id.toString());
//   localStorage.setItem("username", data.user.username);
//   localStorage.setItem("user_role", data.user.role);
//   localStorage.setItem(
//     "is_verified",
//     data.user.is_verified?.toString() || "false"
//   );
// };

// // **--- ดึง Access Token ไปใช้ ---**
// export const getToken = () => {
//   return localStorage.getItem("access_token");
// };

// // **--- ดึงข้อมูลผู้ใช้ ---**
// export const getUser = () => {
//   const user = localStorage.getItem("user_data");
//   return user ? JSON.parse(user) : null;
// };

// // **--- ลบ Token ตอน Logout---**
// export const clearToken = () => {
//   localStorage.removeItem("access_token");
//   localStorage.removeItem("refresh_token");
//   localStorage.removeItem("token_type");
//   localStorage.removeItem("user_data");
//   localStorage.removeItem("user_id");
//   localStorage.removeItem("username");
//   localStorage.removeItem("user_role");
//   localStorage.removeItem("is_verified");
// };
