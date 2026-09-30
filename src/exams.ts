export type ExamTopic = 'limits' | 'derivatives' | 'mixed';
export const examTopicNames: Record<ExamTopic, string> = { limits: 'Límites', derivatives: 'Derivadas', mixed: 'Límites y derivadas' };
export const examLevelNames = ['Inicial', 'Intermedio', 'Avanzado'];
export type ExamSummary = {
  id: string; course: string; topic: ExamTopic; level: number; question_count: number;
  created_at: string; submitted_at: string | null; status: 'in_progress' | 'completed';
  attempt_number: number; score: number | null; percentage: number | null;
  correct_count: number | null; incorrect_count: number | null; answered_count: number | null;
  unanswered_count: number | null; elapsed_seconds: number | null;
};
export type ExamQuestion = {
  id: string; position: number; topic: ExamTopic; level: number; prompt: string; formula: string;
  resource_version: string; answer?: string; correct?: boolean; expected?: string; explanation?: string;
};
export type ExamDetail = ExamSummary & { questions: ExamQuestion[] };
export type ExamHistory = { items: ExamSummary[]; total: number; offset: number; limit: number };
export type ExamMetrics = {
  course: string; completed_exams: number; average_score: number | null; average_percentage: number | null;
  overall_percentage: number | null; questions: number; answered: number; correct: number; incorrect: number;
  unanswered: number; suggestion: string | null;
  by_topic: { topic: ExamTopic; questions: number; correct: number; incorrect: number; percentage: number }[];
  timeline: { id: string; submitted_at: string; topic: ExamTopic; level: number; question_count: number; score: number; percentage: number }[];
};
export const examDate = (date: string) => new Date(date).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
export function elapsed(seconds: number | null) {
  if (seconds === null) return '—';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  return `${hours ? `${hours} h ` : ''}${minutes} min ${seconds % 60} s`;
}

export function readDraft(id: string): Record<string, string> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(`calculo-exam-draft:${id}`) ?? '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length <= 80));
  } catch { return {}; }
}
