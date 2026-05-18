-- ==========================================
-- MAPID Catalyst 2026 Operating System DDL & Seed
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- Table 1: catalyst_timeline
-- ==========================================
DROP TABLE IF EXISTS catalyst_timeline CASCADE;
CREATE TABLE catalyst_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tahap VARCHAR(255) NOT NULL,
    periode_estimasi VARCHAR(255) NOT NULL,
    keterangan TEXT,
    category VARCHAR(100) DEFAULT 'General',
    owner VARCHAR(100) DEFAULT 'Hadi / Lead',
    supporting_team VARCHAR(255) DEFAULT 'All Team',
    status VARCHAR(50) DEFAULT 'Not Started',
    dependency TEXT,
    output TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_timeline" ON catalyst_timeline FOR ALL USING (true) WITH CHECK (true);

-- Seed catalyst_timeline
INSERT INTO catalyst_timeline (tahap, periode_estimasi, keterangan, category, owner, status) VALUES
('Fase Planning & Persiapan Kompetisi', '1 – 31 Mei 2026', 'Perumusan konsep, pembuatan timeline, persiapan dataset, penyusunan guideline, dan koordinasi partner.', 'General Milestone', 'Hadi / Lead', 'In Progress'),
('Pembukaan Pendaftaran & Pengumpulan Proposal', '8 – 26 Juni 2026', 'Peserta mendaftar dan mengumpulkan proposal ide WebGIS berbasis tema Maps That Think!', 'Competition Phase', 'Fariz / Academy', 'Not Started'),
('Seleksi Proposal & Kurasi Tim', '29 Juni – 3 Juli 2026', 'Panitia menyeleksi proposal dan menentukan 50 tim terkurasi.', 'Selection Phase', 'Hadi / Lead', 'Not Started'),
('Pengumuman 50 Tim Terkurasi', '4 Juli 2026', 'Tim terpilih diumumkan melalui kanal resmi MAPID.', 'General Milestone', 'Hadi / Lead', 'Not Started'),
('Technical Meeting & Delegasi Fasilitas', '6 Juli 2026', 'Penjelasan teknis kompetisi, data, survey activities, fasilitas, timeline, penggunaan GEO MAPID, penggunaan MAPID MAPS, dan ketentuan WebGIS.', 'Mentoring & Preparation', 'Fariz / Academy', 'Not Started'),
('Mentoring 1 — PRD & Product Planning', '8 Juli 2026', 'Peserta mendapatkan arahan mengenai PRD, struktur dokumen, user needs, fitur produk, user flow, kebutuhan data, dan rencana pengembangan WebGIS.', 'Mentoring & Preparation', 'Dwi / Marketing', 'Not Started'),
('Survey Activities & Data Enrichment', '9 – 27 Juli 2026', 'Tim melakukan pengayaan, validasi, atau pelengkapan data lapangan dengan dukungan survey activity budget.', 'Survey Phase', 'Gita / Operations', 'Not Started'),
('Mentoring 2 — GEO MAPID, Database & MAPID MAPS', '29 Juli 2026', 'Peserta mendapatkan arahan teknis mengimpor data survei lapangan, membuat database spasial di GEO MAPID, dan memvisualisasikan data menggunakan basemap MAPID MAPS.', 'Mentoring & Preparation', 'Tech Team', 'Not Started'),
('Pengerjaan WebGIS & Penyusunan PRD', '9 Juli – 20 Agustus 2026', 'Tim mengembangkan aplikasi WebGIS interaktif berbasis AI dan melengkapi PRD final.', 'Development Phase', 'All Teams', 'Not Started'),
('Mentoring 3 — Product Review WebGIS (Visual, Spatial, AI)', '19 Agustus 2026', 'Sesi mentoring interaktif di mana tim mempresentasikan progress WebGIS mereka untuk ditinjau dari sisi fungsionalitas peta, visualisasi spasial, dan fitur AI.', 'Mentoring & Preparation', 'Tech Team', 'Not Started'),
('Batas Akhir Pengumpulan WebGIS & PRD Final', '20 Agustus 2026 (Pukul 23:59 WIB)', 'Peserta mengumpulkan link WebGIS yang sudah online dan PRD final.', 'Final Milestone', 'Fariz / Academy', 'Not Started'),
('Penjurian Tahap 1 — Kurasi Top 10 Finalis', '24 Agustus – 4 September 2026', 'Juri menilai kesesuaian produk WebGIS dan dokumen PRD untuk menentukan 10 tim terbaik.', 'Judging Phase', 'Juri Panel', 'Not Started'),
('Pengumuman Top 10 Finalis', '7 September 2026', '10 tim terbaik diumumkan untuk melaju ke babak grand final showcase.', 'General Milestone', 'Hadi / Lead', 'Not Started'),
('Mentoring 4 — Public Speaking & Storytelling Demo WebGIS', '14 – 15 September 2026', 'Finalis mendapatkan pelatihan cara mempresentasikan peta mereka dengan narasi yang memukau (storytelling) dan melakukan demo aplikasi secara langsung.', 'Mentoring & Preparation', 'Hadi / Lead', 'Not Started'),
('Gladi Bersih & Technical Rehearsal', '18 September 2026', 'Finalis melakukan uji coba panggung, mikrofon, slide presentasi, koneksi internet, dan demo WebGIS di lokasi acara (BINUS).', 'General Milestone', 'Rudi / Ops Team', 'Not Started'),
('Showcase & Awarding — Day 1: Exhibition & Pitching', '19 September 2026', 'Finalis memamerkan WebGIS mereka di booth pameran BINUS dan mempresentasikan karya di hadapan panel juri utama.', 'Main Event Ops', 'All Team', 'Not Started'),
('Showcase & Awarding — Day 2: Awarding & Keynote Speech', '20 September 2026', 'Keynote speech tentang AI Spasial, pengumuman pemenang, pembagian hadiah, dan penutupan acara.', 'Main Event Ops', 'All Team', 'Not Started'),
('Publikasi Pemenang & Rilis Hasil Kompetisi', '21 – 30 September 2026', 'Dokumentasi, press release, artikel pemenang, dan publikasi peta interaktif di media sosial dan website resmi MAPID.', 'Marketing Phase', 'Rara / Marketing', 'Not Started');

