import lesson01 from './01-coffee-culture.json';
import lesson02 from './02-remote-work.json';

// Lista de todas as lições em ordem de exibição no catálogo
export const lessons: any[] = [
  lesson01,
  lesson02,
];

// Mapa indexado por ID gerado automaticamente a partir da lista acima
export const lessonsMap: Record<string, any> = Object.fromEntries(
  lessons.map((lesson) => [lesson.id, lesson])
);