import { useEffect, useRef, useState } from 'react';
import { Check, Clock, FileCheck2, LoaderCircle } from 'lucide-react';
import { api } from '../api';
import { elapsed, examDate, examLevelNames, examTopicNames, readDraft, type ExamDetail, type ExamTopic } from '../exams';

export default function ExamGenerator({ examId, onOpen, onHistory }: { examId: string | null; onOpen: (id: string | null) => void; onHistory: () => void }) {
  const [topic, setTopic] = useState<ExamTopic>('mixed');
  const [level, setLevel] = useState(1);
  const [count, setCount] = useState(5);
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [retry, setRetry] = useState(0);
  const [draftSaved, setDraftSaved] = useState(true);
  const generation = useRef<{ params: string; id: string } | null>(null);
  const sending = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let cancelled = false;
    setExam(null); setConfirm(false); setError(''); setDraftSaved(true);
    if (!examId) { setLoading(false); return; }
    setLoading(true);
    api<ExamDetail>(`/exams/${examId}`).then(data => {
      if (!cancelled) { setExam(data); setAnswers(readDraft(data.id)); }
    }).catch((e: Error) => { if (!cancelled) setError(e.message); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [examId, retry]);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    if (sending.current) return;
    sending.current = true; setBusy(true); setError('');
    const params = JSON.stringify({ topic, level, question_count: count });
    if (generation.current?.params !== params) generation.current = { params, id: crypto.randomUUID() };
    try {
      const data = await api<ExamDetail>('/exams', 'POST', { topic, level, question_count: count, request_id: generation.current.id });
      generation.current = null; onOpen(data.id);
    } catch (e) { setError((e as Error).message); }
    finally { sending.current = false; setBusy(false); }
  }

  function changeAnswer(id: string, value: string) {
    const next = { ...answers, [id]: value };
    setAnswers(next); setConfirm(false);
    try { localStorage.setItem(`calculo-exam-draft:${examId}`, JSON.stringify(next)); setDraftSaved(true); }
    catch { setDraftSaved(false); }
  }

  async function submit() {
    if (!exam || sending.current) return;
    sending.current = true; setBusy(true); setError('');
    try {
      const result = await api<ExamDetail>(`/exams/${exam.id}/submit`, 'POST', {
        answers: exam.questions.map(q => ({ question_id: q.id, answer: answers[q.id] ?? '' })),
      });
      setExam(result); setConfirm(false);
      try { localStorage.removeItem(`calculo-exam-draft:${exam.id}`); } catch { /* Result is safely persisted on the server. */ }
      heading.current?.focus();
    } catch (e) { setError((e as Error).message); setConfirm(false); }
    finally { sending.current = false; setBusy(false); }
  }

  const answered = exam?.questions.filter(q => answers[q.id]?.trim()).length ?? 0;
  return <section className="exam-workspace" aria-label="Generar y resolver examen">
    <p className="exam-disclaimer">Autoevaluaciones de práctica de Cálculo I. No son notas oficiales ni pruebas de investigación.</p>
    {error && <div className="error-box" role="alert"><span>{error}</span>{examId && !exam && <button onClick={() => setRetry(n => n + 1)}>Reintentar carga</button>}</div>}
    {!examId && <form className="exam-panel" onSubmit={generate}><span className="eyebrow">PREPARA TU AUTOEVALUACIÓN</span><h2>Generar examen</h2><p>Preguntas numéricas del banco paramétrico actual, sin pistas durante el examen. Las soluciones aparecerán al enviarlo.</p>
      <div className="exam-options"><div><label htmlFor="exam-topic">Tema</label><select id="exam-topic" value={topic} disabled={busy} onChange={e => setTopic(e.target.value as ExamTopic)}>{Object.entries(examTopicNames).map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select></div><div><label htmlFor="exam-level">Dificultad</label><select id="exam-level" value={level} disabled={busy} onChange={e => setLevel(Number(e.target.value))}>{examLevelNames.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}</select></div><div><label htmlFor="exam-count">Cantidad de preguntas (3–20)</label><input id="exam-count" type="number" min="3" max="20" step="1" required value={count} disabled={busy} onChange={e => setCount(e.target.valueAsNumber)} /></div></div>
      <div className="exam-info"><Clock size={18} /><p>Sin límite de tiempo. Se registra el tiempo transcurrido desde la generación hasta el envío, incluidas las pausas.</p></div><div className="lesson-actions"><button className="button primary" disabled={busy || !Number.isInteger(count)}>{busy ? <><LoaderCircle size={17} className="spin" />Generando examen…</> : 'Generar y comenzar'}</button><button className="button secondary" type="button" disabled={busy} onClick={onHistory}>Ver historial</button></div></form>}
    {loading && <div className="loading" role="status"><LoaderCircle className="spin" />Cargando examen…</div>}
    {exam && <>
      <div className="exam-panel"><div className="section-heading"><div><span className="eyebrow">{exam.course} / INTENTO {exam.attempt_number}</span><h2 ref={heading} tabIndex={-1}>{exam.status === 'completed' ? 'Resultado del examen' : 'Examen en progreso'}</h2><p>{examTopicNames[exam.topic]} · {examLevelNames[exam.level - 1]} · {exam.question_count} preguntas</p></div><span className={`exam-status ${exam.status}`}>{exam.status === 'completed' ? 'Finalizado' : 'En progreso'}</span></div><p className="exam-meta">Generado: {examDate(exam.created_at)}{exam.submitted_at && ` · Enviado: ${examDate(exam.submitted_at)}`}</p>
        {exam.status === 'completed' ? <><div className="exam-result" role="status"><FileCheck2 size={28} /><strong>{exam.score?.toFixed(2)}<small> / 20</small></strong><span>{exam.percentage?.toFixed(1)}% de aciertos</span></div><p>{exam.correct_count} correctas · {exam.incorrect_count} incorrectas (incluye {exam.unanswered_count} sin responder).</p><p className="exam-meta">Tiempo transcurrido: {elapsed(exam.elapsed_seconds)}. Incluye pausas; no mide tiempo activo.</p><div className="lesson-actions"><button className="button primary" onClick={onHistory}>Ver historial y rendimiento</button><button className="button secondary" onClick={() => onOpen(null)}>Generar otro examen</button></div></> : <><p>{answered} de {exam.question_count} respuestas completadas.</p><progress className="exam-progress" max={exam.question_count} value={answered} aria-label="Preguntas respondidas" /><p className="exam-meta">{draftSaved ? 'Borrador guardado en este navegador. Puedes retomar el examen desde el historial.' : 'No se pudo guardar el borrador local. Mantén esta pantalla abierta hasta enviar.'}</p></>}
      </div>
      <form onSubmit={e => { e.preventDefault(); setConfirm(true); setError(''); }}>
        {exam.questions.map(q => <article className="exam-question" key={q.id}><span className="eyebrow">PREGUNTA {q.position} · {examTopicNames[q.topic]}</span><h3>{q.prompt}</h3><div className="math-expression">{q.formula}</div>{exam.status === 'in_progress' ? <><label htmlFor={`question-${q.id}`}>Tu respuesta a la pregunta {q.position}</label><input id={`question-${q.id}`} autoComplete="off" maxLength={80} placeholder="Número, decimal o fracción" value={answers[q.id] ?? ''} disabled={busy} onChange={e => changeAnswer(q.id, e.target.value)} /></> : <div className={`feedback ${q.correct ? 'correct' : 'review'}`}><strong>{q.correct ? 'Correcta' : q.answer ? 'Incorrecta' : 'Sin responder'}</strong><p>Tu respuesta: {q.answer || '—'} · Respuesta correcta: {q.expected}</p><p>{q.explanation}</p></div>}</article>)}
        {exam.status === 'in_progress' && <div className="exam-panel"><p>Las respuestas en blanco cuentan como incorrectas. Una vez enviado, el examen no se puede modificar.</p>{confirm ? <div className="exam-confirm" role="region" aria-label="Confirmar envío"><strong>¿Enviar las {exam.question_count} preguntas?</strong><p>{exam.question_count - answered} quedarán sin responder. Se guardará un único resultado.</p><div className="lesson-actions"><button className="button primary" type="button" disabled={busy} onClick={() => void submit()}><Check size={17} />{busy ? 'Guardando resultado…' : 'Confirmar envío'}</button><button className="button secondary" type="button" disabled={busy} onClick={() => setConfirm(false)}>Seguir revisando</button></div></div> : <div className="lesson-actions"><button className="button primary" disabled={busy} type="submit">Revisar y enviar</button><button className="button secondary" type="button" disabled={busy} onClick={onHistory}>Salir al historial</button></div>}</div>}
      </form>
    </>}
  </section>;
}
