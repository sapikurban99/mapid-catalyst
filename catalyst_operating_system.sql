-- ==========================================
-- MAPID Catalyst 2026 Operating System DDL & Seed (Cleaned Up)
-- Run this in your Supabase SQL Editor to clear unused tables
-- ==========================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- Table 1: catalyst_timeline
-- ==========================================
DROP TABLE IF EXISTS catalyst_timeline CASCADE;
CREATE TABLE catalyst_timeline (
    id VARCHAR(255) PRIMARY KEY,
    phase VARCHAR(255) NOT NULL,
    date_range VARCHAR(255) NOT NULL,
    type VARCHAR(100) DEFAULT 'General',
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_timeline" ON catalyst_timeline FOR ALL USING (true) WITH CHECK (true);

-- Seed catalyst_timeline with the 21 screenshot-aligned phases
INSERT INTO catalyst_timeline (id, phase, date_range, type, description, order_index) VALUES
('P001', 'Planning & Persiapan Kompetisi', '1 – 31 Mei 2026', 'Phase Ingestion', 'Perumusan konsep, timeline, dataset, guideline, sponsor proposal, visual assets, dan setup awal webapp.', 0),
('P002', 'Pembukaan Pendaftaran WebGIS Competition', '8 – 26 Juni 2026', 'Registration', 'Pembukaan pendaftaran untuk peserta WebGIS Competition 2026. Peserta mendaftar dan mengirimkan proposal ide berbasis tema dari sponsor.', 1),
('P003', 'Seleksi Proposal & Kurasi Tim', '27 Juni – 3 Juli 2026', 'Phase Ingestion', 'Proses seleksi proposal dan kurasi peserta, penentuan 50 tim terdaftar yang akan melanjutkan ke tahap pengembangan WebGIS.', 2),
('P004', 'Pengumuman 50 Tim Terkurasi', '4 Juli 2026', 'Announcement', 'Tim terpilih diumumkan melalui kanal resmi MAPID.', 3),
('P005', 'Technical Meeting & Delegasi Fasilitas', '6 Juli 2026', 'Technical Meeting', 'Penjelasan teknis kompetisi, data, survey activities, fasilitas, timeline, GEO MAPID, MAPID MAPS, dan ketentuan WebGIS.', 4),
('P006', 'Mentoring 1 — Industry Demand & Creating Product bervalue sesuai market', '8 Juli 2026', 'Field Mentoring', 'Sesi mentoring awal mengenai analisis permintaan industri, segmentasi market spasial, dan perumusan value proposition produk WebGIS.', 5),
('P007', 'Mentoring 2 — Data Vis', '15 Juli 2026', 'Field Mentoring', 'Sesi mentoring interaktif tentang teknik visualisasi data geospasial, kartografi modern, dan desain UI/UX peta yang intuitif.', 6),
('P008', 'Mentoring 3 — PRD & Product Planning', '22 Juli 2026', 'Field Mentoring', 'Arahan mengenai PRD, struktur dokumen, user needs, fitur produk, user flow, kebutuhan data, dan rencana pengembangan WebGIS.', 7),
('P009', 'Survey Activities & Data Enrichment', '9 – 27 Juli 2026', 'Phase Ingestion', 'Tim melakukan pengayaan, validasi, atau pelengkapan data lapangan dengan survey activity budget.', 8),
('P010', 'Mentoring 4 — GEO MAPID, Database & MAPID MAPS', '29 Juli 2026', 'Field Mentoring', 'Arahan penggunaan GEO MAPID sebagai database dan MAPID MAPS sebagai basemap utama WebGIS.', 9),
('P011', 'Development WebGIS', '4 Juli – 11 September 2026', 'AI Implementation', 'Tim yang terkurasi mulai mengembangkan solusi WebGIS berbasis proposal yang telah disetujui, dengan mentoring teknis terbatas.', 10),
('P012', 'Privat 1on1 Sessions dengan Masing-Masing Tim (Rutin 2 Mingguan)', '4 Juli – 11 September 2026', 'Field Mentoring', 'Sesi asistensi privat dwi-mingguan untuk memantau arsitektur WebGIS, integrasi database, dan penyusunan dokumen PRD masing-masing tim.', 11),
('P013', 'Mentoring 5 — Product Review WebGIS', '19 Agustus 2026', 'Field Mentoring', 'Review progres WebGIS, struktur produk, kualitas visualisasi, interaksi peta, insight, dan kesesuaian kaidah MAPID.', 12),
('P014', 'Pengumpulan Final WebGIS & PRD', '11 September 2026', 'Submission', 'Peserta mengumpulkan link WebGIS, PRD, metadata, dokumentasi survey, dan metode pengolahan data.', 13),
('P015', 'Seleksi Grand Final', '14 – 18 September 2026', 'Phase Ingestion', 'Penilaian akhir oleh juri terhadap prototype WebGIS dan PRD yang diajukan oleh peserta, penentuan finalis yang akan tampil di acara utama.', 14),
('P016', 'Pengumuman Top 10 Finalis', '19 September 2026', 'Announcement', 'Top 10 finalis diumumkan untuk tampil di MAPID Catalyst 2026.', 15),
('P017', 'Mentoring 6 — Public Speaking & Final Presentation', '21 – 22 September 2026', 'Field Mentoring', 'Top 10 finalis mendapatkan mentoring public speaking, storytelling produk, demo WebGIS, dan simulasi presentasi final.', 16),
('P018', 'Final Preparation & Rehearsal', '21 – 23 September 2026', 'Phase Ingestion', 'Finalisasi venue dan layout, koordinasi teknis untuk final presentation dan showcase solusi WebGIS. Gladi bersih dan briefing final volunteer, serta sponsor.', 17),
('P019', 'MAPID Catalyst Day 1', '24 September 2026 (TBD)', 'Announcement', 'Penilaian teknis dan substansi solusi WebGIS Competition 2026 oleh dewan juri, sekaligus sesi WebGIS showcase terkurasi di mana finalis mempresentasikan prototype dan demo solusi mereka di hadapan audiens kampus dan komunitas geospasial muda.', 18),
('P020', 'MAPID Catalyst Day 2', '25 September 2026 (TBD)', 'Announcement', 'WebGIS showcase skala penuh yang menampilkan solusi para pemenang dan finalis kepada komunitas geospasial yang lebih luas, diikuti diskusi panel tentang transformasi lahan berkelanjutan, inovasi spasial, dan peran teknologi geospasial dalam pembangunan.', 19),
('P021', 'Post-Event Publication', '28 September – 5 Oktober 2026', 'Announcement', 'Publikasi karya, dokumentasi, recap kompetisi, sponsor report, dan post-event report.', 20);

-- ==========================================
-- Table 2: catalyst_tasks
-- ==========================================
DROP TABLE IF EXISTS catalyst_tasks CASCADE;
CREATE TABLE catalyst_tasks (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    workstream VARCHAR(100) NOT NULL,
    pic VARCHAR(100) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    start_date VARCHAR(50) NOT NULL,
    deadline VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    dependency TEXT,
    notes TEXT,
    blocker TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_tasks" ON catalyst_tasks FOR ALL USING (true) WITH CHECK (true);

-- Seed catalyst_tasks with the 21 master tasks
INSERT INTO catalyst_tasks (id, name, workstream, pic, priority, start_date, deadline, status, dependency, notes) VALUES
('T001', 'Finalize master timeline', 'Program Management', 'Hadi / Lead', 'High', '1 Mei 2026', '20 Mei 2026', 'In Progress', 'Draft timeline', 'Output: Master timeline approved'),
('T002', 'Set up weekly sync schedule', 'Program Management', 'Hadi / Lead', 'Medium', '18 Mei 2026', '22 Mei 2026', 'Done', 'Internal calendar', 'Output: Weekly sync schedule'),
('T003', 'Establish risk register', 'Program Management', 'Hadi / Lead', 'High', '15 Mei 2026', '25 Mei 2026', 'In Progress', 'Project scope', 'Output: Risk register'),
('T004', 'Finalize FAQ peserta', 'Academic & Competition', 'Fariz / Academy', 'High', '12 Mei 2026', '25 Mei 2026', 'In Progress', 'Guidance draft', 'Output: FAQ final'),
('T005', 'Complete PRD & Proposal template', 'Academic & Competition', 'Fariz / Academy', 'High', '19 Mei 2026', '30 Mei 2026', 'Not Started', 'Existing template', 'Output: Final PRD & proposal template'),
('T006', 'Finalize general guidance document', 'Academic & Competition', 'Fariz / Academy', 'High', '15 Mei 2026', '28 Mei 2026', 'Waiting Review', 'Latest guidance draft', 'Output: Published guidance'),
('T007', 'Prepare Property Go sample dataset', 'Data & Spatial Tech', 'Data Team', 'High', '1 Juni 2026', '3 Juli 2026', 'In Progress', 'Raw Property Go data', 'Output: Sample dataset'),
('T008', 'Write Data Dictionary & API rules', 'Data & Spatial Tech', 'Data Team', 'Medium', '8 Juni 2026', '3 Juli 2026', 'Not Started', 'Dataset schema', 'Output: Data dictionary & API rules'),
('T009', 'Setup GEO MAPID campaign template', 'Data & Spatial Tech', 'Tech Team', 'High', '1 Juni 2026', '3 Juli 2026', 'In Progress', 'GEO MAPID setup', 'Output: GEO MAPID campaign template'),
('T010', 'Write MAPID MAPS basemap guide', 'Data & Spatial Tech', 'Tech Team', 'Medium', '15 Juni 2026', '3 Juli 2026', 'Not Started', 'MAPID MAPS access', 'Output: Basemap guide'),
('T011', 'Prepare WA broadcast copy', 'Marketing & Design', 'Dwi / Marketing', 'Low', '26 Mei 2026', '5 Juni 2026', 'Not Started', 'Final CTA & timeline', 'Output: WA broadcast copy'),
('T012', 'Finalize Key Visual concept', 'Marketing & Design', 'Ica / Designer Team', 'High', '15 Mei 2026', '28 Mei 2026', 'In Progress', 'Creative brief', 'Output: Key visual concept'),
('T013', 'Create Launch Poster assets', 'Marketing & Design', 'Ica / Designer Team', 'High', '25 Mei 2026', '2 Juni 2026', 'Not Started', 'Key visual concept', 'Output: Launch poster assets'),
('T014', 'Finalize sponsor proposal & benefit package', 'Sponsorship & Outreach', 'Aulia / Partnership', 'High', '1 Juni 2026', '24 Juli 2026', 'Blocked', 'Sponsor benefit revision', 'Output: Sponsor proposal final'),
('T015', 'Compile initial outreach target list', 'Sponsorship & Outreach', 'Aulia / Partnership', 'Medium', '18 Mei 2026', '26 Mei 2026', 'Done', 'Sponsor categories', 'Output: Outreach target list'),
('T016', 'Finalize BINUS Auditorium requirements', 'Main Event Operational', 'Aulia / Partnership', 'High', '1 Juni 2026', '24 Juni 2026', 'In Progress', 'BINUS coordination', 'Output: Venue requirement document'),
('T017', 'Clean Menu Go 15 May campaign data', 'Data & Spatial Tech', 'Data Team', 'High', '15 Mei 2026', '24 Mei 2026', 'Not Started', 'Menu Go campaign data', 'Output: Clean dataset'),
('T018', 'Draft landing page copy', 'Marketing & Design', 'Dwi / Marketing', 'High', '18 Mei 2026', '25 Mei 2026', 'Not Started', 'One pager & guidance', 'Output: Landing page copy'),
('T019', 'Prepare mentor outline & attendance tracker', 'Academic & Competition', 'Fariz / Academy', 'Medium', '20 Juni 2026', '5 Juli 2026', 'Not Started', 'Mentoring agenda', 'Output: Mentor outline & tracker'),
('T020', 'Draft Survey Guideline & Mission Template', 'Data & Spatial Tech', 'Data Team', 'High', '25 Juni 2026', '8 Juli 2026', 'In Progress', 'Survey concept', 'Output: Survey guideline & mission template'),
('T021', 'Formulate survey budget allocation', 'Data & Spatial Tech', 'Data Team', 'High', '1 Juli 2026', '8 Juli 2026', 'Not Started', 'Budget assumption', 'Output: Survey budget guideline');

-- Set Blocker value manually on T014
UPDATE catalyst_tasks SET blocker = 'Sponsor Proposal Belum Dikirim. Menghambat proses outreach sponsor dan partnership.' WHERE id = 'T014';


-- ==========================================
-- Table 3: catalyst_org_members
-- ==========================================
DROP TABLE IF EXISTS catalyst_org_members CASCADE;
CREATE TABLE catalyst_org_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    division VARCHAR(100) NOT NULL,
    avatar_color VARCHAR(50) DEFAULT 'bg-indigo-600',
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_org_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_org_members" ON catalyst_org_members FOR ALL USING (true) WITH CHECK (true);

-- Seed catalyst_org_members
INSERT INTO catalyst_org_members (name, role, division, avatar_color, email, phone) VALUES
('Muftia', 'Advisor', 'Advisor', 'bg-zinc-800', 'email@mapid.co.id', '0811-0000-0000'),
('Bagus', 'Event Director', 'Event Director', 'bg-zinc-900', 'email@mapid.co.id', '0811-1111-1111'),
('Hadi', 'Project Lead', 'Steering Committee', 'bg-rose-500', 'sarah.lead@mapid.co.id', '0811-2222-2222'),
('Lagi Hiring', 'Program Manager', 'Program Manager', 'bg-teal-600', 'dina.pm@mapid.co.id', '0812-3333-3333'),
('Fariz', 'Academic & Competition', 'Academic & Competition', 'bg-indigo-600', 'ali.academy@mapid.co.id', '0812-4444-4444'),
('Data Team', 'Data Team', 'Data & Spatial Tech', 'bg-blue-600', 'data.engineer@mapid.co.id', '0816-5555-5555'),
('Tech Team', 'Tech Team', 'Data & Spatial Tech', 'bg-blue-500', 'tech.platform@mapid.co.id', '0816-6666-6666'),
('Freelance MAPID Community', 'Main Event Operational', 'Main Event Operational', 'bg-orange-600', 'heri.ops@mapid.co.id', '0819-9999-9999'),
('Aulia Freelance Community', 'Sponsorship & Outreach', 'Sponsorship & Outreach', 'bg-purple-600', 'indra.partner@mapid.co.id', '0815-1010-1010'),
('Dwi', 'Marketing & Design', 'Marketing & Design', 'bg-amber-500', 'rian.design@mapid.co.id', '0813-1212-1212'),
('Wina', 'Marketing & Design', 'Marketing & Design', 'bg-amber-400', 'lia.designer@mapid.co.id', '0813-1313-1313'),
('Ica', 'Marketing & Design', 'Marketing & Design', 'bg-amber-600', 'email@mapid.co.id', '0813-1414-1414');


-- ==========================================
-- Table 4: catalyst_documents
-- ==========================================
DROP TABLE IF EXISTS catalyst_documents CASCADE;
CREATE TABLE catalyst_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    link_url TEXT,
    notes TEXT,
    owner VARCHAR(100) DEFAULT 'User',
    status VARCHAR(50) DEFAULT 'Published',
    due_date VARCHAR(50),
    last_updated VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_documents" ON catalyst_documents FOR ALL USING (true) WITH CHECK (true);

-- Starts clean (empty array default). Seeding one manual template is optional.