-- ==========================================
-- Table 2: catalyst_documents
-- ==========================================
DROP TABLE IF EXISTS catalyst_documents CASCADE;
CREATE TABLE catalyst_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    owner VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    due_date VARCHAR(50),
    link_url TEXT,
    last_updated VARCHAR(50),
    reviewer VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_documents" ON catalyst_documents FOR ALL USING (true) WITH CHECK (true);

-- Seed catalyst_documents
INSERT INTO catalyst_documents (name, category, owner, status, due_date, link_url, last_updated, reviewer, notes) VALUES
('Competition Guidance & Rules', 'Participant Docs', 'Fariz / Academy', 'Published', '20 Mei 2026', 'https://mapid.co.id/docs/guidelines-2026.pdf', '18 Mei 2026', 'Hadi / Lead', 'Final version approved by directors.'),
('MAPID Catalyst FAQ', 'Participant Docs', 'Fariz / Academy', 'Drafting', '25 Mei 2026', 'https://docs.google.com/document/d/faq', '17 Mei 2026', 'Hadi / Lead', 'Drafting AI and survey budget sections.'),
('PRD & Product Template Document', 'Participant Docs', 'Fariz / Academy', 'Not Started', '30 Mei 2026', 'https://docs.google.com/document/d/prd-template', '-', 'Dwi / Marketing', NULL),
('Data Dictionary (UMKM Go & Property Go)', 'Technical Docs', 'Data Team', 'Need Review', '29 Mei 2026', 'https://mapid.co.id/docs/data-dictionary.pdf', '15 Mei 2026', 'Fariz / Academy', 'Reviewing spatial attribute descriptions.'),
('GEO MAPID Setup & API Guide', 'Technical Docs', 'Tech Team', 'Drafting', '4 Juni 2026', 'https://mapid.co.id/docs/geo-api-guide.pdf', '10 Mei 2026', 'Hadi / Lead', NULL),
('Survey Activity Guideline', 'Survey Docs', 'Gita / Operations', 'Drafting', '31 Mei 2026', 'https://docs.google.com/document/d/survey-guideline', '16 Mei 2026', 'Dwi / Marketing', 'Drafting photo taking requirements.'),
('MAPID Catalyst 2026 Sponsor Proposal', 'Sponsor Docs', 'Aulia / Partnership', 'Need Review', '25 Mei 2026', 'https://mapid.co.id/docs/sponsor-proposal.pdf', '18 Mei 2026', 'Hadi / Lead', 'Needs validation on Silver Tier booths.'),
('Main Event TOR & Rundown (BINUS)', 'Event Docs', 'Rudi / Ops', 'Drafting', '10 Juni 2026', 'https://docs.google.com/document/d/rundown', '12 Mei 2026', 'Hadi / Lead', NULL),
('RACI & Workstream Matrix', 'Internal Docs', 'Hadi / Lead', 'Published', '15 Mei 2026', 'https://docs.google.com/spreadsheets/d/raci', '14 Mei 2026', 'Directors', 'Owner assignments locked.');

-- ==========================================
-- Table 3: catalyst_tasks
-- ==========================================
DROP TABLE IF EXISTS catalyst_tasks CASCADE;
CREATE TABLE catalyst_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    workstream VARCHAR(100) NOT NULL,
    pic VARCHAR(100) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    deadline VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    dependency TEXT,
    doc_link TEXT,
    blocker TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_tasks" ON catalyst_tasks FOR ALL USING (true) WITH CHECK (true);

