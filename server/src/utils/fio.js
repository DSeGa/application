const { incline } = require('lvovich');

const MONTHS = ['января','февраля','марта','апреля','мая','июня',
                'июля','августа','сентября','октября','ноября','декабря'];

function declineFio(fullName, gcase) {
  if (!fullName || !fullName.trim()) return fullName;
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return fullName;
  const person = { last: parts[0]||'', first: parts[1]||'', middle: parts[2]||'' };
  try {
    const d = incline(person, gcase);
    return [d.last, d.first, d.middle].filter(Boolean).join(' ');
  } catch { return fullName; }
}

function applyFioFormat(full, fmt) {
  if (!full) return full;
  const parts = full.trim().split(/\s+/);
  const last = parts[0]||'', first = parts[1]||'', middle = parts[2]||'';
  switch (fmt) {
    case 'short':        return `${last} ${first?first[0]+'.':''}${middle?middle[0]+'.':''}`.trim();
    case 'firstLast':    return [first, middle, last].filter(Boolean).join(' ');
    case 'initialsLast': return `${first?first[0]+'.':''}${middle?' '+middle[0]+'.':''} ${last}`.trim();
    default:             return [last, first, middle].filter(Boolean).join(' ');
  }
}

function formatDate(val) {
  if (!val) return '';
  const [y, m, d] = val.split('-');
  const day = String(parseInt(d)).padStart(2, '0');
  return `«${day}» ${MONTHS[parseInt(m) - 1]} ${y}`;
}

module.exports = { declineFio, applyFioFormat, formatDate };
