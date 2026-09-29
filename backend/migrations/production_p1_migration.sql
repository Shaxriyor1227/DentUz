-- ==============================================================================
-- DENTUZ MULTI-TENANCY & RBAC PRODUCTION MIGRATION SCRIPT (STAGE 2 - P1)
-- ==============================================================================
-- MUHIM KO'RSATMALAR:
-- 1. Ushbu skript idempotent (qayta yurgizilganda xato bermaydi).
-- 2. Tranzaksiya blokida (BEGIN ... COMMIT) xavfsiz ishga tushiriladi.
-- 3. Sequelize sync({ alter: true }) ishlatmasdan, to'g'ridan-to'g'ri psql / Supabase SQL Editor'da bajarish mumkin.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. USERS ROLE ENUM QIYMATLARINI KENGAYTIRISH
-- PostgreSQL'da ENUM tipiga yangi qiymatlarni xavfsiz qo'shish
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  -- 'administrator' qiymatini qo'shish
  IF NOT EXISTS (
    SELECT 1 FROM pg_type typ
    JOIN pg_enum enm ON typ.oid = enm.enumtypid
    WHERE typ.typname = 'enum_users_role' AND enm.enumlabel = 'administrator'
  ) THEN
    ALTER TYPE "enum_users_role" ADD VALUE 'administrator';
  END IF;

  -- 'accountant' qiymatini qo'shish
  IF NOT EXISTS (
    SELECT 1 FROM pg_type typ
    JOIN pg_enum enm ON typ.oid = enm.enumtypid
    WHERE typ.typname = 'enum_users_role' AND enm.enumlabel = 'accountant'
  ) THEN
    ALTER TYPE "enum_users_role" ADD VALUE 'accountant';
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. INVOICES JADVALIGA "paidAmount" USTUNINI QO'SHISH
-- ------------------------------------------------------------------------------
ALTER TABLE "invoices" 
ADD COLUMN IF NOT EXISTS "paidAmount" BIGINT NOT NULL DEFAULT 0;

COMMENT ON COLUMN "invoices"."paidAmount" IS 'Haqiqiy to''langan jami summa (so''mda)';

-- ------------------------------------------------------------------------------
-- 3. MULTI-TENANT QUERY VA JOIN'LAR UCHUN INDEKSLAR (Baza tezligini oshirish)
-- Har bir jadvalda clinicId bo'yicha tezkor qidiruv va filtrlash ta'minlanadi
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "idx_users_clinic_id" ON "users" ("clinicId");
CREATE INDEX IF NOT EXISTS "idx_patients_clinic_id" ON "patients" ("clinicId");
CREATE INDEX IF NOT EXISTS "idx_appointments_clinic_id" ON "appointments" ("clinicId");
CREATE INDEX IF NOT EXISTS "idx_invoices_clinic_id" ON "invoices" ("clinicId");
CREATE INDEX IF NOT EXISTS "idx_payments_clinic_id" ON "payments" ("clinicId");
CREATE INDEX IF NOT EXISTS "idx_payments_invoice_id" ON "payments" ("invoiceId");
CREATE INDEX IF NOT EXISTS "idx_inventory_clinic_id" ON "inventory" ("clinicId");
CREATE INDEX IF NOT EXISTS "idx_services_clinic_id" ON "services" ("clinicId");
CREATE INDEX IF NOT EXISTS "idx_medical_records_clinic_id" ON "medical_records" ("clinicId");
CREATE INDEX IF NOT EXISTS "idx_treatment_plans_clinic_id" ON "treatment_plans" ("clinicId");
CREATE INDEX IF NOT EXISTS "idx_lab_orders_clinic_id" ON "lab_orders" ("clinicId");
CREATE INDEX IF NOT EXISTS "idx_notifications_clinic_id" ON "notifications" ("clinicId");
CREATE INDEX IF NOT EXISTS "idx_odontograms_patient_id" ON "odontograms" ("patientId");
CREATE INDEX IF NOT EXISTS "idx_odontogram_history_patient_id" ON "odontogram_history" ("patientId");

COMMIT;

-- ==============================================================================
-- ROLLBACK KO'RSATMASI (Agar orqaga qaytarish zarurati tug'ilsa):
-- ==============================================================================
/*
BEGIN;

-- 1. Indekslarni olib tashlash
DROP INDEX IF EXISTS "idx_users_clinic_id";
DROP INDEX IF EXISTS "idx_patients_clinic_id";
DROP INDEX IF EXISTS "idx_appointments_clinic_id";
DROP INDEX IF EXISTS "idx_invoices_clinic_id";
DROP INDEX IF EXISTS "idx_payments_clinic_id";
DROP INDEX IF EXISTS "idx_payments_invoice_id";
DROP INDEX IF EXISTS "idx_inventory_clinic_id";
DROP INDEX IF EXISTS "idx_services_clinic_id";
DROP INDEX IF EXISTS "idx_medical_records_clinic_id";
DROP INDEX IF EXISTS "idx_treatment_plans_clinic_id";
DROP INDEX IF EXISTS "idx_lab_orders_clinic_id";
DROP INDEX IF EXISTS "idx_notifications_clinic_id";
DROP INDEX IF EXISTS "idx_odontograms_patient_id";
DROP INDEX IF EXISTS "idx_odontogram_history_patient_id";

-- 2. Invoices ustunini olib tashlash
ALTER TABLE "invoices" DROP COLUMN IF EXISTS "paidAmount";

-- 3. PostgreSQL da ENUM qiymatlari to'g'ridan-to'g'ri DROP qilinmaydi.
-- Kerak bo'lsa yangi enum ochib ustun type o'zgartiriladi.

COMMIT;
*/
