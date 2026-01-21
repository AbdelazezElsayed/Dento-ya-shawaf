import { db } from "../server/db";
import { clinics, doctors, users } from "../shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("Seeding database...");

  const clinicData = [
    { id: "diagnosis", name: "التشخيص والأشعة", nameEn: "Diagnosis & Radiology" },
    { id: "conservative", name: "العلاج التحفظي وطب وجراحة الجذور", nameEn: "Conservative & Endodontics" },
    { id: "surgery", name: "جراحة الفم والفكين", nameEn: "Oral & Maxillofacial Surgery" },
    { id: "removable", name: "التركيبات المتحركة", nameEn: "Removable Prosthodontics" },
    { id: "fixed", name: "التركيبات الثابتة", nameEn: "Fixed Prosthodontics" },
    { id: "gums", name: "اللثة", nameEn: "Periodontics" },
    { id: "cosmetic", name: "تجميل الأسنان", nameEn: "Cosmetic Dentistry" },
    { id: "implants", name: "زراعة الأسنان", nameEn: "Dental Implants" },
    { id: "orthodontics", name: "تقويم الأسنان", nameEn: "Orthodontics" },
    { id: "pediatric", name: "أسنان الأطفال", nameEn: "Pediatric Dentistry" },
  ];

  for (const clinic of clinicData) {
    await db.insert(clinics).values(clinic).onConflictDoNothing();
  }
  console.log("Clinics seeded");

  const hashedPassword = await bcrypt.hash("doctor123", 10);
  await db.insert(users).values({
    id: "doctor1",
    username: "doctor",
    password: hashedPassword,
    fullName: "د. محمد أحمد",
    email: "doctor@dento.com",
    phone: "01012345678",
    userType: "doctor",
  }).onConflictDoNothing();

  await db.insert(doctors).values({
    id: "doctor1",
    name: "د. محمد أحمد",
    specialization: "طبيب أسنان عام",
    contact: "01012345678",
    email: "doctor@dento.com",
    clinicId: "diagnosis",
  }).onConflictDoNothing();
  console.log("Doctor seeded");

  const patientPassword = await bcrypt.hash("patient123", 10);
  await db.insert(users).values({
    id: "patient1",
    username: "patient",
    password: patientPassword,
    fullName: "أحمد محمود",
    email: "patient@example.com",
    phone: "01098765432",
    userType: "patient",
  }).onConflictDoNothing();
  console.log("Patient seeded");

  console.log("Database seeded successfully!");
  process.exit(0);
}

seed().catch(console.error);
