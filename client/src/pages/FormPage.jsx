import { useState, useEffect, useRef, useCallback } from 'react';
import { incline } from 'lvovich';
import api from '../api/client.js';
import styles from './FormPage.module.css';

/* ── Утилиты ──────────────────────────────────────────────────────────────── */
const MONTHS = ['января','февраля','марта','апреля','мая','июня',
                'июля','августа','сентября','октября','ноября','декабря'];

function fmtDate(val) {
  if (!val) return '';
  const [y, m, d] = val.split('-');
  return `${parseInt(d)} ${MONTHS[parseInt(m) - 1]} ${y}`;
}

function genSessionId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/* ── Склонение ФИО ────────────────────────────────────────────────────────── */
function declineFio(fullName, gcase) {
  if (!fullName || !fullName.trim()) return fullName;
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return fullName;
  const person = { last: parts[0] || '', first: parts[1] || '', middle: parts[2] || '' };
  try {
    const d = incline(person, gcase);
    return [d.last, d.first, d.middle].filter(Boolean).join(' ');
  } catch { return fullName; }
}

/* ── Форматы ФИО ──────────────────────────────────────────────────────────── */
function parseFio(full) {
  const parts = (full || '').trim().split(/\s+/);
  return { last: parts[0]||'', first: parts[1]||'', middle: parts[2]||'' };
}

const FIO_FORMATS = [
  { id: 'full',         label: (f) => { const {last,first,middle} = parseFio(f); return [last,first,middle].filter(Boolean).join(' '); } },
  { id: 'short',        label: (f) => { const {last,first,middle} = parseFio(f); return `${last} ${first?first[0]+'.':''}${middle?middle[0]+'.':''}`.trim(); } },
  { id: 'firstLast',    label: (f) => { const {last,first,middle} = parseFio(f); return [first,middle,last].filter(Boolean).join(' '); } },
  { id: 'initialsLast', label: (f) => { const {last,first,middle} = parseFio(f); return `${first?first[0]+'.':''}${middle?' '+middle[0]+'.':''} ${last}`.trim(); } },
];

function applyFioFormat(fio, formatId) {
  if (!fio || !formatId) return fio;
  const fmt = FIO_FORMATS.find(f => f.id === formatId);
  return fmt ? fmt.label(fio) : fio;
}

