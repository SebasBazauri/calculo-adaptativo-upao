import { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { labs, type Lab } from '../content/labs';
import { topicNames, type TopicId } from '../content/catalog';

type GgbApi = {
  evalCommand(command: string): boolean;
  setValue(name: string, value: number): void;
  setCoordSystem(xmin: number, xmax: number, ymin: number, ymax: number): void;
  setSize(width: number, height: number): void;
  setColor(name: string, r: number, g: number, b: number): void;
  remove(): void;
};
type GgbConstructor = new (parameters: Record<string, unknown>, html5: boolean) => { inject(id: string): void };
declare global { interface Window { GGBApplet?: GgbConstructor } }
let loader: Promise<void> | undefined;

function loadGeoGebra() {
  if (window.GGBApplet) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    let timer: number;
    function fail() {
      window.clearTimeout(timer); script.remove(); loader = undefined;
      reject(new Error('No se pudo descargar GeoGebra. Comprueba tu conexión y vuelve a intentar.'));
    }
    timer = window.setTimeout(fail, 25000);
    script.src = 'https://www.geogebra.org/apps/deployggb.js';
    script.async = true;
    script.onload = () => { window.clearTimeout(timer); if (window.GGBApplet) resolve(); else fail(); };
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return loader;
}

function Applet({ lab }: { lab: Lab }) {
  const host = useRef<HTMLDivElement>(null);
  const api = useRef<GgbApi | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [value, setValue] = useState(lab.control.initial);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let disposed = false;
    let observer: ResizeObserver | undefined;
    let mount: HTMLDivElement | undefined;
    setStatus('loading'); setError(''); setValue(lab.control.initial);
    // A unique mount per effect also prevents late callbacks from a previous topic
    // or React StrictMode pass from taking control of the current applet.
    const timer = window.setTimeout(() => {
      if (!disposed) { setStatus('error'); setError('GeoGebra está tardando demasiado en iniciar. Puedes reintentar o volver al catálogo.'); }
    }, 60000);
    void loadGeoGebra().then(() => {
      if (disposed || !host.current || !window.GGBApplet) return;
      mount = document.createElement('div');
      mount.id = `ggb-${crypto.randomUUID()}`;
      host.current.appendChild(mount);
      const applet = new window.GGBApplet({
        id: `ggb_api_${crypto.randomUUID().replaceAll('-', '')}`, appName: 'classic', language: 'es', perspective: 'AG',
        width: Math.max(260, Math.floor(host.current.clientWidth)), height: 480,
        showToolBar: true, showMenuBar: false, showAlgebraInput: false, showResetIcon: false,
        showZoomButtons: true, enableShiftDragZoom: true, enableRightClick: false,
        errorDialogsActive: false, showLogging: false, borderColor: '#e4eae6',
        appletOnLoad: (instance: GgbApi) => {
          if (disposed) { instance.remove(); return; }
          api.current = instance;
          try {
            for (const command of lab.commands) {
              if (!instance.evalCommand(command)) throw new Error('Una herramienta de esta actividad no pudo inicializarse.');
            }
            instance.setCoordSystem(...lab.bounds);
            instance.setColor('f', 41, 99, 79);
            if (lab.id === 'derivative-power') instance.setColor('g', 168, 103, 53);
            window.clearTimeout(timer); setStatus('ready');
            observer = new ResizeObserver(() => {
              if (host.current && !disposed) instance.setSize(Math.max(260, Math.floor(host.current.clientWidth)), 480);
            });
            observer.observe(host.current!);
          } catch (e) {
            window.clearTimeout(timer); setStatus('error'); setError((e as Error).message);
          }
        },
      }, true);
      applet.inject(mount.id);
    }).catch((e: Error) => {
      if (!disposed) { window.clearTimeout(timer); setStatus('error'); setError(e.message); }
    });
    return () => {
      disposed = true; window.clearTimeout(timer); observer?.disconnect();
      api.current?.remove(); api.current = null; mount?.remove();
    };
  }, [lab, retry]);

  function changeValue(next: number) {
    if (!api.current) return;
    try { api.current.setValue(lab.control.name, next); setValue(next); }
    catch { setError('No se pudo actualizar la construcción. Reinicia la actividad.'); setStatus('error'); }
  }

  return <>
    <div className="ggb-status" role="status">{status === 'loading' ? 'Cargando GeoGebra…' : status === 'ready' ? 'GeoGebra conectado · actividad interactiva' : 'GeoGebra no está disponible'}</div>
    {status === 'error' && <div className="error-box" role="alert"><p>{error}</p><button onClick={() => setRetry(n => n + 1)}>Reintentar GeoGebra</button></div>}
    <div className="ggb-host" ref={host} aria-label={`GeoGebra: ${lab.title}`} style={status === 'error' ? { display: 'none' } : undefined} />
    <div className="ggb-controls"><label htmlFor="ggb-control">{lab.control.label}<output htmlFor="ggb-control">{value.toFixed(2)}</output></label><input id="ggb-control" type="range" min={lab.control.min} max={lab.control.max} step={lab.control.step} value={value} disabled={status !== 'ready'} onChange={e => changeValue(Number(e.target.value))} /><button className="button secondary" onClick={() => setRetry(n => n + 1)}><RotateCcw size={16} />Reiniciar actividad</button></div>
  </>;
}

export default function GeoGebraLab({ selected, onSelect, onTheory, onPractice }: { selected: string; onSelect: (id: string) => void; onTheory: () => void; onPractice: (topic: TopicId) => void }) {
  const lab = labs.find(item => item.id === selected) ?? labs[0];
  return <section className="lab-panel geogebra-panel">
    <div className="catalog-filters"><div><label htmlFor="lab-topic">Tema del laboratorio</label><select id="lab-topic" value={lab.topic} onChange={e => onSelect(labs.find(item => item.topic === e.target.value)!.id)}>{Object.entries(topicNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></div><div><label htmlFor="lab-activity">Herramienta / actividad</label><select id="lab-activity" value={lab.id} onChange={e => onSelect(e.target.value)}>{labs.filter(item => item.topic === lab.topic).map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></div></div>
    <h2>{lab.title}</h2><p className="lab-description">{lab.description}</p><ul className="lab-tools" aria-label="Herramientas de esta actividad">{lab.tools.map(tool => <li key={tool}>{tool}</li>)}</ul>
    <Applet key={lab.id} lab={lab} />
    <div className="reflection"><p><strong>Observa y explica:</strong> {lab.observation}</p></div>
    <div className="lesson-actions"><button className="button primary" onClick={() => onPractice(lab.topic)}>Practicar {topicNames[lab.topic].toLowerCase()}</button><button className="button secondary" onClick={onTheory}>Consultar teoría</button></div>
    <p className="integration-note">GeoGebra requiere conexión a internet. Esta exploración no se registra como evaluación. <a href="https://www.geogebra.org/" target="_blank" rel="noreferrer">Acerca de GeoGebra</a></p>
  </section>;
}
