const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const fs   = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const { declineFio, applyFioFormat } = require('../utils/fio');

const MONTHS = ['января','февраля','марта','апреля','мая','июня',
                'июля','августа','сентября','октября','ноября','декабря'];

function formatDate(val) {
  if (!val) return '';
  const [y, m, d] = val.split('-');
  const day = String(parseInt(d)).padStart(2, '0');
  return `«${day}» ${MONTHS[parseInt(m) - 1]} ${y}`;
}

const prisma = new PrismaClient();

const TEMPLATES_DIR = path.join(__dirname, '../../../templates');

function getTemplatePath(count, place) {
  const type = place === 'кафедра' ? 'kaf' : 'org';
  return path.join(TEMPLATES_DIR, `${count}_template_${type}.docx`);
}

// POST /api/generate
router.post('/', async (req, res) => {
  const {
    directionId,
    practiceTypes,   // [{ practiceTypeId, dateStart, dateEnd, order }]
    place,
    enterpriseName,
    enterpriseAddress,
    studentGroup,
    studentFio,
    fioFormat,
  } = req.body;

  // Validate
  if (!directionId || !practiceTypes?.length || !place || !studentGroup || !studentFio) {
    return res.status(400).json({ error: 'Не все поля заполнены' });
  }
  if (practiceTypes.length > 3) {
    return res.status(400).json({ error: 'Максимум 3 практики' });
  }
  for (const pt of practiceTypes) {
    if (!pt.dateStart || !pt.dateEnd) {
      return res.status(400).json({ error: 'Укажите даты для всех практик' });
    }
  }
  if (place === 'предприятие' && (!enterpriseName || !enterpriseAddress)) {
    return res.status(400).json({ error: 'Укажите данные предприятия' });
  }

  // Load direction
  const direction = await prisma.direction.findUnique({ where: { id: parseInt(directionId) } });
  if (!direction) return res.status(404).json({ error: 'Направление не найдено' });

  // Load practice types in order
  const ptRecords = [];
  for (const pt of practiceTypes) {
    const rec = await prisma.practiceType.findUnique({ where: { id: parseInt(pt.practiceTypeId) } });
    if (!rec) return res.status(404).json({ error: 'Вид практики не найден' });
    ptRecords.push({ ...rec, dateStart: pt.dateStart, dateEnd: pt.dateEnd });
  }

  // Organization
  let organization, address;
  if (place === 'кафедра') {
    organization = `кафедра ${direction.kafName}, ТУСУР`;
    address = direction.kafAddress || 'г. Томск';
  } else {
    organization = enterpriseName;
    address = enterpriseAddress;
  }

  const fmt = fioFormat || 'full';
  const count = ptRecords.length;

  const studentFioGenitive = applyFioFormat(declineFio(studentFio, 'genitive'), fmt);
  const headNameDative     = applyFioFormat(declineFio(direction.headNameFull, 'dative'), fmt);
  const headNameNominative = applyFioFormat(direction.headNameFull, fmt);

  // Собираем templateData с нумерованными полями
  const templateData = {
    headTitle:     direction.headTitle,
    kafShort:      direction.shortName,
    headNameFull:  headNameDative,
    headNameShort: headNameNominative,
    group:         studentGroup,
    fio:           studentFioGenitive,
    organization,
    address,
  };

  // Поля с номерами для каждой практики
  ptRecords.forEach((pt, i) => {
    const n = i + 1;
    templateData[`practice${n}`]      = pt.correctForm || pt.name;
    templateData[`supervisorName${n}`] = applyFioFormat(pt.supervisorName, fmt);
    templateData[`fromDate${n}`]       = formatDate(pt.dateStart);
    templateData[`toDate${n}`]         = formatDate(pt.dateEnd);
  });

  // Load template
  let templateBuffer;
  try {
    const templatePath = getTemplatePath(count, place);
    if (!fs.existsSync(templatePath)) {
      return res.status(500).json({ error: `Шаблон не найден: ${path.basename(templatePath)}` });
    }
    templateBuffer = fs.readFileSync(templatePath);
  } catch (e) {
    console.error('Template read error:', e);
    return res.status(500).json({ error: 'Не удалось прочитать шаблон документа' });
  }

  // Generate docx
  let docBuffer;
  try {
    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    doc.render(templateData);
    docBuffer = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
  } catch (e) {
    console.error('Docx generation error:', e);
    return res.status(500).json({ error: 'Ошибка генерации документа' });
  }

  // Save to DB — сохраняем первичную практику (основная) для статистики
  try {
    for (const pt of ptRecords) {
      await prisma.application.create({
        data: {
          directionId:       parseInt(directionId),
          practiceTypeId:    pt.id,
          place,
          enterpriseName:    enterpriseName || '',
          enterpriseAddress: enterpriseAddress || '',
          dateStart:         pt.dateStart,
          dateEnd:           pt.dateEnd,
          studentGroup,
          studentFio,
        },
      });
    }
  } catch (e) {
    console.error('DB save error:', e);
  }

  const filename = `Заявление_${studentFio.replace(/\s+/g, '_')}.docx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
  res.send(docBuffer);
});

module.exports = router;
