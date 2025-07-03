const access = localStorage.getItem("broadcast_auth");
if (access !== "ok") {
  const pwd = prompt("🔐 Enter System Password:");
  if (pwd !== "matrix123") {
    alert("❌ Access Denied");
    window.location.href = "https://www.google.com";
  } else {
    localStorage.setItem("broadcast_auth", "ok");
  }
}
