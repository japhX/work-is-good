'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const TIPS = [
  { k: ['skill'], t: 'Find your skills list', x: 'Open five job posts for the role you want and write down the skills that appear in most of them. Start with the top two.' },
  { k: ['who to'], t: 'Ask one person a step ahead', x: 'Pick someone just ahead of you, not a famous name. Send a short message with one specific question and what you’ve already tried.' },
  { k: ['experience', 'portfolio'], t: 'Make one small sample', x: 'Create one small project or piece that shows the kind of work you want to be hired for, and share it where others can see it.' },
  { k: ['time'], t: 'Book two small slots', x: 'Put two short sessions a week in your calendar. Fixed small slots are easier to keep than “whenever I have time”.' },
  { k: ['money'], t: 'Start with free tools', x: 'Use free courses and tools first, and spend nothing until you know which skill you actually need.' },
  { k: ['consisten'], t: 'Make it smaller than feels useful', x: 'Shrink the task until it takes ten minutes, and attach it to something you already do every day.' },
  { k: ['post'], t: 'Decide what you’re known for', x: 'Pick three things you want to be known for and post only those for a month.' },
  { k: ['price'], t: 'Check what others charge', x: 'Ask three people at your level what they charge before you set your own prices.' },
  { k: ['promot', 'clients'], t: 'Make it easy to contact you', x: 'Add one clear line to your profile saying what you do and how to reach you.' },
];

export default function Busy() {
  const router = useRouter();
  const [input, setInput] = useState(null);
  const [trying, setTrying] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    try { setInput(JSON.parse(sessionStorage.getItem('kazi_pending'))); } catch {}
  }, []);

  async function retry() {
    if (!input) return router.push('/questions');
    setTrying(true);
    setMsg('');
    try {
      const res = await fetch('/api/roadmap', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
      const raw = await res.text();
      let data;
      try { data = JSON.parse(raw); } catch { data = { busy: true }; }
      if (data.busy) { setMsg('Still busy. Please try again in a few minutes.'); setTrying(false); return; }
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      sessionStorage.setItem('kazi_plan', JSON.stringify({ input, plan: data }));
      sessionStorage.removeItem('kazi_pending');
      router.push('/roadmap');
    } catch (ex) {
      setMsg(ex.message);
      setTrying(false);
    }
  }

  const text = (((input && input.hurdles) || []).join(' ') + ' ' + ((input && input.extra) || '')).toLowerCase();
  let tips = TIPS.filter((t) => t.k.some((w) => text.includes(w))).slice(0, 3);
  if (!tips.length) tips = [TIPS[0], TIPS[1], TIPS[2]];

  return (
    <div id="v-busy" className="view on">
      <div className="wrap">
        <p className="logo" aria-label="AI Kazi">@</p>
        <h1>We’re a little busy right now</h1>
        <p className="hint">Lots of people are using the AI at the moment. {input ? 'Your answers are saved, so you don’t need to type them again.' : ''}</p>
        <button type="button" onClick={retry} disabled={trying}>{trying ? 'Trying…' : input ? 'Try again' : 'Start again'}</button>
        <p className="err" role="status">{msg}</p>
        <section className="tips">
          <h2>While you wait</h2>
          <p className="tipsub">General tips, not your personalised roadmap.</p>
          {tips.map((t) => (
            <div className="tip" key={t.t}><b>{t.t}</b><p>{t.x}</p></div>
          ))}
        </section>
      </div>
    </div>
  );
}
