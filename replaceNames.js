const fs = require('fs');
const path = require('path');

const mappings = [
  { regex: /Sarah \/ PM/g, replacement: 'Hadi / Lead' },
  { regex: /Sarah \(Program Manager\)/g, replacement: 'Hadi (Project Lead)' },
  { regex: /Sarah, Ali/g, replacement: 'Hadi, Fariz' },
  { regex: /\bSarah\b(?!\.lead)/g, replacement: 'Hadi' },
  
  { regex: /Ali \/ Academy/g, replacement: 'Fariz / Academy' },
  { regex: /\bAli\b(?!\.academy)/g, replacement: 'Fariz' },
  
  { regex: /Rian \/ Design Team/g, replacement: 'Dwi / Marketing' },
  { regex: /Rian \/ Academy/g, replacement: 'Dwi / Marketing' },
  { regex: /Rian, Indra/g, replacement: 'Dwi, Aulia' },
  { regex: /\bRian\b(?!\.design)/g, replacement: 'Dwi' },
  
  { regex: /Lia \/ Design Team/g, replacement: 'Wina / Design Team' },
  { regex: /\bLia\b(?!\.designer)/g, replacement: 'Wina' },
  
  { regex: /Indra \/ Partnership/g, replacement: 'Aulia / Partnership' },
  { regex: /Indra \/ Partner/g, replacement: 'Aulia / Partner' },
  { regex: /Indra, Sarah/g, replacement: 'Aulia, Hadi' },
  { regex: /\bIndra\b(?!\.partner)/g, replacement: 'Aulia' },
  
  { regex: /Heri \/ Ops/g, replacement: 'Freelance / Ops' },
  { regex: /\bHeri\b(?!\.ops)/g, replacement: 'Freelance' }
];

const filesToProcess = [
  'app/mentoring/page.tsx',
  'app/page.tsx',
  'app/meeting-notes/page.tsx',
  'catalyst_operating_system.sql',
  'app/tasks/page.tsx',
  'app/timeline/page.tsx',
  'app/org-structure/page.tsx'
];

filesToProcess.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    mappings.forEach(m => {
      content = content.replace(m.regex, m.replacement);
    });
    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${file}`);
  }
});
