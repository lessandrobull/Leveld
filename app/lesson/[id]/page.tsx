'use client';

import { Suspense } from 'react';
import ExerciseRoom from '../../../components/ExerciseRoom';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-neutral-400">Carregando...</div>}>
      <ExerciseRoom />
    </Suspense>
  );
}