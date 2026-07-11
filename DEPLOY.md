# การ Deploy DT Copilot ขึ้น Cloud

DT Copilot เป็น Next.js app มาตรฐาน — deploy ได้หลายวิธี ด้านล่างเรียงจากง่ายสุด

> **เรื่อง API key:** ไม่จำเป็นต้องตั้ง `ANTHROPIC_API_KEY` ตอน deploy ก็ได้
> ผู้ใช้แต่ละคนสามารถใส่คีย์เองผ่านเมนู **ตั้งค่า (/settings)** ในแอป (เก็บในเบราว์เซอร์)
> ถ้าตั้ง `ANTHROPIC_API_KEY` เป็น environment variable ไว้ ระบบจะใช้เป็นค่า default
> ให้ทุกคนโดยไม่ต้องกรอกเอง

---

## ตัวเลือกที่ 1 — Vercel (แนะนำ, ง่ายสุด)

1. push โค้ดขึ้น GitHub (ทำแล้ว)
2. ไปที่ [vercel.com/new](https://vercel.com/new) → Import repository นี้
3. Framework จะถูกตรวจเป็น **Next.js** อัตโนมัติ — กด Deploy ได้เลย
4. (ไม่บังคับ) ที่ **Settings → Environment Variables** เพิ่ม
   `ANTHROPIC_API_KEY = sk-ant-...` เพื่อเปิด Claude ให้ทุกคน

เสร็จแล้วจะได้ URL `https://<project>.vercel.app`

---

## ตัวเลือกที่ 2 — Docker (Azure Container Apps / Cloud Run / VM ใดก็ได้)

โปรเจกต์ตั้งค่า `output: "standalone"` ไว้แล้ว และมี `Dockerfile` ให้พร้อม

```bash
# build image
docker build -t dt-copilot .

# run (โหมดสาธิต — ผู้ใช้กรอกคีย์เองในแอป)
docker run -p 3000:3000 dt-copilot

# หรือใส่คีย์เป็น default ให้ทุกคน
docker run -p 3000:3000 -e ANTHROPIC_API_KEY=sk-ant-... dt-copilot
```

เปิด http://localhost:3000

### Deploy image ขึ้น Azure Container Apps (ตัวอย่าง)

```bash
# 1) push image เข้า Azure Container Registry
az acr build --registry <myregistry> --image dt-copilot:latest .

# 2) สร้าง Container App
az containerapp create \
  --name dt-copilot \
  --resource-group <rg> \
  --environment <aca-env> \
  --image <myregistry>.azurecr.io/dt-copilot:latest \
  --target-port 3000 --ingress external \
  --env-vars ANTHROPIC_API_KEY=secretref:anthropic-key   # ไม่บังคับ
```

Cloud Run / ECS / Kubernetes ก็ใช้ image เดียวกันได้ (คอนเทนเนอร์ฟัง port 3000)

---

## ตัวเลือกที่ 3 — Node server เอง (VM / On-prem)

```bash
npm ci
npm run build
node .next/standalone/server.js   # ฟังที่ PORT (ค่าเริ่มต้น 3000)
```

ตั้ง reverse proxy (Nginx) + HTTPS หน้าเซิร์ฟเวอร์ตามปกติ

---

## Environment variables

| ตัวแปร | จำเป็น | คำอธิบาย |
|--------|--------|----------|
| `ANTHROPIC_API_KEY` | ไม่ | คีย์ default ให้ทุกคน ถ้าไม่ตั้ง ผู้ใช้กรอกเองในหน้า /settings |
| `ANTHROPIC_MODEL` | ไม่ | override โมเดล (ค่าเริ่มต้น `claude-opus-4-8`) |
| `PORT` | ไม่ | พอร์ต (ค่าเริ่มต้น 3000) |

---

## หมายเหตุด้านความปลอดภัย

- โหมด "กรอกคีย์เองในแอป": คีย์เก็บใน localStorage ของเบราว์เซอร์ผู้ใช้ ส่งไปเซิร์ฟเวอร์
  เฉพาะตอนเรียกใช้ AI ผ่าน HTTPS และ **ไม่ถูกบันทึกฝั่งเซิร์ฟเวอร์** — เหมาะกับการใช้ภายใน/ทีม
- สำหรับการใช้งานทั่วทั้งองค์กรที่ควบคุมสิทธิ์ แนะนำให้ตั้ง `ANTHROPIC_API_KEY` เป็น secret
  ฝั่งเซิร์ฟเวอร์ และเพิ่มระบบ Auth (SSO/Azure AD) เป็นขั้นต่อไป
