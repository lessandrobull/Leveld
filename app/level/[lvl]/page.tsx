'use client';

import { useParams } from 'next/navigation';
import TextCatalog from '../../../components/TextCatalog';

export default function Page() {
  const params = useParams();
  const lvl = ((params.lvl as string) || 'A1').toUpperCase() as any;
  return <TextCatalog level={lvl} />;
}