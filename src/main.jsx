

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import DebateTopics from './components/DebateTopics.jsx';
import ContactUs from './components/ContactUs.jsx';

function getDebateTopicFromUrl() {
  const m = window.location.pathname.match(/debate_(.+)\.html$/);
  if (m) {
    return m[1].replace(/_/g, ' ');
  }
  return null;
}

function MainRouter() {
  const [page, setPage] = useState(() => {
    const topic = getDebateTopicFromUrl();
    if (topic) return { type: 'debate', topic };
    return { type: 'home' };
  });

  if (page.type === 'contact') {
    return <ContactUs onBack={() => setPage({ type: 'home' })} />;
  }
  if (page.type === 'debate') {
    return <>
      <div className="breadcrumb">
        <span className="breadcrumb-link" onClick={() => setPage({ type: 'home' })}>Home</span> &gt; {page.topic}
      </div>
      <App topic={page.topic} />
    </>;
  }
  // Home page
  return <DebateTopics onContact={() => setPage({ type: 'contact' })} onTopicClick={topic => setPage({ type: 'debate', topic })} />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MainRouter />
  </StrictMode>
);
