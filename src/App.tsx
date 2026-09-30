import { useEffect, useState } from 'react';
import { ArrowUpRight, BookOpen, ChartNoAxesCombined, Check, ChevronRight, Download, FlaskConical, Lightbulb, LoaderCircle, PanelLeftClose, Play, RotateCcw, Target } from 'lucide-react';
import { api, downloadAttempts, type Exercise, type Progress, type Result, type Topic } from './api';

import TheoryCatalog from './components/TheoryCatalog';
import GeoGebraLab from './components/GeoGebraLab';

type View = 'learn' | 'catalog' | 'lab' | 'progress';
const levels = ['Inicial', 'En práctica', 'Avanzado'];

function Curve({ interactive = false }: { interactive?: boolean }) {
  const [point, setPoint] = useState(1);
  const sx = (x: number) => 180 + x * 56;
  const sy = (y: number) => 215 - y * 27;
  const curve = Array.from({ length: 101 }, (_, i) => { const x = -2.5 + i / 20; return `${i ? 'L' : 'M'}${sx(x)},${sy(x*x)}`; }).join(' ');
  return <div className={interactive ? 'interactive-graph' : 'hero-graph'}>
    <svg viewBox="0 0 380 250" role="img" aria-label={`Gráfica de f(x) = x al cuadrado. Tangente en x = ${point}. Pendiente ${2*point}.`}>
      <defs><pattern id={interactive ? 'grid-lab' : 'grid-hero'} width="28" height="27" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 27" fill="none" stroke="currentColor" strokeWidth="0.5" opacity=".14" /></pattern></defs>
      <rect width="380" height="250" fill={`url(#${interactive ? 'grid-lab' : 'grid-hero'})`} />
      <path d="M16 215 H366 M180 240 V12" stroke="currentColor" strokeWidth="1" opacity=".4" />
      <text x="359" y="234">x</text><text x="190" y="20">y</text>
      {[-2,-1,1,2].map(x => <text key={x} x={sx(x)-4} y="232" fontSize="11">{x}</text>)}
      <text x="157" y="112" fontSize="11">4</text>
      <path d={curve} fill="none" stroke={interactive ? '#29634f' : '#c9ee90'} strokeWidth="3" />
      <path d={`M${sx(-2.7)},${sy(2*point*(-2.7)-point*point)} L${sx(2.7)},${sy(2*point*2.7-point*point)}`} stroke={interactive ? '#a76735' : '#f4c798'} strokeWidth="2" strokeDasharray="6 5" />
      <circle cx={sx(point)} cy={sy(point*point)} r="6" fill={interactive ? '#29634f' : '#c9ee90'} stroke={interactive ? '#fff' : '#183831'} strokeWidth="3" />
      <text x="264" y="45" fontSize="17" fontFamily="Georgia">f(x) = x²</text>
    </svg>
    {interactive && <div className="graph-controls"><label htmlFor="point">Punto de tangencia <strong>x = {point.toFixed(1)}</strong></label><input id="point" type="range" min="-2" max="2" step="0.1" value={point} onChange={e => setPoint(Number(e.target.value))} /><div className="graph-legend"><span>Curva: f(x) = x²</span><span>Tangente: pendiente {Number((2*point).toFixed(1))}</span></div><p>Cuando x es negativo, la pendiente es negativa. En x = 0, la tangente es horizontal. ¿Qué sucede cuando x es positivo?</p></div>}
  </div>;
}