-- Seed catalyst_tasks
INSERT INTO catalyst_tasks (name, workstream, pic, priority, deadline, status, dependency, blocker, notes, doc_link) VALUES
('Finalize master timeline', 'Program Management', 'Hadi / Lead', 'High', '20 Mei 2026', 'In Progress', NULL, NULL, 'Ensure BINUS main event dates are locked.', NULL),
('Set up weekly sync schedule', 'Program Management', 'Hadi / Lead', 'Medium', '22 Mei 2026', 'Done', NULL, NULL, NULL, NULL),
('Establish risk register', 'Program Management', 'Hadi / Lead', 'High', '25 Mei 2026', 'In Progress', NULL, NULL, NULL, NULL),
('Finalize FAQ peserta', 'Competition', 'Fariz / Academy', 'High', '25 Mei 2026', 'In Progress', 'Guidance final', 'Need confirmation about max team members', 'Update AI and survey budget sections.', 'https://docs.google.com/document/d/faq'),
('Complete PRD & Proposal template', 'Competition', 'Fariz / Academy', 'High', '30 Mei 2026', 'Not Started', NULL, NULL, NULL, 'https://docs.google.com/document/d/prd-template'),
('Finalize general guidance document', 'Competition', 'Dwi / Marketing', 'High', '28 Mei 2026', 'Waiting Review', NULL, NULL, NULL, 'https://docs.google.com/document/d/guideline'),
('Prepare Property Go sample dataset', 'Dataset', 'Data Team', 'High', '25 Mei 2026', 'In Progress', NULL, NULL, 'Needs spatial standardization.', NULL),
('Clean Menu Go 15 May campaign data', 'Dataset', 'Data Team', 'High', '24 Mei 2026', 'Blocked', NULL, 'Format mismatch in region records', NULL, NULL),
('Write Data Dictionary & API rules', 'Dataset', 'Data Team', 'Medium', '29 Mei 2026', 'Not Started', NULL, NULL, NULL, NULL),
('Draft Survey Guideline & Mission Template', 'Survey Activities', 'Gita / Operations', 'High', '31 Mei 2026', 'In Progress', NULL, NULL, 'Define standard photography and location format.', NULL),
('Formulate survey budget allocation', 'Survey Activities', 'Gita / Operations', 'High', '2 Juni 2026', 'Not Started', NULL, NULL, 'Budget for 50 curated teams.', NULL),
('Setup GEO MAPID campaign template', 'Platform & Tech', 'Tech Team', 'High', '26 Mei 2026', 'In Progress', NULL, NULL, NULL, NULL),
('Write MAPID MAPS basemap guide', 'Platform & Tech', 'Tech Team', 'Medium', '4 Juni 2026', 'Not Started', NULL, NULL, NULL, NULL),
('Draft landing page copy', 'Marketing', 'Rara / Marketing', 'High', '25 Mei 2026', 'Done', NULL, NULL, NULL, 'https://docs.google.com/document/d/landing-copy'),
('Prepare WA broadcast copy', 'Marketing', 'Rara / Marketing', 'Low', '5 Juni 2026', 'Not Started', NULL, NULL, NULL, NULL),
('Finalize Key Visual concept', 'Design', 'Designer Team', 'High', '28 Mei 2026', 'In Progress', NULL, NULL, NULL, NULL),
('Create Launch Poster assets', 'Design', 'Designer Team', 'High', '2 Juni 2026', 'Not Started', 'Key Visual', NULL, NULL, NULL),
('Finalize sponsor proposal deck & tiering', 'Sponsor', 'Aulia / Partnership', 'High', '25 Mei 2026', 'Blocked', NULL, 'Indecision on Silver Tier booths', NULL, NULL),
('Compile initial outreach target list', 'Sponsor', 'Aulia / Partnership', 'Medium', '26 Mei 2026', 'Done', NULL, NULL, NULL, NULL),
('Finalize BINUS Auditorium requirements', 'Event Ops', 'Rudi / Ops', 'High', '10 Juni 2026', 'In Progress', NULL, NULL, NULL, NULL),
('Prepare mentor outline & attendance tracker', 'Mentoring', 'Fariz / Academy', 'Medium', '15 Juni 2026', 'Not Started', NULL, NULL, NULL, NULL);

-- ==========================================
-- Table 4: catalyst_participants
-- ==========================================
DROP TABLE IF EXISTS catalyst_participants CASCADE;
CREATE TABLE catalyst_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    leader VARCHAR(100) NOT NULL,
    contact VARCHAR(50) NOT NULL,
    members INTEGER DEFAULT 3,
    proposal_status VARCHAR(50) DEFAULT 'Submitted',
    curated_status VARCHAR(50) DEFAULT 'Top 50',
    dataset_focus VARCHAR(100) DEFAULT 'Menu Go',
    survey_area VARCHAR(255),
    prd_status VARCHAR(50) DEFAULT 'Pending',
    webgis_status VARCHAR(50) DEFAULT 'Not Started',
    finalist_status VARCHAR(50) DEFAULT 'Pending',
    stage VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_participants" ON catalyst_participants FOR ALL USING (true) WITH CHECK (true);

