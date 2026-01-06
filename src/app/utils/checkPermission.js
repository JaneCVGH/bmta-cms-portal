//export function hasPermission(key) {
 // if (typeof window === "undefined") return false;

 // const stored = localStorage.getItem("permissions");
 // if (!stored) return false;

 // const permissions = JSON.parse(stored);

 // return permissions.includes(key);
//}


export function hasPermission(key) {
  if (typeof window === "undefined") return false;
  const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");
  return permissions.includes(key);
}