/* ── AnimField ────────────────────────────────────────────────────────────── */
function AnimField({ visible, children }) {
  const [mounted, setMounted]   = useState(visible);
  const [animated, setAnimated] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (visible) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setAnimated(true);
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }));
    } else {
      setAnimated(false);
      const t = setTimeout(() => setMounted(false), 420);
      return () => clearTimeout(t);
    }
  }, [visible]);
  if (!mounted) return null;
  return (
    <div ref={ref} className={`${styles.field} ${animated ? styles.fieldAnimated : ''}`}>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Главная страница — форма
   ════════════════════════════════════════════════════════════════════════════ */
export default function FormPage() {
  const [directions, setDirections] = useState([]);
  const [sessionId]                 = useState(genSessionId);

  // Form state
  const [dirId,      setDirId]      = useState('');
  const [selectedPts, setSelectedPts] = useState([]); // массив id практик, по sortOrder
  // dates: { [ptId]: { start, end } }
  const [dates,      setDates]      = useState({});
  const [place,      setPlace]      = useState('');
  const [entName,    setEntName]    = useState('');
  const [entAddr,    setEntAddr]    = useState('');
  const [group,      setGroup]      = useState('');
  const [fio,        setFio]        = useState('');
  const [fioFormat,  setFioFormat]  = useState('short');

  const [generating, setGenerating] = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState(false);

  useEffect(() => {
    api.get('/directions').then(r => setDirections(r.data)).catch(() => {});
  }, []);

  const logStep = useCallback((step, dId) => {
    api.post('/funnel/event', { sessionId, step, directionId: dId ? parseInt(dId) : null }).catch(() => {});
  }, [sessionId]);

  /* ── Success screen — рендерим до всех вычислений ───────────────────────── */
  if (success) {
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.successTitle}>Заявление сформировано</h2>
          <p className={styles.successText}>
            Скачивание файла началось автоматически. Откройте документ в Word
            и при необходимости внесите правки под свои нужды.
          </p>
          <button className="btn-primary" onClick={() => setSuccess(false)}>
            Создать ещё одно заявление
          </button>
        </div>
      </div>
    );
  }

  /* ── Derived state ──────────────────────────────────────────────────────── */
  const dir = directions.find(d => d.id === parseInt(dirId));
  // Выбранные практики в порядке sortOrder
  const selectedPtObjects = (dir?.practiceTypes || [])
    .filter(p => selectedPts.includes(p.id))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const showPractice   = !!dirId;
  const showPlace      = !!dirId && selectedPts.length > 0;
  const showEnterprise = showPlace && place === 'предприятие';
  const entOk          = place !== 'предприятие' || (entName.trim() && entAddr.trim());
  const showDates      = showPlace && !!place && entOk;
  // Все выбранные практики должны иметь даты
  const allDatesOk     = selectedPts.length > 0 && selectedPts.every(id => dates[id]?.start && dates[id]?.end);
  const showStudent    = showDates && allDatesOk;
  const showFormat     = showStudent && !!group.trim() && !!fio.trim();

  const isComplete = !!dirId && selectedPts.length > 0 && !!place && entOk && allDatesOk && !!group.trim() && !!fio.trim();

  // Progress
  const total  = place === 'предприятие' ? 6 : 5;
  let filled = 0;
  if (dirId) filled++;
  if (selectedPts.length > 0) filled++;
  if (place) { filled++; if (place === 'предприятие' && entOk) filled++; }
  if (allDatesOk) filled++;
  if (group.trim() && fio.trim()) filled++;
  const progress = Math.round((filled / total) * 100);

  const pvOrg  = place === 'кафедра' ? (dir ? `кафедра ${dir.kafName}, ТУСУР` : '') : entName;
  const pvAddr = place === 'кафедра' ? (dir?.kafAddress || '') : entAddr;

  /* ── Handlers ───────────────────────────────────────────────────────────── */
  function handleDirection(val) {
    setDirId(val);
    setSelectedPts([]); setDates({}); setPlace('');
    setEntName(''); setEntAddr('');
    setGroup(''); setFio(''); setFioFormat('short');
    if (val) logStep(1, val);
  }

  function handleTogglePt(ptId) {
    setSelectedPts(prev => {
      const next = prev.includes(ptId)
        ? prev.filter(id => id !== ptId)
        : prev.length < 3 ? [...prev, ptId] : prev;
      // Убираем даты для снятых практик
      if (!next.includes(ptId)) {
        setDates(d => { const nd = {...d}; delete nd[ptId]; return nd; });
      }
      if (next.length > 0) logStep(2, dirId);
      return next;
    });
    setPlace(''); setEntName(''); setEntAddr('');
    setGroup(''); setFio(''); setFioFormat('short');
  }

  function handlePlace(val) {
    setPlace(val);
    setEntName(''); setEntAddr('');
    setGroup(''); setFio(''); setFioFormat('short');
    if (val) logStep(3, dirId);
  }

  function handleEnterprise(name, addr) {
    if (name !== undefined) setEntName(name);
    if (addr !== undefined) setEntAddr(addr);
    const n = name ?? entName; const a = addr ?? entAddr;
    if (n.trim() && a.trim()) logStep(3, dirId);
  }

  function handleDate(ptId, field, val) {
    setDates(prev => ({ ...prev, [ptId]: { ...prev[ptId], [field]: val } }));
    // Проверяем после обновления
    const updated = { ...dates, [ptId]: { ...dates[ptId], [field]: val } };
    const ok = selectedPts.every(id => updated[id]?.start && updated[id]?.end);
    if (ok) logStep(4, dirId);
  }

  function handleStudent(g, f) {
    if (g !== undefined) setGroup(g);
    if (f !== undefined) setFio(f);
    setFioFormat('short');
    const gv = g ?? group; const fv = f ?? fio;
    if (gv.trim() && fv.trim()) logStep(5, dirId);
  }

  function handleFioFormat(fmt) {
    setFioFormat(fmt);
    logStep(6, dirId);
  }

  async function handleGenerate() {
    if (!isComplete || generating) return;
    setGenerating(true); setError('');
    try {
      // Передаём практики в порядке sortOrder
      const practiceTypes = selectedPtObjects.map((pt, i) => ({
        practiceTypeId: pt.id,
        dateStart: dates[pt.id].start,
        dateEnd:   dates[pt.id].end,
        order: i + 1,
      }));

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directionId: parseInt(dirId),
          practiceTypes,
          place,
          enterpriseName:   entName,
          enterpriseAddress: entAddr,
          studentGroup: group,
          studentFio:   fio,
          fioFormat,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Ошибка сервера');
      }
      const blob = await response.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `Заявление_${fio}.docx`; a.click();
      URL.revokeObjectURL(url);

      setSuccess(true);
      setDirId(''); setSelectedPts([]); setDates({}); setPlace('');
      setEntName(''); setEntAddr(''); setGroup(''); setFio(''); setFioFormat('short');
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className={styles.layout}>

      {/* ════ ФОРМА ════ */}
      <div className={styles.colForm}>
        <div className={styles.header}>
          <h1>Заявление на практику</h1>
          <p>Заполните поля последовательно для генерации документа</p>
        </div>

        <div className={styles.progress}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        {/* Шаг 1 */}
        <div className={`${styles.field} ${styles.fieldAnimated}`}>
          <label><StepNum n={1} />Направление подготовки</label>
          <div className={styles.selectWrap}>
            <select className="field-input" value={dirId} onChange={e => handleDirection(e.target.value)}>
              <option value="">— Выберите направление —</option>
              {directions.map(d => (
                <option key={d.id} value={d.id}>{d.code} – {d.shortName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Шаг 2 — чекбокс-список практик */}
        <AnimField visible={showPractice}>
          <label>
            <StepNum n={2} />Виды практики
            <span className={styles.stepHint}>выберите от 1 до 3</span>
          </label>
          <div className={styles.checkList}>
            {dir?.practiceTypes?.map(p => {
              const checked  = selectedPts.includes(p.id);
              const disabled = !checked && selectedPts.length >= 3;
              return (
                <label
                  key={p.id}
                  className={`${styles.checkItem} ${checked ? styles.checkItemActive : ''} ${disabled ? styles.checkItemDisabled : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => handleTogglePt(p.id)}
                    className={styles.checkInput}
                  />
                  <span className={styles.checkBox}>{checked ? '✓' : ''}</span>
                  <span className={styles.checkLabel}>{p.name}</span>
                </label>
              );
            })}
          </div>
        </AnimField>

        {/* Шаг 3 */}
        <AnimField visible={showPlace}>
          <label><StepNum n={3} />Место прохождения практики</label>
          <div className={styles.selectWrap}>
            <select className="field-input" value={place} onChange={e => handlePlace(e.target.value)}>
              <option value="">— Выберите место —</option>
              <option value="кафедра">Кафедра</option>
              <option value="предприятие">Предприятие</option>
            </select>
          </div>
        </AnimField>

        {/* Шаг 3а */}
        <AnimField visible={showEnterprise}>
          <hr className={styles.divider} />
          <label><StepNum n="↳" muted />Данные предприятия</label>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <span className={styles.subLabel}>Название предприятия</span>
              <input className="field-input" type="text" placeholder="Полное наименование организации"
                value={entName} onChange={e => handleEnterprise(e.target.value, undefined)} />
            </div>
            <div>
              <span className={styles.subLabel}>Адрес предприятия</span>
              <input className="field-input" type="text" placeholder="Юридический адрес"
                value={entAddr} onChange={e => handleEnterprise(undefined, e.target.value)} />
            </div>
          </div>
        </AnimField>

        {/* Шаг 4 — даты для каждой практики */}
        <AnimField visible={showDates}>
          <label><StepNum n={4} />Сроки практики</label>
          <div className={styles.datesBlock}>
            {selectedPtObjects.map((pt, i) => (
              <div key={pt.id} className={styles.datesRow}>
                <div className={styles.datesName}>{pt.name}</div>
                <div className={styles.dateRow}>
                  <div>
                    <span className={styles.subLabel}>Дата начала</span>
                    <input className="field-input" type="date"
                      value={dates[pt.id]?.start || ''}
                      onChange={e => handleDate(pt.id, 'start', e.target.value)} />
                  </div>
                  <div>
                    <span className={styles.subLabel}>Дата окончания</span>
                    <input className="field-input" type="date"
                      value={dates[pt.id]?.end || ''}
                      onChange={e => handleDate(pt.id, 'end', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AnimField>

        {/* Шаг 5 */}
        <AnimField visible={showStudent}>
          <label><StepNum n={5} />Данные студента</label>
          <div className={styles.nameRow}>
            <div>
              <span className={styles.subLabel}>Группа</span>
              <input className="field-input" type="text" placeholder="з-422П12-3"
                value={group} onChange={e => handleStudent(e.target.value, undefined)} />
            </div>
            <div>
              <span className={styles.subLabel}>ФИО студента (И.п.)</span>
              <input className="field-input" type="text" placeholder="Иванов Иван Иванович"
                value={fio} onChange={e => handleStudent(undefined, e.target.value)} />
            </div>
          </div>
        </AnimField>

        {/* Шаг 6 */}
        <AnimField visible={showFormat}>
          <label><StepNum n={6} />Формат отображения ФИО в заявлении</label>
          <div className={styles.fioFormatGrid}>
            {fio.trim() && FIO_FORMATS.map(fmt => (
              <button key={fmt.id}
                className={`${styles.fioFormatBtn} ${fioFormat === fmt.id ? styles.fioFormatBtnActive : ''}`}
                onClick={() => handleFioFormat(fmt.id)}>
                {fmt.label(fio)}
              </button>
            ))}
          </div>
        </AnimField>

        <div className={styles.footer}>
          <button className="btn-primary" disabled={!isComplete || generating} onClick={handleGenerate}>
            {generating ? 'Генерация…' : 'Сгенерировать'}
          </button>
          {!isComplete && <span className={styles.hint}>Заполните все поля, чтобы продолжить</span>}
          {error && <span className={styles.errorMsg}>{error}</span>}
        </div>
      </div>

      {/* ════ PREVIEW ════ */}
      <div className={styles.colPreview}>
        <div className={`${styles.previewWrap} ${dirId ? styles.previewVisible : ''}`}>
          <div className={styles.previewLabel}>Предпросмотр документа</div>
          <div className={styles.a4}>

            {/* Шапка */}
            <div className={styles.addressee}>
              <div className={styles.addrRow1}>
                <span className={styles.addrText}>
                  {dir?.headTitle || <span className={styles.addrPlaceholder}>Заведующему кафедрой</span>}
                </span>
                <span className={styles.addrShortBlock}>
                  <span className={styles.addrShortValue}>
                    {dir?.shortName || <span className={styles.addrPlaceholder}>каф.</span>}
                  </span>
                  <span className={styles.addrShortLine} />
                </span>
              </div>
              <div className={styles.addrCaption}>(сокр. назв. каф.)</div>

              <div className={styles.addrFullLine}>
                {dir?.headNameFull
                  ? applyFioFormat(declineFio(dir.headNameFull, 'dative'), fioFormat)
                  : <span className={styles.addrPlaceholder}>ФИО зав. кафедрой</span>}
              </div>
              <div className={styles.addrCaption}>(ФИО зав. кафедрой)</div>

              <div className={styles.addrRow1} style={{ marginTop: 4 }}>
                <span className={styles.addrText}>От студента гр.</span>
                <span className={styles.addrShortBlock}>
                  <span className={styles.addrShortValue}>
                    {group || <span className={styles.addrPlaceholder}>з-422П12-3</span>}
                  </span>
                  <span className={styles.addrShortLine} />
                </span>
              </div>
              <div className={styles.addrCaption}>(номер группы)</div>

              <div className={styles.addrFullLine}>
                {fio
                  ? applyFioFormat(declineFio(fio, 'genitive'), fioFormat)
                  : <span className={styles.addrPlaceholder}>Иванова Ивана Ивановича</span>}
              </div>
              <div className={styles.addrCaption}>(ФИО студента)</div>
            </div>

            {/* Заголовок */}
            <div className={styles.titleBlock}>
              <div className={styles.docTitle}>Заявление</div>
            </div>

            {/* Тело */}
            <div className={styles.body}>
              <p className={styles.bodyLine}>
                Прошу направить меня для прохождения <span className={styles.fillLine} />
              </p>

              {/* Строки практик */}
              {selectedPtObjects.length === 0 ? (
                <>
                  <p className={styles.bodyLineCenter} />
                  <p className={styles.bodyCaption}>(вид практики: тип практики)</p>
                </>
              ) : (
                selectedPtObjects.map((pt, i) => (
                  <div key={pt.id}>
                    <p className={styles.bodyLineCenter}>
                      {pt.correctForm || pt.name}
                    </p>
                    {/* Подпись только под последней практикой */}
                    {i === selectedPtObjects.length - 1 && (
                      <p className={styles.bodyCaption}>(вид практики: тип практики)</p>
                    )}
                  </div>
                ))
              )}

              {/* Место */}
              <p className={styles.bodyLine} style={{ marginTop: 8 }}>
                {place === 'кафедра'
                  ? <>в структурное подразделение ТУСУР&nbsp;<span className={styles.underlined}>{pvOrg || <span className={styles.fillLine}/>}</span></>
                  : <>в профильную организацию&nbsp;<span className={styles.underlined}>{pvOrg || <span className={styles.fillLine}/>}</span></>
                }
              </p>
              <p className={styles.bodyCaption}>(наименование)</p>

              <p className={styles.bodyLine}>
                расположенную по адресу:&nbsp;{pvAddr || <span className={styles.fillLine} />}
              </p>
              <p className={styles.bodyCaption}>(адрес)</p>

              {/* Даты — по каждой практике */}
              {selectedPtObjects.map((pt) => (
                <p key={pt.id} className={styles.bodyLine} style={{ marginTop: 4 }}>
                  сроком с&nbsp;<DateDisplay val={dates[pt.id]?.start} />
                  &nbsp;по&nbsp;<DateDisplay val={dates[pt.id]?.end} />
                </p>
              ))}
              {selectedPtObjects.length === 0 && (
                <p className={styles.bodyLine} style={{ marginTop: 8 }}>
                  сроком с&nbsp;<DateDisplay val={null} />&nbsp;по&nbsp;<DateDisplay val={null} />
                </p>
              )}
            </div>

            {/* Подпись */}
            <div className={styles.signRow}>
              <div className={styles.signItem}>
                <div className={styles.signValue}>{selectedPtObjects[0] ? fmtDate(dates[selectedPtObjects[0].id]?.start) : ''}</div>
                <div className={styles.signUnder} />
                <div className={styles.signCaption}>дата</div>
              </div>
              <div className={styles.signItem}>
                <div className={styles.signValue} />
                <div className={styles.signUnder} />
                <div className={styles.signCaption}>подпись</div>
              </div>
            </div>

            {/* Согласовано */}
            <div className={styles.agree}>
              <div className={styles.agreeTitle}>Согласовано:</div>

              {/* Зав. кафедрой */}
              <div className={styles.agreeBlock}>
                <div className={styles.agreeRow}>
                  <div className={styles.agreeCol}>
                    <div className={styles.agreeText}>Зав. кафедрой {dir?.shortName || '___'}</div>
                    <div className={styles.agreeCaption}>(должность)</div>
                  </div>
                  <div className={styles.agreeCol}>
                    <div className={styles.agreeLine} />
                    <div className={styles.agreeCaption}>(подпись)</div>
                  </div>
                  <div className={styles.agreeCol}>
                    <div className={styles.agreeText}>{applyFioFormat(dir?.headNameFull, fioFormat) || ''}</div>
                    <div className={styles.agreeCaption}>(расшифровка)</div>
                  </div>
                </div>
              </div>

              {/* Руководитель — по каждой выбранной практике */}
              {(selectedPtObjects.length > 0 ? selectedPtObjects : [null]).map((pt, i) => (
                <div key={pt?.id ?? 'empty'} className={styles.agreeBlock}>
                  <div className={styles.agreeRow}>
                    <div className={styles.agreeCol}>
                      <div className={styles.agreeText}>Руководитель практики от университета</div>
                      <div className={styles.agreeCaption}>(должность)</div>
                    </div>
                    <div className={styles.agreeCol}>
                      <div className={styles.agreeLine} />
                      <div className={styles.agreeCaption}>(подпись)</div>
                    </div>
                    <div className={styles.agreeCol}>
                      <div className={styles.agreeText}>{pt ? applyFioFormat(pt.supervisorName, fioFormat) : ''}</div>
                      <div className={styles.agreeCaption}>(расшифровка)</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}

function StepNum({ n, muted }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 22, height: 22,
      background: muted ? 'var(--muted)' : 'var(--accent)',
      color: '#fff', borderRadius: '50%',
      fontSize: '0.65rem', fontWeight: 500,
      marginRight: 8, verticalAlign: 'middle', flexShrink: 0,
    }}>{n}</span>
  );
}

const MONTHS_RU = ['января','февраля','марта','апреля','мая','июня',
                   'июля','августа','сентября','октября','ноября','декабря'];

function DateDisplay({ val }) {
  if (!val) {
    return (
      <>
        «<span style={{ borderBottom:'1px solid #888', minWidth:20, display:'inline-block' }}>&nbsp;&nbsp;</span>»{' '}
        <span style={{ borderBottom:'1px solid #888', minWidth:60, display:'inline-block' }}>&nbsp;</span>{' '}
        20__&nbsp;г.
      </>
    );
  }
  const [y, m, d] = val.split('-');
  const day = String(parseInt(d)).padStart(2, '0');
  return (
    <>
      «<span style={{ borderBottom:'1px solid #888', minWidth:20, display:'inline-block', textAlign:'center' }}>{day}</span>»{' '}
      <span style={{ borderBottom:'1px solid #888', display:'inline-block' }}>{MONTHS_RU[parseInt(m)-1]}</span>{' '}
      20{y.slice(2)}&nbsp;г.
    </>
  );
}
