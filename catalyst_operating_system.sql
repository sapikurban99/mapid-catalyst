-- ==========================================
-- MAPID Catalyst 2026 Operating System DDL & Seed (Fully Revised Tasks)
-- Run this in your Supabase SQL Editor to clear and seed all 74 timeline-connected tasks
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
('P015', 'Seleksi Grand Final', '14 – 18 September 2026', 'Phase Ingestion', 'Penilaian akhir oleh juri terhadap prototype WebGIS and PRD yang diajukan oleh peserta, penentuan finalis yang akan tampil di acara utama.', 14),
('P016', 'Pengumuman Top 10 Finalis', '19 September 2026', 'Announcement', 'Top 10 finalis diumumkan untuk tampil di MAPID Catalyst 2026.', 15),
('P017', 'Mentoring 6 — Public Speaking & Final Presentation', '21 – 22 September 2026', 'Field Mentoring', 'Top 10 finalis mendapatkan mentoring public speaking, storytelling produk, demo WebGIS, dan simulasi presentasi final.', 16),
('P018', 'Final Preparation & Rehearsal', '21 – 23 September 2026', 'Phase Ingestion', 'Gladi bersih, venue walkthrough, sound check, dan rehearsal rundown final bersama seluruh panitia, volunteer, dan juri.', 17),
('P019', 'MAPID Catalyst Day 1', '24 September 2026 (TBD)', 'Announcement', 'Presentasi final dan demo WebGIS di hadapan dewan juri, sekaligus pameran peta interaktif hasil karya Top 10 finalis.', 18),
('P020', 'MAPID Catalyst Day 2', '25 September 2026 (TBD)', 'Announcement', 'Showcase WebGIS skala nasional, diskusi panel geospasial bersama expert, pengumuman pemenang, dan awarding ceremony.', 19),
('P021', 'Post-Event Publication', '28 September – 5 Oktober 2026', 'Announcement', 'Penyusunan sponsor report, dokumentasi recap kompetisi, rilis media massa, dan pengarsipan seluruh karya finalis.', 20);

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

