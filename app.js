let mapView, routeService, walker, svController;

function speedLevelToMs(level) {
  return 2200 - level * 200; // 1=ช้า(2000ms) ... 10=เร็ว(200ms)
}

function headingToCompassText(heading) {
  const normalized = ((heading % 360) + 360) % 360;
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(normalized / 45) % 8;
  return `${dirs[idx]} ${Math.round(normalized)}°`;
}

// เรียกโดย mapsLoader.js หลังโหลด Google Maps JS สำเร็จ (callback=initApp)
window.initApp = function () {
  routeService = new RouteService();

  mapView = new MapView({
    mapEl: document.getElementById("mini-map"),
    originEl: document.getElementById("origin-input"),
    destinationEl: document.getElementById("destination-input"),
  });

  svController = new StreetViewController(document.getElementById("pano"));
  svController.onHeadingChange = (heading) => {
    document.getElementById("compass-heading").textContent = headingToCompassText(heading);
  };

  document.getElementById("start-btn").addEventListener("click", handleStart);
  document.getElementById("exit-btn").addEventListener("click", exitStreetView);
  document.getElementById("play-pause-btn").addEventListener("click", togglePlayback);

  document.getElementById("speed-slider").addEventListener("input", (e) => {
    if (walker) walker.setSpeed(speedLevelToMs(Number(e.target.value)));
  });

  document.getElementById("auto-face-checkbox").addEventListener("change", (e) => {
    if (svController) svController.setAutoFace(e.target.checked);
  });

  document.getElementById("face-forward-btn").addEventListener("click", () => {
    const wp = walker && walker.walkPoints[walker.index];
    if (wp && svController) svController.faceForward(wp.heading);
  });
};

async function handleStart() {
  const status = document.getElementById("status-msg");
  const origin = mapView.originPlace;
  const destination = mapView.destinationPlace;
  const travelMode = document.getElementById("travel-mode").value;

  if (!origin || !destination) {
    status.textContent = "กรุณาเลือกจุดเริ่มต้นและจุดหมายจากรายการค้นหาก่อน";
    return;
  }

  status.textContent = "กำลังค้นหาเส้นทาง...";
  try {
    const { path, bounds } = await routeService.getRoute(origin, destination, travelMode);
    mapView.drawRoute(path, bounds);

    const dense = RouteService.densify(path, 15);
    walker = new RouteWalker(dense);
    walker.onStep = (wp, index, total) => {
      svController.goTo(wp);
      mapView.updateWalkerPosition(wp.position);
      updateProgress(index, total);
    };
    walker.onFinish = () => {
      document.getElementById("play-pause-btn").textContent = "🔁";
    };

    enterStreetView();
    walker.setSpeed(speedLevelToMs(Number(document.getElementById("speed-slider").value)));
    walker.start();
    document.getElementById("play-pause-btn").textContent = "⏸";
    status.textContent = "";
  } catch (err) {
    status.textContent = err.message;
  }
}

function enterStreetView() {
  document.getElementById("setup-panel").classList.add("hidden");
  document.getElementById("streetview-container").classList.remove("hidden");
}

function exitStreetView() {
  if (walker) walker.pause();
  document.getElementById("streetview-container").classList.add("hidden");
  document.getElementById("setup-panel").classList.remove("hidden");
}

function togglePlayback() {
  if (!walker) return;
  walker.toggle();
  document.getElementById("play-pause-btn").textContent = walker.isPlaying ? "⏸" : "▶";
}

function updateProgress(index, total) {
  const pct = total > 1 ? (index / (total - 1)) * 100 : 0;
  document.getElementById("progress-fill").style.width = `${pct}%`;
}
  
