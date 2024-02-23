'use client';

// import { Editor } from '@/components/editor';

import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/components/editor'), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});

export default function Home() {
  return <Editor />;
}