-- Seed catalyst_tasks with 74 fully revised timeline-connected master tasks
INSERT INTO catalyst_tasks (id, name, workstream, pic, priority, start_date, deadline, status, dependency, notes) VALUES
('T001', 'Finalize master timeline final', 'Program Management', 'Hadi / Lead', 'High', '1 Mei 2026', '20 Mei 2026', 'In Progress', 'Draft timeline', 'Output: Master timeline approved'),
('T002', 'Set up weekly sync schedule', 'Program Management', 'Hadi / Lead', 'Medium', '18 Mei 2026', '22 Mei 2026', 'Done', 'Internal calendar', 'Output: Weekly sync schedule'),
('T003', 'Establish risk register', 'Program Management', 'Hadi / Lead', 'High', '15 Mei 2026', '25 Mei 2026', 'In Progress', 'Project scope', 'Output: Risk register'),
('T004', 'Set up project dashboard structure', 'Program Management', 'PM / Lead', 'High', '18 Mei 2026', '31 Mei 2026', 'In Progress', 'Timeline & task structure', 'Output: Webapp dashboard structure'),
('T005', 'Create decision log and meeting notes tracker', 'Program Management', 'PM / Lead', 'Medium', '20 Mei 2026', '31 Mei 2026', 'Not Started', 'Weekly sync', 'Output: Decision log template'),
('T006', 'Finalize FAQ peserta', 'Academic & Competition', 'Fariz / Academy', 'High', '12 Mei 2026', '25 Mei 2026', 'In Progress', 'Guidance draft', 'Output: FAQ final'),
('T007', 'Finalize general guidance document', 'Academic & Competition', 'Fariz / Academy', 'High', '15 Mei 2026', '28 Mei 2026', 'Waiting Review', 'Latest guidance draft', 'Output: Published guidance'),
('T008', 'Finalize proposal ide template', 'Academic & Competition', 'Fariz / Academy', 'High', '19 Mei 2026', '30 Mei 2026', 'Not Started', 'Existing template', 'Output: Proposal template final'),
('T009', 'Finalize PRD template', 'Academic & Competition', 'Fariz / Academy', 'High', '19 Mei 2026', '30 Mei 2026', 'Not Started', 'Existing PRD template', 'Output: PRD template final'),
('T010', 'Create judging rubric for proposal selection', 'Academic & Competition', 'Fariz / Academy', 'High', '25 Mei 2026', '7 Juni 2026', 'Not Started', 'Guidance final', 'Output: Proposal scoring rubric'),
('T011', 'Create Top 50 curation workflow', 'Academic & Competition', 'Fariz / Academy', 'High', '1 Juni 2026', '20 Juni 2026', 'Not Started', 'Proposal scoring rubric', 'Output: Curation workflow'),
('T012', 'Create announcement template for Top 50', 'Marketing & Design', 'Fariz + Dwi', 'Medium', '20 Juni 2026', '30 Juni 2026', 'Not Started', 'Top 50 workflow', 'Output: Announcement template'),
('T013', 'Prepare technical meeting deck', 'Academic & Competition', 'Fariz / Academy', 'High', '15 Juni 2026', '3 Juli 2026', 'Not Started', 'Guidance, datasets, basemap guide', 'Output: Technical meeting deck'),
('T014', 'Prepare technical meeting attendance & Q&A tracker', 'Academic & Competition', 'Fariz / Academy', 'Medium', '20 Juni 2026', '5 Juli 2026', 'Not Started', 'Technical meeting deck', 'Output: Attendance & Q&A tracker'),
('T015', 'Prepare mentoring outline — Industry Demand & Product Value', 'Academic & Competition', 'Fariz / Academy', 'High', '20 Juni 2026', '5 Juli 2026', 'Not Started', 'Mentoring framework', 'Output: Mentoring 1 outline'),
('T016', 'Prepare mentoring outline — Data Visualization', 'Academic & Competition', 'Fariz + Data Team', 'High', '25 Juni 2026', '10 Juli 2026', 'Not Started', 'Dataset & requirements', 'Output: Mentoring 2 outline'),
('T017', 'Prepare mentoring outline — PRD & Product Planning', 'Academic & Competition', 'Fariz / Academy', 'High', '25 Juni 2026', '17 Juli 2026', 'Not Started', 'PRD template', 'Output: Mentoring 3 outline'),
('T018', 'Prepare mentoring outline — GEO MAPID, Database & MAPID MAPS', 'Data & Spatial Tech', 'Tech Team', 'High', '1 Juli 2026', '24 Juli 2026', 'Not Started', 'GEO MAPID & basemap guides', 'Output: Mentoring 4 outline'),
('T019', 'Prepare mentoring outline — Product Review WebGIS', 'Academic & Competition', 'Fariz + Data Team', 'Medium', '1 Agustus 2026', '14 Agustus 2026', 'Not Started', 'Development progress', 'Output: Mentoring 5 review checklist'),
('T020', 'Prepare mentoring outline — Public Speaking & Final Presentation', 'Academic & Competition', 'Fariz / Academy', 'High', '1 September 2026', '16 September 2026', 'Not Started', 'Top 10 shortlist', 'Output: Mentoring 6 outline'),
('T021', 'Create 1-on-1 mentoring tracker', 'Academic & Competition', 'Fariz / Academy', 'High', '20 Juni 2026', '5 Juli 2026', 'Not Started', 'Top 50 list', 'Output: 1-on-1 tracker'),
('T022', 'Schedule biweekly 1-on-1 sessions with each team', 'Academic & Competition', 'Fariz / Academy', 'High', '4 Juli 2026', '11 Juli 2026', 'Not Started', 'Top 50 list', 'Output: 1-on-1 schedule'),
('T023', 'Track 1-on-1 session notes and follow-ups', 'Academic & Competition', 'Fariz / Academy', 'Medium', '4 Juli 2026', '11 September 2026', 'Not Started', '1-on-1 schedule', 'Output: Team progress log'),
('T024', 'Prepare Property Go sample dataset', 'Data & Spatial Tech', 'Data Team', 'High', '1 Juni 2026', '3 Juli 2026', 'In Progress', 'Raw Property Go data', 'Output: Property Go sample dataset'),
('T025', 'Clean Menu Go campaign data', 'Data & Spatial Tech', 'Data Team', 'High', '15 Mei 2026', '24 Mei 2026', 'Not Started', 'Menu Go campaign data', 'Output: Clean Menu Go dataset'),
('T026', 'Prepare UMKM Go sample dataset', 'Data & Spatial Tech', 'Data Team', 'High', '1 Juni 2026', '3 Juli 2026', 'Not Started', 'UMKM Go data', 'Output: UMKM Go sample dataset'),
('T027', 'Prepare Activity Data sample dataset', 'Data & Spatial Tech', 'Data Team', 'Medium', '1 Juni 2026', '3 Juli 2026', 'Not Started', 'Activity data schema', 'Output: Activity sample dataset'),
('T028', 'Write Data Dictionary', 'Data & Spatial Tech', 'Data Team', 'High', '8 Juni 2026', '3 Juli 2026', 'Not Started', 'Dataset schemas', 'Output: Data dictionary'),
('T029', 'Write API & Data Access Rules', 'Data & Spatial Tech', 'Tech Team', 'High', '8 Juni 2026', '3 Juli 2026', 'Not Started', 'API access setup', 'Output: API & data access guide'),
('T030', 'Setup GEO MAPID campaign template', 'Data & Spatial Tech', 'Tech Team', 'High', '1 Juni 2026', '3 Juli 2026', 'In Progress', 'GEO MAPID setup', 'Output: GEO MAPID campaign template'),
('T031', 'Write GEO MAPID database guide', 'Data & Spatial Tech', 'Tech Team', 'High', '15 Juni 2026', '3 Juli 2026', 'Not Started', 'GEO MAPID setup', 'Output: Database usage guide'),
('T032', 'Write MAPID MAPS basemap guide', 'Data & Spatial Tech', 'Tech Team', 'High', '15 Juni 2026', '3 Juli 2026', 'Not Started', 'MAPID MAPS access', 'Output: Basemap guide'),
('T033', 'Draft Survey Guideline & Mission Template', 'Data & Spatial Tech', 'Data Team', 'High', '25 Juni 2026', '8 Juli 2026', 'In Progress', 'Survey concept', 'Output: Survey guideline & mission template'),
('T034', 'Formulate survey budget allocation', 'Data & Spatial Tech', 'Data Team', 'High', '1 Juli 2026', '8 Juli 2026', 'Not Started', 'Budget assumption', 'Output: Survey budget guideline'),
('T035', 'Create survey output validation checklist', 'Data & Spatial Tech', 'Data Team', 'High', '1 Juli 2026', '12 Juli 2026', 'Not Started', 'Survey guideline', 'Output: Survey validation checklist'),
('T036', 'Monitor survey activities progress', 'Data & Spatial Tech', 'Data Team', 'High', '9 Juli 2026', '27 Juli 2026', 'Not Started', 'Top 50 list & survey plan', 'Output: Survey progress tracker'),
('T037', 'Review survey outputs per team', 'Data & Spatial Tech', 'Data Team', 'High', '20 Juli 2026', '31 Juli 2026', 'Not Started', 'Survey output data', 'Output: Survey review notes'),
('T038', 'Prepare WebGIS technical requirement document', 'Data & Spatial Tech', 'Tech Team', 'High', '10 Juni 2026', '3 Juli 2026', 'Not Started', 'Guidance & platform rules', 'Output: WebGIS technical requirement doc'),
('T039', 'Create final submission checklist', 'Academic & Competition', 'Fariz + Data Team', 'High', '15 Agustus 2026', '1 September 2026', 'Not Started', 'PRD & WebGIS requirements', 'Output: Submission checklist'),
('T040', 'Setup final submission form', 'Academic & Competition', 'Fariz + Tech Team', 'High', '20 Agustus 2026', '5 September 2026', 'Not Started', 'Submission checklist', 'Output: Final submission form'),
('T041', 'Create Grand Final scoring rubric', 'Academic & Competition', 'Fariz / Academy', 'High', '25 Agustus 2026', '7 September 2026', 'Not Started', 'Judging criteria', 'Output: Final scoring rubric'),
('T042', 'Confirm judges for grand final selection', 'Academic & Competition', 'Fariz + Aulia', 'High', '1 September 2026', '10 September 2026', 'Not Started', 'Judge shortlist', 'Output: Confirmed judges'),
('T043', 'Conduct Grand Final judging process', 'Academic & Competition', 'Fariz / Academy', 'High', '14 September 2026', '18 September 2026', 'Not Started', 'Submissions & rubric', 'Output: Top 10 finalist shortlist'),
('T044', 'Prepare Top 10 announcement copy & visual', 'Marketing & Design', 'Dwi + Ica', 'High', '12 September 2026', '18 September 2026', 'Not Started', 'Top 10 shortlist', 'Output: Announcement assets'),
('T045', 'Announce Top 10 finalists', 'Academic & Competition', 'Fariz + Dwi', 'High', '19 September 2026', '19 September 2026', 'Not Started', 'Announcement assets', 'Output: Published announcement'),
('T046', 'Prepare final presentation template', 'Academic & Competition', 'Fariz / Academy', 'Medium', '1 September 2026', '16 September 2026', 'Not Started', 'Public speaking framework', 'Output: Final presentation template'),
('T047', 'Conduct public speaking mentoring', 'Academic & Competition', 'Fariz / Academy', 'High', '21 September 2026', '22 September 2026', 'Not Started', 'Top 10 finalists', 'Output: Mentoring 6 completed'),
('T048', 'Finalist deck review and feedback', 'Academic & Competition', 'Fariz / Academy', 'High', '21 September 2026', '23 September 2026', 'Not Started', 'Finalist decks', 'Output: Deck feedback notes'),
('T049', 'Finalize sponsor proposal & benefit package', 'Sponsorship & Outreach', 'Aulia / Partnership', 'High', '1 Juni 2026', '24 Juli 2026', 'Blocked', 'Sponsor benefit structure', 'Output: Sponsor proposal final'),
('T050', 'Compile initial outreach target list', 'Sponsorship & Outreach', 'Aulia / Partnership', 'Medium', '18 Mei 2026', '26 Mei 2026', 'Done', 'Sponsor categories', 'Output: Sponsor outreach target list'),
('T051', 'Send sponsor proposal to target partners', 'Sponsorship & Outreach', 'Aulia / Partnership', 'High', '3 Juni 2026', '31 Juli 2026', 'Not Started', 'Sponsor proposal final', 'Output: Outreach emails sent'),
('T052', 'Track sponsor follow-up and negotiation', 'Sponsorship & Outreach', 'Aulia / Partnership', 'High', '10 Juni 2026', '31 Agustus 2026', 'Not Started', 'Outreach sent', 'Output: Sponsor tracker updated'),
('T053', 'Confirm sponsor benefit deliverables', 'Sponsorship & Outreach', 'Aulia / Partnership', 'High', '1 September 2026', '15 September 2026', 'Not Started', 'Confirmed sponsors', 'Output: Sponsor benefit checklist'),
('T054', 'Finalize BINUS Auditorium requirements', 'Main Event Operational', 'Aulia / Partnership', 'High', '1 Juni 2026', '24 Juni 2026', 'In Progress', 'BINUS coordination', 'Output: Venue requirement document'),
('T055', 'Confirm venue layout and booth area', 'Main Event Operational', 'Freelance MAPID Community', 'High', '1 Agustus 2026', '5 September 2026', 'Not Started', 'Venue requirement doc', 'Output: Venue layout plan'),
('T056', 'Confirm AV, internet, and technical equipment', 'Main Event Operational', 'Freelance MAPID Community', 'High', '1 Agustus 2026', '10 September 2026', 'Not Started', 'Venue layout plan', 'Output: AV & internet checklist'),
('T057', 'Recruit and brief event volunteers', 'Main Event Operational', 'Freelance MAPID Community', 'High', '15 Agustus 2026', '15 September 2026', 'Not Started', 'Volunteer checklist', 'Output: Volunteer roster'),
('T058', 'Create final rundown Day 1 and Day 2', 'Main Event Operational', 'Freelance MAPID Community', 'High', '1 September 2026', '15 September 2026', 'Not Started', 'Venue layout & flow', 'Output: Final rundown'),
('T059', 'Conduct final rehearsal', 'Main Event Operational', 'Freelance MAPID Community', 'High', '21 September 2026', '23 September 2026', 'Not Started', 'Final rundown', 'Output: Rehearsal completed'),
('T060', 'Execute MAPID Catalyst Day 1', 'Main Event Operational', 'Freelance MAPID Community', 'High', '24 September 2026', '24 September 2026', 'Not Started', 'Rehearsal completed', 'Output: Day 1 executed successfully'),
('T061', 'Execute MAPID Catalyst Day 2', 'Main Event Operational', 'Freelance MAPID Community', 'High', '25 September 2026', '25 September 2026', 'Not Started', 'Day 1 completed', 'Output: Day 2 executed successfully'),
('T062', 'Finalize Key Visual concept', 'Marketing & Design', 'Ica / Designer Team', 'High', '15 Mei 2026', '28 Mei 2026', 'In Progress', 'Creative brief', 'Output: Key visual concept'),
('T063', 'Create Launch Poster assets', 'Marketing & Design', 'Ica / Designer Team', 'High', '25 Mei 2026', '2 Juni 2026', 'Not Started', 'Key visual concept', 'Output: Launch poster assets'),
('T064', 'Draft landing page copy', 'Marketing & Design', 'Dwi / Marketing', 'High', '18 Mei 2026', '25 Mei 2026', 'Not Started', 'One pager & guidance', 'Output: Landing page copy'),
('T065', 'Publish landing page', 'Marketing & Design', 'Dwi + Tech Team', 'High', '26 Mei 2026', '7 Juni 2026', 'Not Started', 'Landing page copy & visual', 'Output: Landing page live'),
('T066', 'Prepare WA broadcast copy', 'Marketing & Design', 'Dwi / Marketing', 'Low', '26 Mei 2026', '5 Juni 2026', 'Not Started', 'Final timeline and CTA', 'Output: WA broadcast templates'),
('T067', 'Create registration campaign content', 'Marketing & Design', 'Dwi / Marketing', 'High', '1 Juni 2026', '26 Juni 2026', 'Not Started', 'Landing page live', 'Output: Registration campaign materials'),
('T068', 'Create mentoring announcement assets', 'Marketing & Design', 'Dwi + Ica', 'Medium', '1 Juli 2026', '29 Juli 2026', 'Not Started', 'Mentoring schedule', 'Output: Mentoring social templates'),
('T069', 'Create final event announcement assets', 'Marketing & Design', 'Dwi + Ica', 'High', '1 September 2026', '20 September 2026', 'Not Started', 'Top 10 list & event rundown', 'Output: Final showcase visual assets'),
('T070', 'Prepare post-event publication plan', 'Marketing & Design', 'Dwi / Marketing', 'Medium', '15 September 2026', '25 September 2026', 'Not Started', 'Event agenda & final outcomes', 'Output: Recap content plan'),
('T071', 'Publish post-event recap and winners', 'Marketing & Design', 'Dwi / Marketing', 'High', '28 September 2026', '5 Oktober 2026', 'Not Started', 'Event documentation', 'Output: Published recap articles'),
('T072', 'Compile sponsor report', 'Program Management', 'PM / Partnership', 'High', '26 September 2026', '5 Oktober 2026', 'Not Started', 'Sponsor benefit deliverables', 'Output: Sponsor report doc'),
('T073', 'Compile competition evaluation report', 'Program Management', 'PM / Academic', 'High', '26 September 2026', '5 Oktober 2026', 'Not Started', 'Judging and feedback data', 'Output: Catalyst 2026 evaluation report'),
('T074', 'Archive all documents, datasets, and outputs', 'Program Management', 'PM / Lead', 'Medium', '28 September 2026', '5 Oktober 2026', 'Not Started', 'All finalized project resources', 'Output: Unified project archives');

