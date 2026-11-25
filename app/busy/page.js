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

const MAX = 6;        // background attempts in one round
const GAP = 20000;    // 20 seconds between attempts

export default function Busy() {
  const router = useRouter();
  const [input, setInput] = useState(null);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState('waiting'); // waiting | gaveup | error
  const [attempt, setAttempt] = useState(0);
  const [round, setRound] = useState(0);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    try { setInput(JSON.parse(localStorage.getItem('kazi_pending'))); } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!input) return;
    let stop = false;
    setPhase('waiting');
    setAttempt(0);
    (async () => {
      for (let n = 1; n <= MAX && !stop; n++) {
        await new Promise((r) => setTimeout(r, n === 1 ? 8000 : GAP));
        if (stop) return;
        setAttempt(n);
        try {
          const res = await fetch('/api/roadmap', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
          const raw = await res.text();
          let data;
          try { data = JSON.parse(raw); } catch { data = { busy: true }; }
          if (stop) return;
          if (!data.busy) {
            if (!res.ok) { setErrMsg(data.error || 'Something went wrong.'); setPhase('error'); return; }
            sessionStorage.setItem('kazi_plan', JSON.stringify({ input, plan: data }));
            localStorage.removeItem('kazi_pending');
            router.push('/roadmap');
            return;
          }
        } catch {
          // network hiccup: keep waiting
        }
      }
      if (!stop) setPhase('gaveup');
    })();
    return () => { stop = true; };
  }, [input, round, router]);

  if (!ready) return null;

  if (!input) {
    return (
      <div id="v-busy" className="view on">
        <div className="wrap">
          <p className="logo" aria-label="AI Kazi">@</p>
          <h1>No saved answers</h1>
          <p className="hint">We couldn’t find any saved answers on this device.</p>
          <button type="button" onClick={() => router.push('/questions')}>Start</button>
        </div>
      </div>
    );
  }

  const text = ((input.hurdles || []).join(' ') + ' ' + (input.extra || '')).toLowerCase();
  let tips = TIPS.filter((t) => t.k.some((w) => text.includes(w))).slice(0, 3);
  if (!tips.length) tips = [TIPS[0], TIPS[1], TIPS[2]];

  return (
    <div id="v-busy" className="view on">
      <div className="wrap">
        <p className="logo" aria-label="AI Kazi">@</p>
        <h1>The AI is busy right now</h1>

        {phase === 'waiting' && (
          <>
            <p className="hint">It’s running a lot of tests at the moment, so your full roadmap is taking longer than usual. Your answers are saved, and we’re checking again for you in the background.</p>
            <p className="status" role="status">{attempt === 0 ? 'Getting ready to check…' : `Checking for your roadmap (${attempt} of ${MAX})`}</p>
          </>
        )}

        {phase === 'gaveup' && (
          <>
            <p className="hint">It’s still very busy with tests. The best thing is to come back a bit later. Your answers are saved on this device, and your roadmap will be built when you open this page again, so you could bookmark it.</p>
            <button type="button" onClick={() => setRound((r) => r + 1)}>Check for my roadmap</button>
          </>
        )}

        {phase === 'error' && (
          <>
            <p className="hint">{errMsg}</p>
            <button type="button" onClick={() => router.push('/questions')}>Start</button>
          </>
        )}

        <section className="tips">
          <h2>As you wait for your full roadmap, you can consider…</h2>
          <p className="tipsub">General tips, not your personalised roadmap.</p>
          {tips.map((t) => (
            <div className="tip" key={t.t}><b>{t.t}</b><p>{t.x}</p></div>
          ))}
        </section>
      </div>
    </div>
  );
}
