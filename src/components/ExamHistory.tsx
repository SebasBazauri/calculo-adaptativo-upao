import { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { api } from '../api';
import { elapsed, examDate, examTopicNames, examLevelNames, type ExamHistory as History, type ExamMetrics } from '../exams';

export default function ExamHistory({ onOpen, onNew }: { onOpen: (id: string) => void; onNew: () => void }) {
  const [history, setHistory] = useState<History | null>(null);
  const [metrics, setMetrics] = useState<ExamMetrics | null>(null);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError('');
    void Promise.all([api<History>(`/exams?offset=${offset}&limit=10`), api<ExamMetrics>('/exams/metrics')])
      .then(([items, stats]) => { if (!cancelled) { setHistory(items); setMetrics(stats); } })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [offset, retry]);
  const recent = metrics?.timeline.slice(-10) ?? [];
  const pointX = (i: number) => recent.length === 1 ? 310 : 50 + i * 520 / (recent.length - 1);
  return <section className="exam-workspace" aria-label="Historial y rendimiento de exámenes">
    <div className="section-heading"><div><h2>Historial de autoevaluaciones</h2><p>Resultados de tu sesión actual. Al borrar la sesión del navegador, perderás acceso desde aquí.</p></div><button className="button primary" onClick={onNew}>Generar examen</button></div>
    {error && <div className="error-box" role="alert"><span>{error}</span><button onClick={() => setRetry(n => n + 1)}>Reintentar historial</button></div>}
    {loading ? <div className="loading" role="status"><LoaderCircle className="spin" />Cargando historial…</div> : !error && history && metrics && <>
      {metrics.completed_exams ? <>
        <div className="exam-stat-grid"><div><strong>{metrics.completed_exams}</strong><span>Exámenes finalizados</span></div><div><strong>{metrics.average_score?.toFixed(2)} / 20</strong><span>Puntaje promedio por examen</span></div><div><strong>{metrics.average_percentage?.toFixed(1)}%</strong><span>Promedio de porcentajes por examen</span></div><div><strong>{metrics.answered} / {metrics.questions}</strong><span>Preguntas respondidas / totales</span></div></div>
        <p className="exam-meta">{metrics.correct} correctas · {metrics.incorrect} incorrectas (incluye {metrics.unanswered} sin responder). Acierto global por pregunta: {metrics.overall_percentage?.toFixed(1)}%. Solo exámenes finalizados de Cálculo I.</p>
        <div className="exam-panel"><h3>Evolución del puntaje</h3><p>Últimos {recent.length} exámenes finalizados, en orden de envío. Puntos sobre 20; los temas y dificultades pueden variar.</p><svg viewBox="0 0 620 210" className="exam-chart" role="img" aria-labelledby="chart-title chart-desc"><title id="chart-title">Puntajes de autoevaluación a lo largo del tiempo</title><desc id="chart-desc">{recent.map(item => `${examDate(item.submitted_at)}: ${item.score} de 20, ${examTopicNames[item.topic]}, nivel ${item.level}`).join('. ')}</desc>{[0,5,10,15,20].map(n => <g key={n}><line x1="50" y1={165 - n*7} x2="580" y2={165 - n*7} stroke="#e4eae6" /><text x="20" y={170 - n*7} fontSize="12">{n}</text></g>)}<text x="8" y="14" fontSize="12">Puntaje / 20</text><polyline points={recent.map((item, i) => `${pointX(i)},${165-item.score*7}`).join(' ')} fill="none" stroke="#29634f" strokeWidth="2" />{recent.map((item, i) => <g key={item.id}><circle cx={pointX(i)} cy={165-item.score*7} r="4" fill="#29634f" /><text x={pointX(i)} y="186" textAnchor="middle" fontSize="12">{i+1}</text></g>)}<text x="310" y="205" textAnchor="middle" fontSize="12">Orden de envío (del más antiguo al más reciente)</text></svg><p className="exam-meta">Fuente: tus envíos guardados, desde {examDate(recent[0].submitted_at)} hasta {examDate(recent[recent.length-1].submitted_at)}. Cada punto corresponde a un examen; no representa un cambio causal en tu aprendizaje.</p></div>
        <div className="exam-panel"><h3>Rendimiento por tema</h3>{metrics.by_topic.map(row => <div className="exam-topic-stat" key={row.topic}><strong>{examTopicNames[row.topic]}</strong><span>{row.correct} de {row.questions} correctas · {row.percentage.toFixed(1)}%</span><progress value={row.correct} max={row.questions} aria-label={`Aciertos de ${examTopicNames[row.topic]}`} /></div>)}{metrics.suggestion && <p className="hint-box">{metrics.suggestion} Es una sugerencia descriptiva, no un diagnóstico de dominio.</p>}</div>
      </> : <div className="exam-panel"><h3>Aún no tienes resultados.</h3><p>Finaliza una autoevaluación para consultar promedios y evolución. Los exámenes pendientes aparecen abajo.</p></div>}
      {history.total ? <><div className="exam-table-wrap"><table className="exam-table"><caption>Exámenes generados · {history.total} en total</caption><thead><tr><th>Fecha de generación</th><th>Curso / tema</th><th>Preguntas</th><th>Resultado</th><th>Aciertos / errores</th><th>Tiempo transcurrido</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{history.items.map(item => <tr key={item.id}><td>{examDate(item.created_at)}</td><td>{item.course}<br />{examTopicNames[item.topic]}<small>{examLevelNames[item.level-1]}</small></td><td>{item.question_count}</td><td>{item.score === null ? '—' : `${item.score.toFixed(2)} / 20 (${item.percentage?.toFixed(1)}%)`}</td><td>{item.correct_count === null ? '—' : `${item.correct_count} / ${item.incorrect_count}`}</td><td>{elapsed(item.elapsed_seconds)}</td><td>{item.status === 'completed' ? 'Finalizado' : 'En progreso'}</td><td><button className="text-button" onClick={() => onOpen(item.id)} aria-label={`${item.status === 'completed' ? 'Ver resultado' : 'Continuar examen'} de ${examTopicNames[item.topic]} generado ${examDate(item.created_at)}`}>{item.status === 'completed' ? 'Ver detalle' : 'Continuar'}</button></td></tr>)}</tbody></table></div><div className="exam-pagination"><button className="button secondary" disabled={offset===0} onClick={() => setOffset(n => Math.max(0,n-10))}>Anterior</button><span>{offset+1}–{Math.min(offset+10,history.total)} de {history.total}</span><button className="button secondary" disabled={offset+10>=history.total} onClick={() => setOffset(n => n+10)}>Siguiente</button></div><p className="exam-meta">Errores incluye preguntas sin responder. El tiempo transcurrido incluye pausas.</p></> : <div className="exam-panel"><h3>Tu historial está vacío.</h3><p>Genera tu primer examen para comenzar.</p><button className="button primary" onClick={onNew}>Crear mi primer examen</button></div>}
    </>}
  </section>;
}