export default function App() {
  const [view, setView] = useState<View>('learn');
  const [labId, setLabId] = useState('limit-value');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [hint, setHint] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function refresh() { setProgress(await api<Progress>('/progress')); }
  async function load() {
    setLoading(true); setError('');
    try { const [catalog, state] = await Promise.all([api<Topic[]>('/topics'), api<Progress>('/progress')]); setTopics(catalog); setProgress(state); }
    catch (e) { setError((e as Error).message || 'No se pudo conectar con la API.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  async function start(topic: string) {
    setBusy(true); setError('');
    try { const next = await api<Exercise>(`/exercises/${topic}`, 'POST'); setExercise(next); setAnswer(''); setResult(null); setHint(''); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!exercise || !answer.trim()) return;
    setBusy(true); setError('');
    try { setResult(await api<Result>(`/exercises/${exercise.id}/answer`, 'POST', { answer })); await refresh(); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function showHint() {
    if (!exercise) return;
    setBusy(true); setError('');
    try { const data = await api<{ hint: string }>(`/exercises/${exercise.id}/hint`, 'POST'); setHint(data.hint); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function exportData() {
    setBusy(true); setError('');
    try { await downloadAttempts(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  const accuracy = progress?.attempts ? Math.round(progress.correct / progress.attempts * 100) : null;

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#" onClick={e => { e.preventDefault(); setView('learn'); }}><span className="brand-symbol">ƒ</span><span>Cálculo<span className="brand-caption">APRENDE A TU RITMO</span></span></a>
      <div className="workspace-label">ESPACIO DE ESTUDIO <PanelLeftClose size={15} aria-hidden="true" /></div>
      <nav aria-label="Navegación principal">
        {([{ id: 'learn', title: 'Mi aprendizaje', icon: BookOpen }, { id: 'catalog', title: 'Catálogo teórico', icon: BookOpen }, { id: 'lab', title: 'Laboratorio visual', icon: FlaskConical }, { id: 'progress', title: 'Mi progreso', icon: ChartNoAxesCombined }] as const).map(item => <button key={item.id} className={view === item.id ? 'nav-item active' : 'nav-item'} onClick={() => setView(item.id)}><item.icon size={19} />{item.title}{view === item.id && <span className="active-dot" />}</button>)}
      </nav>
      <div className="sidebar-note"><span className="note-line" /><h3>Entender toma práctica.</h3><p>Explora una idea, prueba tu respuesta y sigue avanzando.</p><span className="note-formula">lim <span>Δx → 0</span></span></div>
      <div className="sidebar-footer"><span className="avatar">E</span><div>Estudiante de prueba<small>Sesión local de demostración</small></div></div>
    </aside>
    <div className="main-shell">
      <header className="topbar"><div>Cálculo I <ChevronRight size={14} /><strong>{view === 'learn' ? 'Mi aprendizaje' : view === 'catalog' ? 'Catálogo teórico' : view === 'lab' ? 'Laboratorio visual' : 'Mi progreso'}</strong></div><span className="demo-badge">DEMO ACADÉMICA</span></header>
      <main>
        <div className="page-heading"><div className="eyebrow">TU ESPACIO PARA COMPRENDER</div><h1>{view === 'learn' ? 'Una idea a la vez.' : view === 'catalog' ? 'Comprende antes de resolver.' : view === 'lab' ? 'Haz visible el cambio.' : 'Cada intento cuenta.'}</h1><p>{view === 'learn' ? 'Practica, explora y construye tu comprensión de Cálculo I.' : view === 'catalog' ? 'Conceptos, ejemplos y actividades para construir tus bases.' : view === 'lab' ? 'Elige un tema y experimenta con sus herramientas en GeoGebra.' : 'Revisa la actividad guardada en tu sesión de demostración.'}</p></div>
        {error && <div className="error-box" role="alert"><span>{error}</span><button onClick={() => void load()} disabled={loading}>Reintentar</button></div>}
        {loading && (view === 'learn' || view === 'progress') ? <div className="loading" role="status"><LoaderCircle className="spin" /> Preparando tu espacio…</div> : <>
          {view === 'learn' && <>
            {!exercise ? <section className="hero"><div className="hero-copy"><span className="hero-kicker">EXPLORA EL CÁLCULO</span><h2>De la intuición<br />a la comprensión.</h2><p>Empieza con límites y descubre cómo una función se acerca a un valor.</p><button className="button lime" disabled={busy || !topics.length} onClick={() => void start('limits')}><Play size={17} fill="currentColor" />Empezar a practicar</button><span className="hero-foot">A tu ritmo · Con pistas cuando las necesites</span></div><Curve /></section> : <section className="practice-panel" aria-label="Ejercicio de práctica">
              <div className="practice-top"><span className="eyebrow">{topics.find(t => t.id === exercise.topic)?.title} / NIVEL {exercise.level}</span><button className="text-button" disabled={busy} onClick={() => setExercise(null)}>Volver a los temas</button></div>
              <h2>{exercise.prompt}</h2><div className="math-expression">{exercise.formula}</div>
              <form onSubmit={submit}><label htmlFor="answer">Tu respuesta</label><div className="answer-row"><input id="answer" autoComplete="off" placeholder="Ej. 4 o 3/2" value={answer} onChange={e => setAnswer(e.target.value)} disabled={busy || !!result} required aria-describedby="answer-help" /><button className="button primary" disabled={busy || !!result || !answer.trim()}>{busy ? 'Procesando…' : 'Comprobar'}</button></div><p id="answer-help" className="input-help">Introduce un número, decimal o fracción. Tu primer envío queda registrado.</p></form>
              {!result && <button className="text-button hint-button" disabled={busy} onClick={() => void showHint()}><Lightbulb size={17} />{hint ? 'Ver pista de nuevo' : 'Necesito una pista'}</button>}
              {hint && <p className="hint-box">{hint}</p>}
              {result && <div className={result.correct ? 'feedback correct' : 'feedback review'} role="status"><strong>{result.correct ? '¡Bien! Tu respuesta es correcta.' : 'Revisemos el procedimiento.'}</strong><p>{result.explanation}</p><button className="button primary" disabled={busy} onClick={() => void start(exercise.topic)}>Siguiente ejercicio <ChevronRight size={17} /></button></div>}
            </section>}
            <section className="metrics" aria-label="Resumen de práctica"><div><span className="metric-icon"><BookOpen size={19} /></span><div><strong>{progress?.attempts ?? 0}</strong><span>Ejercicios resueltos</span></div></div><div><span className="metric-icon"><Target size={19} /></span><div><strong>{accuracy === null ? '—' : `${accuracy}%`}</strong><span>Respuestas correctas</span></div></div><div><span className="metric-icon"><ChartNoAxesCombined size={19} /></span><div><strong>{progress?.topics.filter(t => t.attempts > 0).length ?? 0}<small> / 2</small></strong><span>Temas explorados</span></div></div></section>
            <div className="section-heading"><div><h2>Tu ruta de aprendizaje</h2><p>Elige un tema para comenzar o continuar practicando.</p></div><span className="subtle-label">UNIDAD DE DEMOSTRACIÓN</span></div>
            <div className="topic-grid">{topics.map(topic => { const state = progress?.topics.find(t => t.id === topic.id); return <article className="topic-card" key={topic.id}><div className="topic-top"><span className="topic-symbol">{topic.id === 'limits' ? 'lim' : 'ƒ′'}</span><span className="unit-label">TEMA {topic.unit}</span></div><h3>{topic.title}</h3><p>{topic.subtitle}</p><div className="topic-meta"><span>{levels[(state?.level ?? 1)-1]}</span><span>{state?.attempts ?? 0} intentos</span></div><button className="topic-action" disabled={busy} onClick={() => void start(topic.id)}>{state?.attempts ? 'Continuar práctica' : 'Explorar tema'}<ArrowUpRight size={19} /></button></article>; })}</div>
            <section className="lab-callout"><span className="lab-icon"><FlaskConical size={24} /></span><div><h3>¿Y si pudieras verlo?</h3><p>Explora límites y derivadas con herramientas de GeoGebra.</p></div><button className="text-button" onClick={() => setView('lab')}>Abrir laboratorio <ArrowUpRight size={17} /></button></section>
          </>}
          {view === 'catalog' && <TheoryCatalog initialLessonId={labId} onLab={id => { setLabId(id); setView('lab'); }} onPractice={topic => { setView('learn'); void start(topic); }} />}
          {view === 'lab' && <GeoGebraLab selected={labId} onSelect={setLabId} onTheory={() => setView('catalog')} onPractice={topic => { setView('learn'); void start(topic); }} />}
          {view === 'progress' && <section className="progress-panel"><div className="section-heading"><div><h2>Tu práctica, en números</h2><p>Son registros de práctica; no representan una nota del curso.</p></div><button className="button secondary" disabled={busy || !progress?.attempts} onClick={() => void exportData()}><Download size={17} />Exportar CSV</button></div><div className="progress-total"><strong>{progress?.attempts ?? 0}</strong><span>ejercicios enviados</span><span className="correct-total"><Check size={18} />{progress?.correct ?? 0} correctos</span></div>{topics.map(topic => { const state = progress?.topics.find(t => t.id === topic.id); return <div className="progress-topic" key={topic.id}><div><h3>{topic.title}</h3><p>{state?.attempts ?? 0} intentos registrados</p></div><span>Nivel {state?.level ?? 1} de 3</span><div className="level-bars" aria-label={`Nivel ${state?.level ?? 1} de 3`}>{[1,2,3].map(n => <span key={n} className={n <= (state?.level ?? 1) ? 'filled' : ''} />)}</div></div>; })}<p className="adaptation-note"><RotateCcw size={18} />Regla de esta demo: tres aciertos consecutivos suben un nivel; un error reduce un nivel, hasta el mínimo de uno. Esta regla todavía requiere validación pedagógica.</p></section>}
          <footer className="page-footer"><span>Cálculo · Proyecto de tesis UPAO</span><span>Contenido de demostración pendiente de revisión docente.</span></footer>
        </>}
      </main>
    </div>
  </div>;
}