-- Seed catalyst_participants
INSERT INTO catalyst_participants (name, institution, leader, contact, members, proposal_status, curated_status, dataset_focus, survey_area, prd_status, webgis_status, stage, notes) VALUES
('Team Geoverse', 'ITB', 'Ahmad', '0812-3456-7890', 3, 'Accepted', 'Top 50', 'Menu Go', 'Bandung Wetan', 'Approved', 'In Progress', 'Development Phase', 'Focusing on local culinary spatial indexing using AI.'),
('SpatiaTech', 'UGM', 'Budi', '0813-9876-5432', 3, 'Accepted', 'Top 50', 'Property Go', 'Sleman, Yogyakarta', 'Need Revision', 'In Progress', 'Survey Phase', 'Validating property price attributes in Sleman suburbs.'),
('EcoMap', 'UI', 'Clara', '0811-5555-4444', 3, 'Accepted', 'Top 50', 'UMKM Go', 'Depok Margonda', 'Approved', 'Submitted', 'Final Submission', 'Mapped 45 small business entities using GEO MAPID.'),
('AI Mapper', 'BINUS University', 'Dedi', '0812-2222-3333', 3, 'Accepted', 'Top 50', 'Multiple', 'Jakarta Barat', 'Approved', 'In Progress', 'Development Phase', 'Combining property and menu datasets for commercial zoning analysis.'),
('UrbanPlanner', 'ITS', 'Elga', '0819-8888-9999', 2, 'Accepted', 'Top 50', 'Property Go', 'Surabaya Gubeng', 'Pending', 'Not Started', 'Top 50 Curated', NULL);

-- ==========================================
-- Table 5: catalyst_datasets
-- ==========================================
DROP TABLE IF EXISTS catalyst_datasets CASCADE;
CREATE TABLE catalyst_datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    owner VARCHAR(100) NOT NULL,
    status VARCHAR(100) NOT NULL,
    coverage VARCHAR(255),
    sample_status VARCHAR(50) DEFAULT 'Not Ready',
    dictionary_status VARCHAR(50) DEFAULT 'Not Ready',
    api_status VARCHAR(50) DEFAULT 'TBD',
    records_count VARCHAR(100) DEFAULT 'Belum Diketahui',
    format VARCHAR(100) NOT NULL,
    required_fields TEXT[],
    sensitivity VARCHAR(50) DEFAULT 'Public',
    sample_url TEXT,
    dictionary_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_datasets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_datasets" ON catalyst_datasets FOR ALL USING (true) WITH CHECK (true);

-- Seed catalyst_datasets
INSERT INTO catalyst_datasets (name, owner, status, coverage, sample_status, dictionary_status, api_status, records_count, format, required_fields, sensitivity, sample_url, dictionary_url, notes) VALUES
('Property Go', 'Data Team', 'Sample Ready', 'Pulau Jawa', 'Ready', 'Draft', 'TBD', '15,430 Records', 'GeoJSON / CSV', ARRAY['price_idr', 'building_area_sqm', 'land_area_sqm', 'latitude', 'longitude', 'property_type', 'province'], 'Public', 'https://mapid.co.id/datasets/samples/property_go.geojson', 'https://mapid.co.id/datasets/dictionary/property_go.pdf', 'Memerlukan standardisasi kolom penulisan alamat dan tipe properti sebelum dipublish penuh.'),
('Menu Go', 'Data Team', 'Need Cleaning', 'Kota Bandung & Surabaya', 'TBD', 'TBD', 'TBD', '8,920 Records', 'JSON / API', ARRAY['menu_name', 'price_idr', 'restaurant_name', 'cuisine_type', 'latitude', 'longitude', 'rating'], 'Internal Only', NULL, NULL, 'Diambil dari campaign 15 Mei. Terdapat ketidakcocokan tipe koordinat spasial di wilayah Surabaya.'),
('UMKM Go', 'Community / Data', 'Need Survey', 'Nasional (Terkonsentrasi di Kota Besar)', 'Not Ready', 'Not Ready', 'TBD', 'Belum Diketahui', 'GeoJSON', ARRAY['umkm_name', 'category', 'employee_count', 'monthly_revenue_range', 'latitude', 'longitude'], 'Public', NULL, NULL, 'Membutuhkan dukungan kegiatan survei lapangan dari 50 tim terkurasi untuk memperkaya data atribut.'),
('Activity Data', 'Data Team', 'Sample Ready', 'Jabodetabek', 'Ready', 'Draft', 'TBD', '24,500 Records', 'CSV', ARRAY['activity_type', 'timestamp', 'duration_minutes', 'commuter_flow', 'latitude', 'longitude'], 'Confidential', 'https://mapid.co.id/datasets/samples/activity_data.csv', 'https://mapid.co.id/datasets/dictionary/activity_data.pdf', 'Perlu pembersihan struktur agar format kolom spasial seragam.');

-- ==========================================
-- Table 6: catalyst_survey_plans
-- ==========================================
DROP TABLE IF EXISTS catalyst_survey_plans CASCADE;
CREATE TABLE catalyst_survey_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team VARCHAR(255) NOT NULL,
    area VARCHAR(255) NOT NULL,
    dataset VARCHAR(100) NOT NULL,
    target VARCHAR(100) NOT NULL,
    budget VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'Planned',
    output TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_survey_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_survey_plans" ON catalyst_survey_plans FOR ALL USING (true) WITH CHECK (true);

