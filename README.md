# 🌆 Street Walk 360°

เว็บแอปสำหรับเดินสำรวจเส้นทางจริงแบบ **first-person 360°** ผ่าน Google Street View
— เลือกจุดเริ่มต้น/จุดหมาย ระบบจะคำนวณเส้นทางแล้ว "เดิน" ไปตามถนนจริงให้อัตโนมัติ
พร้อมให้คุณลากหมุนมองรอบตัวได้ 360 องศาตลอดเวลา

> ⚠️ ถ้าเคยแปะ API Key ไว้ในแชทหรือที่สาธารณะมาก่อน ให้ไป **revoke/regenerate คีย์นั้นทันที**
> ที่ [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
> ก่อนทำตามขั้นตอนด้านล่าง

## โครงสร้างไฟล์

```
street-walk-360/
├── index.html
├── style.css
├── src/
│   ├── config.js              ← ใส่ API Key ตรงนี้ (ที่เดียว)
│   ├── mapsLoader.js
│   ├── mapView.js
│   ├── directionsService.js
│   ├── routeWalker.js
│   ├── streetViewController.js
│   └── app.js
└── README.md
```

## ตั้งค่า Google Cloud (ทำครั้งเดียว)

1. เปิด [Google Cloud Console](https://console.cloud.google.com/) → สร้าง/เลือกโปรเจกต์
2. ไปที่ **APIs & Services → Library** แล้วเปิดใช้ 3 ตัวนี้เท่านั้น:
   - **Maps JavaScript API** (แผนที่ + Street View แบบ interactive + geometry library)
   - **Directions API** (คำนวณเส้นทาง)
   - **Places API (New)** ← ต้องเป็นตัว "(New)" ห้ามใช้ "Places API" ตัวเก่า
     (ตัวเก่าถูกปิดไม่ให้โปรเจกต์ใหม่ใช้ autocomplete widget แล้วตั้งแต่ มี.ค. 2025)
3. ไปที่ **APIs & Services → Credentials** → Create Credentials → API Key
4. กด **Restrict key**:
   - Application restrictions → **HTTP referrers** → ใส่:
     - `https://<ชื่อ-github-ของคุณ>.github.io/*`
     - `http://localhost:*/*` (เผื่อทดสอบในเครื่อง)
   - API restrictions → เลือกเฉพาะ 3 API ในข้อ 2
5. ไปที่ **Billing → Budgets & alerts** ตั้งวงเงินแจ้งเตือนไว้กันเผื่อ
6. คัดลอกคีย์มาใส่ในไฟล์ `src/config.js` ตรง `GOOGLE_MAPS_API_KEY`

## ทดสอบในเครื่อง (Termux/Acode/Chrome)

ต้อง serve ผ่าน HTTP ห้ามเปิดเป็น `file://` ตรงๆ (custom element ของ Places widget ต้องการ origin จริง)

```bash
cd street-walk-360
python -m http.server 8080
```

แล้วเปิด `http://localhost:8080` ในเบราว์เซอร์

## Deploy ขึ้น GitHub Pages

1. สร้าง repo ใหม่บน GitHub แล้วอัปโหลดไฟล์ทั้งหมด (คงโครงสร้างโฟลเดอร์ `src/` ไว้ตามเดิม)
2. ไปที่ Settings → Pages → Source: เลือก branch `main`, folder `/ (root)`
3. รอสักครู่ จะได้ URL แบบ `https://<username>.github.io/<repo>/`
4. **สำคัญ:** กลับไปเพิ่ม URL นี้ใน HTTP referrer restriction ของคีย์ (ข้อ 4 ด้านบน)

## วิธีทำงานคร่าวๆ

1. ผู้ใช้พิมพ์ค้นหาจุดเริ่มต้น/ปลายทางผ่าน Places Autocomplete
2. `Directions API` คำนวณเส้นทาง → ได้จุดพิกัดเรียงตามถนนจริง
3. แบ่งจุดให้ถี่ขึ้นทุกๆ ~15 เมตร แล้วคำนวณทิศ (heading) ระหว่างแต่ละจุด
4. สลับไปโหมด `StreetViewPanorama` หา panorama จริงที่ใกล้แต่ละจุดที่สุด แล้ว "เดิน" ต่อไปเรื่อยๆ
   ตามจังหวะที่ตั้งไว้ (ปรับความเร็วได้จาก slider)
5. ผู้ใช้ลากหมุนดู 360° ได้อิสระตลอดเวลา — เป็นพฤติกรรมพื้นฐานของ Street View panorama เอง
6. HUD เข็มทิศบอกทิศที่กำลังมองอยู่แบบเรียลไทม์

## ข้อจำกัดที่ควรรู้

- **Street View ไม่ครอบคลุมทุกที่** โดยเฉพาะซอยเล็กๆ นอกเมืองใหญ่ — ช่วงที่ไม่มี coverage
  ภาพจะค้างที่จุดล่าสุดจนกว่าจะเจอ panorama ถัดไป (progress bar จะเดินต่อแต่ภาพนิ่งชั่วคราว)
- การ "เดิน" คือการสลับ panorama เป็นช่วงๆ ไม่ใช่ walk แบบเกม 3D สมูทจริง
  (Google Maps เองก็ใช้วิธีเดียวกันนี้ในโหมด Street View ปกติ)
- ทุกครั้งที่เรียก Directions / Places / Street View มีค่าใช้จ่ายตาม pricing ของ
  Google Maps Platform — ควรดู [pricing ปัจจุบัน](https://mapsplatform.google.com/pricing/)
  และตั้ง budget alert ไว้เสมอ
- `google.maps.Marker` (หมุดบนแผนที่เล็ก) ถูก Google ตั้งเป็น deprecated แล้ว แต่ยังใช้งานได้ปกติ
  (แค่ขึ้น warning ใน console) — ใช้ตัวนี้ต่อเพื่อความง่าย ถ้าอยากตัด warning ต้องย้ายไปใช้
  `AdvancedMarkerElement` ซึ่งต้องสร้าง Map ID เพิ่มใน Cloud Console

## ไอเดียต่อยอด

- แสดง mini-map ลอยระหว่างเดิน sync กับตำแหน่งปัจจุบัน
- Crossfade เปลี่ยน panorama ให้นุ่มขึ้นแทนการตัดฉับ
- บันทึก/แชร์เส้นทางที่เดินแล้ว
- รองรับหลาย waypoint ไม่ใช่แค่ต้นทาง–ปลายทาง
- แคชผลลัพธ์ Directions ไว้ลด API call ซ้ำเมื่อค้นเส้นทางเดิม
