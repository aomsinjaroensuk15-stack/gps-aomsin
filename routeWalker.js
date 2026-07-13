class RouteWalker {
  constructor(points) {
    // คำนวณทิศ (heading) ระหว่างแต่ละจุดกับจุดถัดไป
    // จุดสุดท้ายใช้ heading เดียวกับจุดก่อนหน้า กันไม่ให้กล้องหันเหกะทันหันตอนถึงปลายทาง
    const headings = points.map((pos, i) => {
      if (i >= points.length - 1) return null;
      return google.maps.geometry.spherical.computeHeading(pos, points[i + 1]);
    });
    if (headings.length > 1) {
      headings[headings.length - 1] = headings[headings.length - 2];
    } else if (headings.length === 1) {
      headings[0] = 0;
    }

    this.walkPoints = points.map((pos, i) => ({ position: pos, heading: headings[i] }));
    this.index = 0;
    this.timer = null;
    this.speedMs = 1000;
    this.isPlaying = false;
    this.onStep = null; // callback(walkPoint, index, total)
    this.onFinish = null;
  }

  start() {
    if (this.isPlaying || this.walkPoints.length === 0) return;
    this.isPlaying = true;
    this._emitCurrent();
    this.timer = setInterval(() => this._tick(), this.speedMs);
  }

  pause() {
    this.isPlaying = false;
    clearInterval(this.timer);
  }

  toggle() {
    this.isPlaying ? this.pause() : this.start();
  }

  setSpeed(ms) {
    this.speedMs = ms;
    if (this.isPlaying) {
      clearInterval(this.timer);
      this.timer = setInterval(() => this._tick(), this.speedMs);
    }
  }

  _tick() {
    if (this.index >= this.walkPoints.length - 1) {
      this.pause();
      if (this.onFinish) this.onFinish();
      return;
    }
    this.index++;
    this._emitCurrent();
  }

  _emitCurrent() {
    if (this.onStep) {
      this.onStep(this.walkPoints[this.index], this.index, this.walkPoints.length);
    }
  }

  reset() {
    this.pause();
    this.index = 0;
  }
}

