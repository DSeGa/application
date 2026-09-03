import { useState, useEffect } from 'react';
import api from '../../api/client.js';
import s from './Applications.module.css';

const MONTHS = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
function fmtDt(str) {
  const d = new Date(str);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

export default function Applications() {
  const [data,        setData]        = useState({ total: 0, items: [] });
  const [directions,  setDirections]  = useState([]);
  const [loading,     setLoading]     = useState(true);

  const [dirFilter, setDirFilter] = useState('');
  const [fromDate,  setFromDate]  = useState('');
  const [toDate,    setToDate]    = useState('');
  const [page,      setPage]      = useState(1);

  function load(p = page) {
    setLoading(true);
    const params = new URLSearchParams({ page: p, limit: 50 });
    if (dirFilter) params.set('directionId', dirFilter);
    if (fromDate)  params.set('from', fromDate);
    if (toDate)    params.set('to', toDate);
    api.get(`/applications?${params}`).then(r => setData(r.data)).finally(() => setLoading(false));
  }

  useEffect(() => {
    api.get('/directions/all').then(r => setDirections(r.data));
    load(1);
  }, []);

  function applyFilters() { setPage(1); load(1); }

  const totalPages = Math.ceil(data.total / 50);

  return (
    <div className={s.page}>
      <h1 className={s.pageTitle}>Заявления</h1>

      {/* Фильтры */}
      <div className={s.filters}>
        <div className={s.filterGroup}>
          <label>Направление</label>
          <select className="field-input" style={{ padding: '10px 14px' }}
            value={dirFilter} onChange={e => setDirFilter(e.target.value)}>
            <option value="">Все</option>
            {directions.map(d => <option key={d.id} value={d.id}>{d.shortName}</option>)}
          </select>
        </div>
        <div className={s.filterGroup}>
          <label>С даты</label>
          <input className="field-input" style={{ padding: '10px 14px' }} type="date"
            value={fromDate} onChange={e => setFromDate(e.target.value)} />
        </div>
        <div className={s.filterGroup}>
          <label>По дату</label>
          <input className="field-input" style={{ padding: '10px 14px' }} type="date"
            value={toDate} onChange={e => setToDate(e.target.value)} />
        </div>
        <button className="btn-primary" style={{ alignSelf: 'flex-end', padding: '10px 24px' }}
          onClick={applyFilters}>Применить</button>
        <button className="btn-secondary" style={{ alignSelf: 'flex-end', padding: '10px 20px' }}
          onClick={() => { setDirFilter(''); setFromDate(''); setToDate(''); setPage(1); load(1); }}>
          Сбросить
        </button>
      </div>

      <div className={s.meta}>Найдено: <strong>{data.total}</strong></div>

      {loading ? <div className={s.loading}>Загрузка…</div> : (
        <>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Дата</th>
                  <th>Направление</th>
                  <th>Вид практики</th>
                  <th>Студент</th>
                  <th>Группа</th>
                  <th>Место</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map(app => (
                  <tr key={app.id}>
                    <td className={s.num}>{app.id}</td>
                    <td className={s.date}>{fmtDt(app.generatedAt)}</td>
                    <td>{app.direction?.shortName ?? <span className={s.del}>удалено</span>}</td>
                    <td className={s.practice}>{app.practiceType?.name ?? <span className={s.del}>удалено</span>}</td>
                    <td>{app.studentFio}</td>
                    <td>{app.studentGroup}</td>
                    <td>
                      <span className={`${s.placeBadge} ${app.place === 'предприятие' ? s.enterprise : s.kafedra}`}>
                        {app.place}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={s.pagination}>
              <button className="btn-secondary" disabled={page === 1}
                onClick={() => { const p = page - 1; setPage(p); load(p); }}>← Пред.</button>
              <span>{page} / {totalPages}</span>
              <button className="btn-secondary" disabled={page === totalPages}
                onClick={() => { const p = page + 1; setPage(p); load(p); }}>След. →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