-- Seed catalyst_survey_plans
INSERT INTO catalyst_survey_plans (team, area, dataset, target, budget, status, output) VALUES
('Team Geoverse', 'Bandung Wetan', 'Menu Go', '50 Restoran', 'Rp 1,500,000', 'In Progress', '25/50 Restoran Terdata'),
('SpatiaTech', 'Sleman, Yogyakarta', 'Property Go', '80 Kaveling', 'Rp 1,500,000', 'In Progress', '40/80 Kaveling Terdata'),
('EcoMap', 'Depok Margonda', 'UMKM Go', '60 Warung', 'Rp 1,500,000', 'Completed', '60/60 Warung Selesai'),
('AI Mapper', 'Jakarta Barat', 'Menu Go & Property', '100 Titik', 'Rp 2,000,000', 'Planned', 'Belum Dimulai');

-- ==========================================
-- Table 7: catalyst_survey_budgets
-- ==========================================
DROP TABLE IF EXISTS catalyst_survey_budgets CASCADE;
CREATE TABLE catalyst_survey_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team VARCHAR(255) NOT NULL,
    allocated NUMERIC DEFAULT 0,
    disbursed NUMERIC DEFAULT 0,
    used NUMERIC DEFAULT 0,
    remaining NUMERIC DEFAULT 0,
    report_status VARCHAR(50) DEFAULT 'Not Submitted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_survey_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_survey_budgets" ON catalyst_survey_budgets FOR ALL USING (true) WITH CHECK (true);

-- Seed catalyst_survey_budgets
INSERT INTO catalyst_survey_budgets (team, allocated, disbursed, used, remaining, report_status) VALUES
('Team Geoverse', 1500000, 750000, 600000, 150000, 'Draft'),
('SpatiaTech', 1500000, 750000, 700000, 50000, 'Not Submitted'),
('EcoMap', 1500000, 1500000, 1450000, 50000, 'Submitted'),
('AI Mapper', 2000000, 0, 0, 0, 'Not Submitted');

-- ==========================================
-- Table 8: catalyst_survey_outputs
-- ==========================================
DROP TABLE IF EXISTS catalyst_survey_outputs CASCADE;
CREATE TABLE catalyst_survey_outputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team VARCHAR(255) NOT NULL,
    photos INTEGER DEFAULT 0,
    records INTEGER DEFAULT 0,
    notes INTEGER DEFAULT 0,
    metadata VARCHAR(50) DEFAULT 'Not Submitted',
    validation VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_survey_outputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_survey_outputs" ON catalyst_survey_outputs FOR ALL USING (true) WITH CHECK (true);

-- Seed catalyst_survey_outputs
INSERT INTO catalyst_survey_outputs (team, photos, records, notes, metadata, validation) VALUES
('Team Geoverse', 65, 25, 12, 'Submitted', 'Need Review'),
('SpatiaTech', 110, 40, 25, 'Submitted', 'Pending'),
('EcoMap', 180, 60, 45, 'Submitted', 'Approved'),
('AI Mapper', 0, 0, 0, 'Not Submitted', 'Pending');

-- ==========================================
-- Table 9: catalyst_mentoring_sessions
-- ==========================================
DROP TABLE IF EXISTS catalyst_mentoring_sessions CASCADE;
CREATE TABLE catalyst_mentoring_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session VARCHAR(100) NOT NULL,
    date VARCHAR(100) NOT NULL,
    audience VARCHAR(255),
    mentor VARCHAR(100) NOT NULL,
    topic TEXT NOT NULL,
    attendance VARCHAR(100) DEFAULT 'TBD',
    output TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_mentoring_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_mentoring_sessions" ON catalyst_mentoring_sessions FOR ALL USING (true) WITH CHECK (true);

-- Seed catalyst_mentoring_sessions
INSERT INTO catalyst_mentoring_sessions (session, date, audience, mentor, topic, attendance, output) VALUES
('Mentoring 1', '8 Juli 2026', 'Top 50 Tim', 'Ashraf (MAPID PM)', 'PRD & Product Planning', '48 / 50 Tim', 'Draft dokumen PRD tim'),
('Mentoring 2', '29 Juli 2026', 'Top 50 Tim', 'Hassan (MAPID Tech)', 'GEO MAPID & MAPID MAPS Basemap Setup', 'TBD', 'Database & WebGIS setup'),
('Mentoring 3', '19 Agustus 2026', 'Top 50 Tim', 'Hassan / Ashraf', 'Product Review WebGIS (Visual, Spatial, AI)', 'TBD', 'Revisi produk WebGIS'),
('Mentoring 4', '14 – 15 September 2026', 'Top 10 Finalis', 'Hadi (Project Lead)', 'Public Speaking & storytelling demo WebGIS', '- (TBD)', 'Final pitch deck & live demo');

