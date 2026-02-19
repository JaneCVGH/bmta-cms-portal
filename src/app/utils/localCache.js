//localCache.js
export const saveToCache = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getFromCache = (key) => {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
};

export const getOrFetch = async (key, url, token, forceRefresh = false) => {
  if (!forceRefresh) {
    const cached = getFromCache(key);
    if (cached) {
      console.log(`Using cached data for ${key}`);
      return cached;
    }
  }

  console.log(`Fetching API for ${key}`);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`API failed: ${res.status}`);
  }

  const text = await res.text();

  // 🚨 API ตอบว่าง → ใช้ cache เดิม
  if (!text) {
    console.warn("Empty response body from API:", url);

    const fallback = getFromCache(key);
    if (fallback) {
      console.warn("Fallback to cached data");
      return fallback;
    }

    // ไม่มี cache เลย → คืน null
    return null;
  }

  //const text = await res.text();

if (!text) {
  console.warn("Empty response body:", url);
  const fallback = getFromCache(key);
  if (fallback) return fallback;
  return null;
}

const data = JSON.parse(text);
saveToCache(key, data);
return data;

};

