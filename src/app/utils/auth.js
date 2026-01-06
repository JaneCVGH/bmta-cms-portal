export async function getValidAccessToken() {
  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");
  const expireAt = localStorage.getItem("token_expire_at");

  if (!accessToken || !refreshToken || !expireAt) {
    return null; // Token ไม่ครบ
  }

  const isExpired = Date.now() > Number(expireAt);

  if (!isExpired) {
    return accessToken; // Token ยังไม่หมดอายุ
  }

  // Token หมดอายุ → ทำ Refresh
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/refresh`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    );

    const data = await response.json();

    if (response.ok && data.access_token) {
      const expiresIn = 15 * 60 * 1000; // 15 นาที
      const newExpireAt = Date.now() + expiresIn;

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token_expire_at", newExpireAt.toString());

      return data.access_token;
    } else {
      // refresh ไม่ผ่าน → ต้อง Login ใหม่
      localStorage.clear();
      return null;
    }
  } catch (err) {
    console.error("Refresh token error:", err);
    localStorage.clear();
    return null;
  }
}