-- ==========================================
-- Table 10: catalyst_team_mentoring
-- ==========================================
DROP TABLE IF EXISTS catalyst_team_mentoring CASCADE;
CREATE TABLE catalyst_team_mentoring (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team VARCHAR(255) NOT NULL,
    mentoring_1 VARCHAR(50) DEFAULT '-',
    mentoring_2 VARCHAR(50) DEFAULT '-',
    mentoring_3 VARCHAR(50) DEFAULT '-',
    public_speaking VARCHAR(50) DEFAULT '-',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_team_mentoring ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_team_mentoring" ON catalyst_team_mentoring FOR ALL USING (true) WITH CHECK (true);

-- Seed catalyst_team_mentoring
INSERT INTO catalyst_team_mentoring (team, mentoring_1, mentoring_2, mentoring_3, public_speaking, notes) VALUES
('Team Geoverse', 'Attended', 'Attended', 'Need Follow-up', '-', 'PRD draft is excellent, but needs revision on AI model description.'),
('SpatiaTech', 'Attended', 'Need Follow-up', 'Attended', '-', 'Missed session 2 due to field survey. Done follow-up reading.'),
('EcoMap', 'Attended', 'Attended', 'Attended', '-', 'All session requirements satisfied.'),
('AI Mapper', 'Attended', 'Attended', 'Attended', '-', 'Good progress in spatial attribute enrichment.'),
('UrbanPlanner', 'Absent', 'Need Follow-up', 'Absent', '-', 'Critical warning. Missed multiple mentoring sessions.');

-- ==========================================
-- Table 11: catalyst_proposal_scores
-- ==========================================
DROP TABLE IF EXISTS catalyst_proposal_scores CASCADE;
CREATE TABLE catalyst_proposal_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team VARCHAR(255) NOT NULL,
    relevansi NUMERIC DEFAULT 0,
    community_data NUMERIC DEFAULT 0,
    survey_plan NUMERIC DEFAULT 0,
    ai_processing NUMERIC DEFAULT 0,
    inovasi NUMERIC DEFAULT 0,
    feasibility NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    rank INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_proposal_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_proposal_scores" ON catalyst_proposal_scores FOR ALL USING (true) WITH CHECK (true);

-- Seed catalyst_proposal_scores
INSERT INTO catalyst_proposal_scores (team, relevansi, community_data, survey_plan, ai_processing, inovasi, feasibility, total, rank) VALUES
('Team Geoverse', 90, 88, 92, 85, 90, 88, 533, 1),
('EcoMap', 88, 90, 85, 88, 87, 90, 528, 2),
('AI Mapper', 85, 85, 90, 92, 92, 82, 526, 3),
('SpatiaTech', 82, 85, 88, 80, 85, 88, 508, 4);

-- ==========================================
-- Table 12: catalyst_webgis_scores
-- ==========================================
DROP TABLE IF EXISTS catalyst_webgis_scores CASCADE;
CREATE TABLE catalyst_webgis_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team VARCHAR(255) NOT NULL,
    data_survey NUMERIC DEFAULT 0,
    ai_processing NUMERIC DEFAULT 0,
    spatial_insight NUMERIC DEFAULT 0,
    survey_quality NUMERIC DEFAULT 0,
    webgis_feature NUMERIC DEFAULT 0,
    ux_storytelling NUMERIC DEFAULT 0,
    performance NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    rank INTEGER,
    finalist_status VARCHAR(50) DEFAULT 'Participant',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_webgis_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_webgis_scores" ON catalyst_webgis_scores FOR ALL USING (true) WITH CHECK (true);

-- Seed catalyst_webgis_scores
INSERT INTO catalyst_webgis_scores (team, data_survey, ai_processing, spatial_insight, survey_quality, webgis_feature, ux_storytelling, performance, total, rank, finalist_status) VALUES
('EcoMap', 92, 90, 95, 90, 92, 94, 88, 641, 1, 'Winner'),
('Team Geoverse', 90, 88, 90, 92, 90, 92, 90, 632, 2, 'Runner Up'),
('AI Mapper', 88, 94, 88, 85, 94, 88, 92, 629, 3, 'Top 10'),
('SpatiaTech', 85, 82, 85, 88, 85, 85, 85, 595, 4, 'Top 10');

-- ==========================================
-- Table 13: catalyst_sponsors
-- ==========================================
DROP TABLE IF EXISTS catalyst_sponsors CASCADE;
CREATE TABLE catalyst_sponsors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    tier VARCHAR(100) NOT NULL,
    pic VARCHAR(100) NOT NULL,
    status VARCHAR(100) NOT NULL,
    next_action TEXT,
    deadline VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_sponsors" ON catalyst_sponsors FOR ALL USING (true) WITH CHECK (true);

-- Seed catalyst_sponsors
INSERT INTO catalyst_sponsors (partner, type, tier, pic, status, next_action, deadline) VALUES
('BINUS University', 'Venue Partner', 'Innovation Partner', 'Hadi / Lead', 'In Discussion', 'Follow up auditorium availability', '30 Mei 2026'),
('GoTo Financial', 'Sponsor', 'Strategic Partner', 'Aulia / Partner', 'In Negotiation', 'Send customized Silver tier pricing proposal', '25 Mei 2026'),
('Himpunan Mahasiswa Geografi UGM', 'Collaborator', 'Community Partner', 'Fariz / Academy', 'Confirmed', 'Send booth assembly guidelines', '5 Juni 2026'),
('AWS Indonesia', 'Sponsor', 'Tech Cloud Partner', 'Hadi / Lead', 'Prospect', 'Cold email AWS tech outreach representative', '27 Mei 2026');

-- ==========================================
-- Table 14: catalyst_sponsor_benefits
-- ==========================================
DROP TABLE IF EXISTS catalyst_sponsor_benefits CASCADE;
CREATE TABLE catalyst_sponsor_benefits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner VARCHAR(255) NOT NULL,
    logo VARCHAR(50) DEFAULT 'Not Yet',
    booth VARCHAR(50) DEFAULT 'No',
    speaker VARCHAR(50) DEFAULT 'No',
    judge VARCHAR(50) DEFAULT 'No',
    media_mention VARCHAR(50) DEFAULT '-',
    report VARCHAR(50) DEFAULT '-',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_sponsor_benefits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_sponsor_benefits" ON catalyst_sponsor_benefits FOR ALL USING (true) WITH CHECK (true);

-- Seed catalyst_sponsor_benefits
INSERT INTO catalyst_sponsor_benefits (partner, logo, booth, speaker, judge, media_mention, report) VALUES
('BINUS University', 'Received', 'Yes', 'Yes', 'No', 'Done', '-'),
('GoTo Financial', 'Pending', 'Yes', 'Yes', 'Yes', 'Pending', 'Not Yet'),
('Himpunan UGM', 'Received', 'No', 'No', 'No', 'Done', '-');

-- ==========================================
-- Table 15: catalyst_assets
-- ==========================================
DROP TABLE IF EXISTS catalyst_assets CASCADE;
CREATE TABLE catalyst_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    priority VARCHAR(50) DEFAULT 'P1',
    format VARCHAR(255),
    owner VARCHAR(100) NOT NULL,
    status VARCHAR(100) NOT NULL,
    deadline VARCHAR(50),
    link_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_assets" ON catalyst_assets FOR ALL USING (true) WITH CHECK (true);

-- Seed catalyst_assets
INSERT INTO catalyst_assets (name, priority, format, owner, status, deadline, notes, link_url) VALUES
('Main Key Visual Catalyst 2026', 'P0', '16:9, 4:5, 9:16', 'Dwi / Marketing', 'In Review', '28 Mei 2026', 'Subtle AI styling with maps.', NULL),
('Launching Poster & Feed Banner', 'P0', 'Feed (4:5), Story (9:16)', 'Dwi / Marketing', 'Draft 1', '2 Juni 2026', 'Depends on locked Main Key Visual.', NULL),
('Timeline Stepper Infographic', 'P0', '4:5, 16:9', 'Dwi / Marketing', 'Not Started', '4 Juni 2026', NULL, NULL),
('Carousel Explainer: Maps That Think', 'P1', 'Feed (4:5)', 'Wina / Design Team', 'Revision', '5 Juni 2026', 'Feedback: typography too small in page 4.', NULL),
('Sponsor Deck Visual Template', 'P2', '16:9 PDF', 'Wina / Design Team', 'Approved', '22 Mei 2026', NULL, 'https://mapid.co.id/assets/design/sponsor-deck-template.fig');

-- ==========================================
-- Table 16: catalyst_event_ops
-- ==========================================
DROP TABLE IF EXISTS catalyst_event_ops CASCADE;
CREATE TABLE catalyst_event_ops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    owner VARCHAR(100) NOT NULL,
    status VARCHAR(100) NOT NULL,
    cost_estimate VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_event_ops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_event_ops" ON catalyst_event_ops FOR ALL USING (true) WITH CHECK (true);

-- Seed catalyst_event_ops
INSERT INTO catalyst_event_ops (item, category, owner, status, cost_estimate, notes) VALUES
('Sewa Auditorium BINUS & Security', 'Venue Setup', 'Rudi / Ops Team', 'Completed', 'Sponsored / Free', 'Capacity 500 seats. Mic and projector check done.'),
('Setup 15 Booths untuk Top 10 + Sponsor', 'Exhibition Booths', 'Rudi / Ops Team', 'In Progress', 'Rp 8,500,000', 'T-structure assembly locked by vendors.'),
('Internet Bandwidth Dedicated 100Mbps', 'AV & Technical', 'Tech Team / BINUS IT', 'Pending Approval', 'Rp 2,000,000', 'Critical for participants live demo mapping.'),
('Cetak Banner, Backdrop & Signage Arah', 'Signage & Print', 'Rara / Marketing', 'In Progress', 'Rp 3,500,000', 'Graphics currently in final production.'),
('Konsumsi Panitia, Juri & Pembicara', 'Hospitality & Crew', 'Hadi / Lead', 'Not Started', 'Rp 5,000,000', 'Final menu approval pending.');

-- ==========================================
-- Table 17: catalyst_risks
-- ==========================================
DROP TABLE IF EXISTS catalyst_risks CASCADE;
CREATE TABLE catalyst_risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hazard TEXT NOT NULL,
    impact INTEGER DEFAULT 3,
    probability INTEGER DEFAULT 3,
    score INTEGER DEFAULT 9,
    owner VARCHAR(100) NOT NULL,
    mitigation TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_risks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_risks" ON catalyst_risks FOR ALL USING (true) WITH CHECK (true);

-- Seed catalyst_risks
INSERT INTO catalyst_risks (hazard, impact, probability, score, owner, mitigation, status) VALUES
('Kebocoran data rahasia UMKM Go / Property Go', 5, 2, 10, 'Tech Team / Data Team', 'Enkripsi key API & verifikasi identitas 50 tim terkurasi sebelum penyerahan credential.', 'Active'),
('Kehadiran peserta di BINUS minim karena jadwal bentrok kuliah', 4, 3, 12, 'Hadi / Lead', 'Surat undangan dispensasi resmi dari MAPID & BINUS dikirim ke masing-masing kaprodi.', 'Mitigated'),
('Server GEO MAPID overload saat Demo Day live', 5, 2, 10, 'Tech Team', 'Mempersiapkan server mirror & load balancer tambahan H-3 acara.', 'Active'),
('Sponsor tier utama mundur karena birokrasi internal', 4, 2, 8, 'Aulia / Partner', 'Mempercepat pengiriman proposal sponsor ke prospek alternatif AWS/GoTo.', 'Active');

-- ==========================================
-- Table 18: catalyst_meeting_notes
-- ==========================================
DROP TABLE IF EXISTS catalyst_meeting_notes CASCADE;
CREATE TABLE catalyst_meeting_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    date VARCHAR(50) NOT NULL,
    attendees TEXT,
    key_decision TEXT,
    action_item TEXT,
    owner VARCHAR(100) NOT NULL,
    link_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_meeting_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_meeting_notes" ON catalyst_meeting_notes FOR ALL USING (true) WITH CHECK (true);

-- Seed catalyst_meeting_notes
INSERT INTO catalyst_meeting_notes (title, date, attendees, key_decision, action_item, owner, link_url) VALUES
('Weekly Sync 1: Kickoff Persiapan', '11 Mei 2026', 'Hadi, Fariz, Rudi, Dwi, Aulia', 'Tanggal pendaftaran disepakati 8 – 26 Juni 2026. Skema timeline 17 tahap dilock.', 'Draft guidance dokumen FAQ', 'Fariz / Academy', 'https://docs.google.com/document/d/sync-1'),
('Weekly Sync 2: Standardisasi Dataset', '18 Mei 2026', 'Hadi, Fariz, Data Team, Tech Team', 'Dataset UMKM Go butuh survei dari 50 tim terkurasi. Budget survei dialokasikan per-area.', 'Clean data Menu Go campaign 15 Mei', 'Data Team', 'https://docs.google.com/document/d/sync-2'),
('Partnership & Sponsor Alignment', '15 Mei 2026', 'Aulia, Hadi, Directors', 'Mengunci lokasi di BINUS University dengan skema barter sponsorship sewa venue.', 'Finalisasi proposal sponsor deck & tiering', 'Aulia / Partner', 'https://docs.google.com/document/d/sync-3');

-- ==========================================
-- Table 19: catalyst_org_members
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
('Muftia', 'Event Director', 'Event Director', 'bg-zinc-800', 'email@mapid.co.id', '0811-0000-0000'),
('Bagus', 'Advisor', 'Advisor', 'bg-zinc-900', 'email@mapid.co.id', '0811-1111-1111'),
('Hadi', 'Project Lead', 'Steering Committee', 'bg-rose-500', 'sarah.lead@mapid.co.id', '0811-2222-2222'),
('Lagi Hiring', 'Program Manager', 'Program Manager', 'bg-teal-600', 'dina.pm@mapid.co.id', '0812-3333-3333'),
('Fariz', 'Academy Coordinator', 'Academic & Competition', 'bg-indigo-600', 'ali.academy@mapid.co.id', '0812-4444-4444'),
('Data Team', 'Data Engineers', 'Data & Spatial Tech', 'bg-blue-600', 'data.engineer@mapid.co.id', '0816-5555-5555'),
('Tech Team', 'Core Tech & Platforms', 'Data & Spatial Tech', 'bg-blue-500', 'tech.platform@mapid.co.id', '0816-6666-6666'),
('Gita', 'Operations Lead', 'Data & Spatial Tech', 'bg-emerald-600', 'gita.ops@mapid.co.id', '0814-7777-7777'),
('Rudi', 'Logistics Coordinator', 'Data & Spatial Tech', 'bg-emerald-500', 'rudi.ops@mapid.co.id', '0814-8888-8888'),
('Freelance MAPID Community', 'Main Event Coordinator', 'Main Event Operational', 'bg-orange-600', 'heri.ops@mapid.co.id', '0819-9999-9999'),
('Aulia Freelance Community', 'Partnership Manager', 'Sponsorship & Outreach', 'bg-purple-600', 'indra.partner@mapid.co.id', '0815-1010-1010'),
('Dwi', 'Marketing', 'Marketing & Design', 'bg-amber-500', 'rian.design@mapid.co.id', '0813-1212-1212'),
('Wina', 'Graphic Designer', 'Marketing & Design', 'bg-amber-400', 'lia.designer@mapid.co.id', '0813-1313-1313'),
('Ica', 'Peran / Job Title', 'Marketing & Design', 'bg-amber-600', 'email@mapid.co.id', '0813-1414-1414');
