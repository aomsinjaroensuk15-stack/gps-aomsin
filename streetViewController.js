class StreetViewController {
  constructor(panoEl) {
    this.streetViewService = new google.maps.StreetViewService();
    this.panorama = new google.maps.StreetViewPanorama(panoEl, {
      addressControl: false,
      showRoadLabels: false,
      fullscreenControl: false,
      motionTracking: false,
      motionTrackingControl: false,
      linksControl: false, // ปิดลูกศรเดินต่อบนพื้น กันหลุดออกนอกเส้นทางที่คำนวณไว้
      panControl: false,
      zoomControl: true,
      clickToGo: false,
    });
    this.autoFace = true;
    this._lastPanoId = null;
    this.onHeadingChange = null;

    this.panorama.addListener("pov_changed", () => {
      if (this.onHeadingChange) {
        this.onHeadingChange(this.panorama.getPov().heading);
      }
    });
  }

  setAutoFace(enabled) {
    this.autoFace = enabled;
  }

  faceForward(heading) {
    const pov = this.panorama.getPov();
    this.panorama.setPov({ heading, pitch: pov.pitch, zoom: pov.zoom });
  }

  /** ย้ายไปยัง panorama จริงที่ใกล้ walkPoint.position ที่สุด คืนค่า false ถ้าไม่มี Street View แถวนั้น */
  async goTo(walkPoint) {
    try {
      const { data } = await this.streetViewService.getPanorama({
        location: walkPoint.position,
        radius: 50,
        source: google.maps.StreetViewSource.OUTDOOR,
      });
      if (data.location.pano === this._lastPanoId) return true;
      this._lastPanoId = data.location.pano;
      this.panorama.setPano(data.location.pano);
      if (this.autoFace) {
        const pov = this.panorama.getPov();
        this.panorama.setPov({
          heading: walkPoint.heading,
          pitch: pov.pitch,
          zoom: pov.zoom,
        });
      }
      return true;
    } catch (err) {
      return false; // ไม่มี Street View ตรงจุดนี้ — ข้ามไปจุดถัดไปเงียบๆ
    }
  }
}

