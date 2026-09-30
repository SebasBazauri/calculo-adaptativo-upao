import { useState } from 'react';
import { BookOpen, FlaskConical } from 'lucide-react';
import { lessons, topicNames, type TopicId } from '../content/catalog';

export default function TheoryCatalog({ initialLessonId, onLab, onPractice }: { initialLessonId: string; onLab: (id: string) => void; onPractice: (topic: TopicId) => void }) {
  const [topic, setTopic] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(initialLessonId);
  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const filtered = lessons.filter(l => (topic === 'all' || l.topic === topic) && normalize(`${l.title} ${l.subtitle} ${topicNames[l.topic]}`).includes(normalize(query)));
  const lesson = filtered.find(l => l.id === selected) ?? filtered[0];
  return <section aria-label="Catálogo teórico">
    <div className="catalog-filters"><div><label htmlFor="theory-search">Buscar contenido</label><input id="theory-search" type="search" placeholder="Ej. continuidad o tangente" value={query} onChange={e => setQuery(e.target.value)} /></div><div><label htmlFor="theory-topic">Tema</label><select id="theory-topic" value={topic} onChange={e => setTopic(e.target.value)}><option value="all">Todos los temas</option>{Object.entries(topicNames).map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select></div></div>
    <p className="catalog-count" role="status">{filtered.length} lecciones · Contenido de demostración pendiente de revisión docente</p>
    {lesson ? <div className="catalog-layout"><nav className="lesson-list" aria-label="Lecciones">{filtered.map((l, i) => <button key={l.id} aria-current={l.id === lesson.id ? 'page' : undefined} className={l.id === lesson.id ? 'selected' : ''} onClick={() => setSelected(l.id)}><span>{String(i + 1).padStart(2, '0')} · {topicNames[l.topic]}</span><strong>{l.title}</strong><small>{l.subtitle}</small></button>)}</nav>
      <article className="lesson-body" key={lesson.id}><span className="eyebrow">{topicNames[lesson.topic]} / TEORÍA</span><h2>{lesson.title}</h2><p className="lesson-subtitle">{lesson.subtitle}</p><div className="lesson-objective"><BookOpen size={19} /><p>{lesson.objective}</p></div>
        {lesson.sections.map(section => <section key={section.title}><h3>{section.title}</h3><p>{section.text}</p>{section.formula && <div className="theory-formula">{section.formula}</div>}</section>)}
        <section className="worked-example"><span className="eyebrow">EJEMPLO RESUELTO</span><h3>{lesson.example.title}</h3><ol>{lesson.example.steps.map(step => <li key={step}>{step}</li>)}</ol><strong>{lesson.example.result}</strong></section>
        <aside className="lesson-warning"><strong>Ten en cuenta</strong><p>{lesson.warning}</p></aside><section><h3>Comprueba tu comprensión</h3><p>{lesson.question}</p></section>
        <div className="lesson-actions"><button className="button primary" onClick={() => onLab(lesson.id)}><FlaskConical size={17} />Explorar en GeoGebra</button><button className="button secondary" onClick={() => onPractice(lesson.topic)}>Practicar {topicNames[lesson.topic].toLowerCase()}</button></div>
      </article></div> : <div className="catalog-empty"><h2>No hay lecciones con ese filtro.</h2><button className="button secondary" onClick={() => { setQuery(''); setTopic('all'); }}>Mostrar todo el catálogo</button></div>}
  </section>;
}
