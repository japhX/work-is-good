'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STEPS = [
  { k: 'text', t: 'Where are you now?', h: 'Your studies, job, or skills. A sentence or two is enough.', p: 'Final-year student in economics, no work experience yet' },
  { k: 'text', t: 'Where do you want to be?', h: 'A role, a field, or the kind of work you want.', p: 'A data analyst at a bank or a startup' },
  { k: 'single', t: 'How long do you want to take to get there?', h: 'Pick the timeframe that feels right. We’ll plan around it.', o: ['3 months', '6 months', '1 year', 'Not sure yet'] },
  { k: 'multi', t: 'What’s getting in the way?', h: 'Tick everything that applies.', p: 'Anything else? Add it here (optional)',
    o: ['I don’t know which skills to learn', 'I don’t know who to ask for help', 'I have no experience yet', 'I don’t have much time', 'I don’t have much money', 'It’s hard to stay consistent'] },
];

export default function Questions() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [a, setA] = useState(['', '', '', { picked: [], extra: '' }]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const s = STEPS[i];

  const set = (v) => setA(a.map((x, k) => (k === i ? v : x)));
  const toggle = (o) => {
    const p = a[3].picked;
    set({ ...a[3], picked: p.includes(o) ? p.filter((x) => x !== o) : [...p, o] });
  };

  async function next(e) {
    e.preventDefault();
    const v = a[i];
    if (s.k === 'text' && v.trim().length < 5) return setErr('Write a sentence or two so we can build a useful roadmap.');
    if (s.k === 'single' && !v) return setErr('Pick one to continue.');
    if (s.k === 'multi' && !v.picked.length && v.extra.trim().length < 5) return setErr('Tick at least one, or write your own.');
    setErr('');
    if (i < 3) return setI(i + 1);

    setBusy(true);
    const input = { current: a[0].trim(), goal: a[1].trim(), timeframe: a[2], hurdles: a[3].picked, extra: a[3].extra.trim() };
    try {
      const res = await fetch('/api/roadmap', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      sessionStorage.setItem('kazi_plan', JSON.stringify({ input, plan: data }));
      router.push('/roadmap');
    } catch (ex) {
      setErr(ex.message);
      setBusy(false);
    }
  }

  return (
    <div id="v-questions" className="view on">
      <div className="wrap">
        <p className="logo" aria-label="AI Kazi">@</p>
        {busy ? (
          <section className="done">
            <h1>Building your roadmap…</h1>
            <p>This can take up to half a minute.</p>
          </section>
        ) : (
          <form onSubmit={next} noValidate>
            <div className="bars" aria-hidden="true">{STEPS.map((_, k) => <i key={k} className={k <= i ? 'on' : ''} />)}</div>
            <p className="count" aria-live="polite">Question {i + 1} of 4</p>
            <h1 id="title">{s.t}</h1>
            <p className="hint">{s.h}</p>
            {s.o && (
              <div className="opts" role="group" aria-labelledby="title">
                {s.o.map((o) => (
                  <label className="chip" key={o}>
                    <input
                      type={s.k === 'single' ? 'radio' : 'checkbox'}
                      name="opt"
                      checked={s.k === 'single' ? a[i] === o : a[3].picked.includes(o)}
                      onChange={() => (s.k === 'single' ? set(o) : toggle(o))}
                    />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            )}
            {s.k !== 'single' && (
              <>
                <label htmlFor="ans" style={{ position: 'absolute', left: -9999 }}>Your answer</label>
                <textarea
                  id="ans" maxLength={500} placeholder={s.p}
                  style={{ minHeight: s.k === 'multi' ? 90 : 130 }}
                  value={s.k === 'text' ? a[i] : a[3].extra}
                  onChange={(e) => (s.k === 'text' ? set(e.target.value) : set({ ...a[3], extra: e.target.value }))}
                />
              </>
            )}
            <p className="err" role="alert">{err}</p>
            <div className="nav">
              <button type="button" className={`back${i === 0 ? ' gone' : ''}`} onClick={() => { setErr(''); setI(Math.max(0, i - 1)); }}>Back</button>
              <button type="submit" className="next">{i < 3 ? 'Next' : 'Build my roadmap'}</button>
            </div>
          </form>
        )}
        {busy && err && <p className="err" role="alert">{err}</p>}
      </div>
    </div>
  );
}
