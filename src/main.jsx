

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import DebateTopics from './components/DebateTopics.jsx';
import ContactUs from './components/ContactUs.jsx';
import Guidelines from './components/Guidelines.jsx';
import TopNav from './components/TopNav.jsx';
import FAQ from './components/FAQ.jsx';

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

  // Unique ID jump logic
  const jumpToUniqueId = (id) => {
    if (!id) return;
    const el = document.querySelector(`[data-uniqueid="${id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('highlight-reply');
      setTimeout(() => el.classList.remove('highlight-reply'), 1800);
    } else {
      alert('Unique ID not found on this page.');
    }
  };
  const navProps = {
    onHome: () => setPage({ type: 'home' }),
    onContact: () => setPage({ type: 'contact' }),
    onGuidelines: () => setPage({ type: 'guidelines' }),
    onFAQ: () => setPage({ type: 'faq' }),
    active: page.type,
    onJump: page.type === 'debate' ? jumpToUniqueId : undefined
  };

  return (
    <>
      <TopNav {...navProps} />
      {page.type === 'contact' && <ContactUs onBack={() => setPage({ type: 'home' })} />}
      {page.type === 'guidelines' && <Guidelines onBack={() => setPage({ type: 'home' })} />}
      {page.type === 'faq' && <FAQ onBack={() => setPage({ type: 'home' })} />}
      {page.type === 'debate' && <>
        <div className="breadcrumb">
          <span className="breadcrumb-link" onClick={() => setPage({ type: 'home' })}>Home</span> &gt; {page.topic}
        </div>
        <App topic={page.topic} />
      </>}
      {page.type === 'home' && <DebateTopics onContact={navProps.onContact} onTopicClick={topic => setPage({ type: 'debate', topic })} />}
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MainRouter />
  </StrictMode>
);