-- Set Blocker value manually on T049
UPDATE catalyst_tasks SET blocker = 'Sponsor Proposal Belum Dikirim. Menghambat proses outreach sponsor dan partnership.' WHERE id = 'T049';


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

-- ==========================================
-- Table 5: catalyst_kpis
-- ==========================================
DROP TABLE IF EXISTS catalyst_kpis CASCADE;
CREATE TABLE catalyst_kpis (
    id SERIAL PRIMARY KEY,
    metric VARCHAR(255) NOT NULL,
    target VARCHAR(255) NOT NULL,
    current VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'Not Started', 'In Progress', 'Done', 'At Risk'
    progress INTEGER NOT NULL DEFAULT 0, -- 0 to 100
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE catalyst_kpis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access on catalyst_kpis" ON catalyst_kpis FOR ALL USING (true) WITH CHECK (true);

-- Seed catalyst_kpis
INSERT INTO catalyst_kpis (metric, target, current, status, progress) VALUES
('Sponsor Confirmed', '4 Partners', '0 Confirmed', 'Not Started', 0),
('Dataset Ready', '5 Datasets', '0/5 Ready', 'Not Started', 0),
('Document Ready', '12 Docs', '0/12 Ready', 'Not Started', 0),
('Curated Teams', '50 Teams', '0 Teams', 'Not Started', 0),
('Top Finalists', '10 Teams', '0 Teams', 'Not Started', 0),
('Key Visual Ready', '1 Master Visual', '0', 'Not Started', 0),
('Landing Page Live', 'Live Site', 'Offline', 'Not Started', 0),
('Venue Confirmed', 'BINUS Auditorium', 'In Negotiation', 'Not Started', 0);
