class RouteService {
  constructor() {
    this.directionsService = new google.maps.DirectionsService();
  }

  getRoute(origin, destination, travelMode) {
    return new Promise((resolve, reject) => {
      this.directionsService.route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode[travelMode],
        },
        (result, status) => {
          if (status !== "OK") {
            reject(new Error(`ขอเส้นทางไม่สำเร็จ (${status})`));
            return;
          }
          const route = result.routes[0];
          const rawPath = [];
          route.legs.forEach((leg) => {
            leg.steps.forEach((step) => {
              step.path.forEach((pt) => rawPath.push(pt));
            });
          });
          resolve({ path: rawPath, bounds: route.bounds });
        }
      );
    });
  }

  /** แบ่งเส้นทางให้จุดห่างกันประมาณ spacingMeters ทุกจุด (เดินได้ลื่นขึ้น) */
  static densify(path, spacingMeters = 15) {
    if (path.length < 2) return path;
    const result = [path[0]];
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];
      const dist = google.maps.geometry.spherical.computeDistanceBetween(a, b);
      const steps = Math.max(1, Math.round(dist / spacingMeters));
      for (let s = 1; s <= steps; s++) {
        result.push(google.maps.geometry.spherical.interpolate(a, b, s / steps));
      }
    }
    return result;
  }
}

