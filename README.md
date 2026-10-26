# 🧬 Patient DNA Pro — Universal Health Passport & Vault

Official Domain: **[https://www.patientdnapro.com/](https://www.patientdnapro.com/)**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Resend](https://img.shields.io/badge/Resend_Email-000000?style=for-the-badge&logo=resend&logoColor=white)](https://resend.com/)

**Patient DNA Pro** is a modern, tamper-evident Electronic Medical Record (EMR) and decentralized emergency healthcare passport system. It provides patients and verified healthcare providers worldwide with instantaneous, secure, and authenticated access to life-critical medical data.

---

## 🚀 Key Features

### 1. 3-Page Patient Registration Wizard
- **Page 1: Demographic & Personal Identity**
  - Live country/region selector with flag identifiers.
  - Real-time **DNA ID preview** calculation (`DNA-[COUNTRY]-[YEAR]-[SEQ]`).
  - First Name, Surname, Date of Birth (DOB), Blood Group (all 8 Rh types), and Gender.
  - Avatar customization with preset symbol avatars or high-resolution custom photo upload.
- **Page 2: Contact Info & Live Email Verification**
  - Real-time 6-digit OTP delivery from official sender: `Patient DNA <security@patientdnapro.com>`.
  - 10-minute expiration countdown with resend security rate-limiting.
  - Optional phone number input for secondary emergency triage.
- **Page 3: Security & Vault Activation**
  - Real-time password strength analyzer (8+ characters, uppercase, lowercase, numbers, special symbols).
  - Organ Donor Registry authorization toggle.
  - Immediate cloud provisioning in **Google Cloud Firestore**.
  - Automated branded **Welcome Email** delivery with patient's assigned DNA ID and direct access link.

### 2. Multi-Role Healthcare Access Controls
- **Patient Vault:** Lifetime access to health history, clinical records, lab documents, allergies, and vaccination passports.
- **Doctor Consultation Terminal:** Real-time patient authorization requiring one-time time-gated verification codes before opening sensitive clinical histories.
- **Paramedic Emergency Scanner:** Rapid QR and DNA ID lookup for critical allergies, emergency contacts, and blood compatibility triage.
- **Hospital Administrator Console:** Multi-patient directory management, directory synchronization, and cryptographic audit logging.

### 3. Enterprise Infrastructure & Security
- **Domain Verification:** DKIM & SPF authenticated delivery via Resend on custom domain `patientdnapro.com`.
- **Database Synchronization:** Hybrid dual-layer storage with Google Cloud Firestore and persistent server-side JSON store.
- **SEO & Canonical Routing:** Full OpenGraph, JSON-LD structured medical schema, `sitemap.xml`, and `robots.txt` configuration for `https://www.patientdnapro.com/`.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Lucide Icons, Tailwind CSS v4, Canvas Confetti.
- **Backend:** Node.js Express API server with Vite middleware integration.
- **Database:** Google Cloud Firestore (multi-region cloud document store).
- **Email Delivery:** Resend API (custom domain `patientdnapro.com` authenticated via SPF & DKIM).
- **Build Tool:** Vite 6 with TypeScript compilation (`tsc --noEmit`).

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm or bun

### 1. Clone the repository
```bash
git clone https://github.com/your-username/patient-dna-pro.git
cd patient-dna-pro
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your configuration:
```env
RESEND_API_KEY="your_resend_api_key"
RESEND_FROM_EMAIL="Patient DNA <security@patientdnapro.com>"
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Build for production
```bash
npm run build
npm start
```

---

## 🌐 Custom Domain & Production Deployment

- **Canonical URL:** `https://www.patientdnapro.com/`
- **Sender Address:** `security@patientdnapro.com`
- **DNS Setup:** SPF CNAME records pointing to `rsend-apne1.forge.rmta.net` and DKIM TXT record pointing to `resend._domainkey`.

---

## 📄 License
MIT License. © 2026 Patient DNA Universal Health System.
