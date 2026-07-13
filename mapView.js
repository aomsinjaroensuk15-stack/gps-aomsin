// สไตล์แผนที่โทนมืด ให้เข้ากับธีมของแอป
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0a0f18" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0f18" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5c7a8a" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#1a2330" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#141c28" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0d1420" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#1c2a3a" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#050a12" }] },
];

class MapView {
  constructor({ mapEl, originEl, destinationEl }) {
    this.map = new google.maps.Map(mapEl, {
      center: CONFIG.DEFAULT_CENTER,
      zoom: CONFIG.DEFAULT_ZOOM,
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControl: false,
      styles: DARK_MAP_STYLE,
    });

    this.originMarker = null;
    this.destinationMarker = null;
    this.routePolyline = null;
    this.walkerMarker = null;
    this.originPlace = null;
    this.destinationPlace = null;

    this._setupAutocomplete(originEl, "origin");
    this._setupAutocomplete(destinationEl, "destination");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          this.map.setCenter(here);
          this.map.setZoom(14);
          originEl.locationBias = here;
          destinationEl.locationBias = here;
        },
        () => {},
        { timeout: 4000 }
      );
    }
  }

  // ใช้ google.maps.places.PlaceAutocompleteElement (ตัวใหม่) แทน google.maps.places.Autocomplete
  // เดิม เพราะตัวเก่าถูกปิดไม่ให้โปรเจกต์ใหม่ใช้งานแล้วตั้งแต่มี.ค. 2025
  _setupAutocomplete(el, kind) {
    el.locationBias = CONFIG.DEFAULT_CENTER;
    el.addEventListener("gmp-select", async ({ placePrediction }) => {
      const place = placePrediction.toPlace();
      await place.fetchFields({ fields: ["location"] });
      const position = place.location;
      if (kind === "origin") {
        this.originPlace = position;
        this._placeMarker("originMarker", position, "A", "#00f0ff");
      } else {
        this.destinationPlace = position;
        this._placeMarker("destinationMarker", position, "B", "#ff3df0");
      }
      this.map.panTo(position);
    });
  }

  // หมายเหตุ: google.maps.Marker ถูกตั้งเป็น deprecated แล้ว (ขึ้น warning ใน console)
  // แต่ยังใช้งานได้ปกติ ใช้ตัวนี้ต่อเพื่อความง่าย — ถ้าอยากตัด warning ต้องย้ายไป
  // AdvancedMarkerElement ซึ่งต้องสร้าง Map ID เพิ่มใน Cloud Console
  _placeMarker(key, position, label, color) {
    if (this[key]) this[key].setMap(null);
    this[key] = new google.maps.Marker({
      position,
      map: this.map,
      label: { text: label, color: "#05070a", fontWeight: "700" },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: "#05070a",
        strokeWeight: 2,
      },
    });
  }

  drawRoute(path, bounds) {
    if (this.routePolyline) this.routePolyline.setMap(null);
    this.routePolyline = new google.maps.Polyline({
      path,
      map: this.map,
      strokeColor: "#39ff88",
      strokeWeight: 4,
      strokeOpacity: 0.9,
    });
    this.map.fitBounds(bounds);
  }

  updateWalkerPosition(position) {
    if (!this.walkerMarker) {
      this.walkerMarker = new google.maps.Marker({
        position,
        map: this.map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: "#ffffff",
          fillOpacity: 1,
          strokeColor: "#39ff88",
          strokeWeight: 2,
        },
        zIndex: 999,
      });
    } else {
      this.walkerMarker.setPosition(position);
    }
    this.map.panTo(position);
  }
        }

