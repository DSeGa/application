import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell,
} from 'recharts';
import api from '../../api/client.js';
import s from './Dashboard.module.css';

const ACCENT  = '#c8783a';
const MUTED   = '#d4cfc5';

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [funnel,   setFunnel]   = useState([]);
  const [monthly,  setMonthly]  = useState([]);
  const [year,     setYear]     = useState(new Date().getFullYear());
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/stats/overview'),
      api.get('/stats/funnel'),
    ]).then(([ov, fn]) => {
      setOverview(ov.data);
      setFunnel(fn.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get(`/stats/monthly?year=${year}`).then(r => setMonthly(r.data));
  }, [year]);

  if (loading) return <div className={s.loading}>Загрузка…</div>;

  return (
    <div className={s.page}>
      <h1 className={s.pageTitle}>Дашборд</h1>

      {/* ── Карточки ── */}
      <div className={s.cards}>
        <StatCard label="Всего заявлений" value={overview?.totals.all ?? 0} />
        <StatCard label="За этот месяц"   value={overview?.totals.month ?? 0} accent />
        <StatCard label="За этот год"     value={overview?.totals.year ?? 0} />
      </div>

      {/* ── Воронка ── */}
      <section className={s.section}>
        <h2 className={s.sectionTitle}>Воронка заполнения формы</h2>
        <p className={s.sectionSub}>Сколько уникальных сессий дошло до каждого шага</p>
        <div className={s.funnelList}>
          {funnel.map((step, i) => (
            <div key={step.step} className={s.funnelRow}>
              <div className={s.funnelLabel}>
                <span className={s.funnelStep}>{step.step}</span>
                {step.name}
              </div>
              <div className={s.funnelBar}>
                <div
                  className={s.funnelFill}
                  style={{
                    width: `${step.pct}%`,
                    background: i === funnel.length - 1 ? ACCENT : `rgba(200,120,58,${0.85 - i * 0.1})`,
                  }}
                />
              </div>
              <div className={s.funnelCount}>{step.count} <span className={s.funnelPct}>({step.pct}%)</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── По месяцам ── */}
      <section className={s.section}>
        <div className={s.sectionHeader}>
          <div>
            <h2 className={s.sectionTitle}>Заявления по месяцам</h2>
          </div>
          <div className={s.yearPicker}>
            {[new Date().getFullYear() - 1, new Date().getFullYear()].map(y => (
              <button key={y} className={`${s.yearBtn} ${year === y ? s.yearBtnActive : ''}`}
                onClick={() => setYear(y)}>{y}</button>
            ))}
          </div>
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#8a8070' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#8a8070' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13 }}
                cursor={{ fill: 'rgba(200,120,58,0.08)' }}
              />
              <Bar dataKey="count" name="Заявлений" radius={[4,4,0,0]}>
                {monthly.map((_, i) => (
                  <Cell key={i} fill={_.count > 0 ? ACCENT : MUTED} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── По направлениям ── */}
      <div className={s.row2}>
        <section className={s.section}>
          <h2 className={s.sectionTitle}>По направлениям</h2>
          {overview?.byDirection?.length
            ? overview.byDirection.map(d => (
                <div key={d.name} className={s.listRow}>
                  <span>{d.name}</span>
                  <span className={s.listCount}>{d.count}</span>
                </div>
              ))
            : <p className={s.empty}>Нет данных</p>}
        </section>

        <section className={s.section}>
          <h2 className={s.sectionTitle}>Место прохождения</h2>
          {overview?.byPlace?.map(p => (
            <div key={p.name} className={s.listRow}>
              <span style={{ textTransform: 'capitalize' }}>{p.name}</span>
              <span className={s.listCount}>{p.count}</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`${s.card} ${accent ? s.cardAccent : ''}`}>
      <div className={s.cardValue}>{value}</div>
      <div className={s.cardLabel}>{label}</div>
    </div>
  );
}
