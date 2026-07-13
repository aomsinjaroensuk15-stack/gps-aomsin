(function () {
  const params = new URLSearchParams({
    key: CONFIG.GOOGLE_MAPS_API_KEY,
    libraries: "places,geometry",
    callback: "initApp",
    v: "weekly",
  });
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
  script.async = true;
  script.defer = true;
  script.onerror = () => {
    const el = document.getElementById("status-msg");
    if (el) {
      el.textContent = "โหลด Google Maps ไม่สำเร็จ ตรวจสอบ API Key และ restriction อีกครั้ง";
    }
  };
  document.head.appendChild(script);
})();

