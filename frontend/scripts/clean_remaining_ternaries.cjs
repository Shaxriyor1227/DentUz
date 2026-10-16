const fs = require('fs');
const path = require('path');

const UZ_PATH = path.resolve(__dirname, '../src/i18n/locales/uz.json');
const EN_PATH = path.resolve(__dirname, '../src/i18n/locales/en.json');

const uzData = JSON.parse(fs.readFileSync(UZ_PATH, 'utf8'));
const enData = JSON.parse(fs.readFileSync(EN_PATH, 'utf8'));

// Add parameterized keys
uzData.dashboard.greeting = "Xayrli kun, {{name}}";
enData.dashboard.greeting = "Good day, {{name}}";

uzData.dashboard.addAptChair = "Yangi qabul qo'shish, kreslo #{{chair}}";
enData.dashboard.addAptChair = "Add appointment, operatory #{{chair}}";

uzData.calendar.viewDaySchedule = "{{day}} kunlik jadvalini ko'rish";
enData.calendar.viewDaySchedule = "View {{day}} schedule";

uzData.finance.wordSaved = "{{count}} ta invoys Word hujjatiga yuklandi.";
enData.finance.wordSaved = "{{count}} invoices saved as Word document.";

uzData.patients.wordSaved = "{{count}} ta bemor ro'yxati Word hujjatiga yuklandi.";
enData.patients.wordSaved = "{{count}} patient records saved as Word document.";

uzData.settings.memberJoined = "{{name}} jamoaga muvaffaqiyatli qo'shildi.";
enData.settings.memberJoined = "{{name}} joined the practice team.";

uzData.settings.serviceUpdatedMsg = "{{name}} xizmati yangilandi.";
enData.settings.serviceUpdatedMsg = "{{name}} service updated.";

uzData.settings.serviceCreatedMsg = "{{name}} xizmati qo'shildi.";
enData.settings.serviceCreatedMsg = "{{name}} service added to catalog.";

uzData.common.pageOfTotal = "{{page}}-sahifa, jami {{total}}";
enData.common.pageOfTotal = "Page {{page}} of {{total}}";

uzData.treatmentPlan.filteredTooth = "Filtr: #{{id}} tish";
enData.treatmentPlan.filteredTooth = "Filtered: #{{id}}";

uzData.treatmentPlan.selectedTooth = "Tanlandi: #{{id}}";
enData.treatmentPlan.selectedTooth = "Selected: #{{id}}";

fs.writeFileSync(UZ_PATH, JSON.stringify(uzData, null, 2) + '\n', 'utf8');
fs.writeFileSync(EN_PATH, JSON.stringify(enData, null, 2) + '\n', 'utf8');

// Replace in Dashboard.jsx
const dashPath = path.resolve(__dirname, '../src/pages/Dashboard/Dashboard.jsx');
let dashContent = fs.readFileSync(dashPath, 'utf8');
dashContent = dashContent.replace(/\{i18n\.language === 'uz'\s*\?\s*`Xayrli kun, \$\{doctorGreetingName\}`\s*:\s*`Good day, \$\{doctorGreetingName\}`\}/g, "{t('dashboard.greeting', { name: doctorGreetingName })}");
dashContent = dashContent.replace(/title=\{i18n\.language === 'uz'\s*\?\s*`Yangi qabul qo'shish, kreslo #\$\{chair\.id\}`\s*:\s*`Add appointment, operatory #\$\{chair\.id\}`\}/g, "title={t('dashboard.addAptChair', { chair: chair.id })}");
fs.writeFileSync(dashPath, dashContent, 'utf8');

// Replace in Calendar.jsx
const calPath = path.resolve(__dirname, '../src/pages/Calendar/Calendar.jsx');
let calContent = fs.readFileSync(calPath, 'utf8');
calContent = calContent.replace(/title=\{i18n\.language === 'en'\s*\?\s*`View \$\{day\.fullName\} schedule`\s*:\s*`\$\{day\.fullName\} kunlik jadvalini ko'rish`\}/g, "title={t('calendar.viewDaySchedule', { day: day.fullName })}");
fs.writeFileSync(calPath, calContent, 'utf8');

// Replace in Finance.jsx
const finPath = path.resolve(__dirname, '../src/pages/Finance/Finance.jsx');
let finContent = fs.readFileSync(finPath, 'utf8');
finContent = finContent.replace(/message:\s*i18n\.language === 'en'\s*\?\s*`\$\{filteredInvoices\.length\} invoices saved as Word document\.`\s*:\s*`\$\{filteredInvoices\.length\} ta invoys Word hujjatiga yuklandi\.`/g, "message: t('finance.wordSaved', { count: filteredInvoices.length })");
fs.writeFileSync(finPath, finContent, 'utf8');

// Replace in Patients.jsx
const patPath = path.resolve(__dirname, '../src/pages/Patients/Patients.jsx');
let patContent = fs.readFileSync(patPath, 'utf8');
patContent = patContent.replace(/message:\s*i18n\.language === 'en'\s*\?\s*`\$\{allPatients\.length\} patient records saved as Word document\.`\s*:\s*`\$\{allPatients\.length\} ta bemor ro'yxati Word hujjatiga yuklandi\.`/g, "message: t('patients.wordSaved', { count: allPatients.length })");
fs.writeFileSync(patPath, patContent, 'utf8');

// Replace in Settings.jsx
const setPath = path.resolve(__dirname, '../src/pages/Settings/Settings.jsx');
let setContent = fs.readFileSync(setPath, 'utf8');
setContent = setContent.replace(/isEn \? `\$\{newMember\.name\} joined the practice team\.` : `\$\{newMember\.name\} jamoaga muvaffaqiyatli qo'shildi\.`/g, "t('settings.memberJoined', { name: newMember.name })");
setContent = setContent.replace(/isEn \? `\$\{serviceForm\.name\} service updated\.` : `\$\{serviceForm\.name\} xizmati yangilandi\.`/g, "t('settings.serviceUpdatedMsg', { name: serviceForm.name })");
setContent = setContent.replace(/isEn \? `\$\{serviceForm\.name\} service added to catalog\.` : `\$\{serviceForm\.name\} xizmati qo'shildi\.`/g, "t('settings.serviceCreatedMsg', { name: serviceForm.name })");
setContent = setContent.replace(/\{isEn \? `Page \$\{auditPage\} of \$\{auditTotalPages\}` : `\$\{auditPage\}-sahifa, jami \$\{auditTotalPages\}`\}/g, "{t('common.pageOfTotal', { page: auditPage, total: auditTotalPages })}");
fs.writeFileSync(setPath, setContent, 'utf8');

// Replace in TreatmentPlan.jsx
const tpPath = path.resolve(__dirname, '../src/pages/TreatmentPlan/TreatmentPlan.jsx');
let tpContent = fs.readFileSync(tpPath, 'utf8');
tpContent = tpContent.replace(/\(i18n\.language === 'en' \? `Filtered: #\$\{selectedToothId\}` : `Filtr: #\$\{selectedToothId\} tish`\)/g, "t('treatmentPlan.filteredTooth', { id: selectedToothId })");
tpContent = tpContent.replace(/\(i18n\.language === 'en' \? `Selected: #\$\{selectedToothId\} \(Filter list\)` : `Tanlandi: #\$\{selectedToothId\}`\)/g, "t('treatmentPlan.selectedTooth', { id: selectedToothId })");
fs.writeFileSync(tpPath, tpContent, 'utf8');

console.log('✅ Remaining parameterized ternaries cleanly converted to t()!');
