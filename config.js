/**
 * ⚙️ ตั้งค่า Google Maps API Key ตรงนี้ที่เดียว
 *
 * ก่อนใส่คีย์ใหม่ ต้องทำตามลำดับนี้ที่ Google Cloud Console:
 *
 * 1) ปิด/ลบคีย์เก่าที่เคยหลุดออกไปก่อน (Credentials > ลบ หรือ Regenerate)
 *
 * 2) เปิดใช้ 3 API นี้ใน "APIs & Services > Library":
 *      - Maps JavaScript API   (แผนที่ + Street View แบบ interactive + geometry)
 *      - Directions API        (คำนวณเส้นทาง)
 *      - Places API (New)      (ช่องค้นหาสถานที่ autocomplete)
 *    ⚠️ ต้องเป็น "Places API (New)" ห้ามใช้ "Places API" ตัวเก่า
 *       (ตัวเก่าถูกปิดไม่ให้ลูกค้าใหม่ใช้ Autocomplete widget แล้ว)
 *
 * 3) สร้างคีย์ใหม่ แล้วกด "Restrict key":
 *      - Application restrictions → HTTP referrers → ใส่:
 *          https://<ชื่อ-github-ของคุณ>.github.io/*
 *          http://localhost:*/*        (เผื่อทดสอบในเครื่อง)
 *      - API restrictions → เลือกเฉพาะ 3 API ในข้อ 2 เท่านั้น
 *
 * 4) ไปที่ Billing → Budgets & alerts ตั้งวงเงินแจ้งเตือนไว้กันเผื่อ
 *
 * 5) วางคีย์ใหม่แทนที่ข้อความด้านล่าง
 *
 * หมายเหตุ: คีย์แบบนี้ (client-side Maps key) ถูกออกแบบมาให้อยู่ในโค้ดฝั่งหน้าเว็บได้อยู่แล้ว —
 * ใครก็ตามที่เปิดหน้าเว็บนี้จะเห็นคีย์ผ่าน "view source" ได้เสมอ ความปลอดภัยจริงๆ
 * อยู่ที่ข้อ 3 (restriction) ไม่ใช่การพยายามซ่อนคีย์
 */
const CONFIG = {
  GOOGLE_MAPS_API_KEY: "ใส่-API-KEY-ใหม่ของคุณตรงนี้",
  DEFAULT_CENTER: { lat: 13.7563, lng: 100.5018 }, // กรุงเทพฯ — ปรับได้ตามต้องการ
  DEFAULT_ZOOM: 12,
};

