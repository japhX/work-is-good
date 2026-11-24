'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const TRAIL = 'M3,0 C3,22 40,14 45,34 S20,52 40,62 S97,68 97,100';
const Conn = ({ flip, on }) => (
  <svg className={`c${flip ? ' f' : ''}${on ? ' on' : ''}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d={TRAIL} /></svg>
);

export default function Roadmap() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(-1);
  const [seen, setSeen] = useState({});
  const [done, setDone] = useState({});
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    try { setData(JSON.parse(sessionStorage.getItem('kazi_plan'))); } catch {}
    setReady(true);
  }, []);

  if (!ready) return null;
  if (!data || !data.plan) {
    return (
      <div id="v-roadmap" className="view on">
        <div className="wrap">
          <p className="logo" aria-label="AI Kazi">@</p>
          <h1>No roadmap yet</h1>
          <p className="line">Answer the four questions to build yours.</p>
          <button type="button" className="go" onClick={() => router.push('/questions')}>Start</button>
        </div>
      </div>
    );
  }

  const { plan, input } = data;
  const stages = plan.stages;
  const count = stages.filter((_, k) => done[k]).length;
  const won = count === stages.length;

  const toggleStage = (k) => {
    if (open === k) return setOpen(-1);
    setOpen(k);
    setSeen((s) => ({ ...s, [k]: true }));
  };

  const ask = (text) => {
    setQuestion(text);
    setMsg('Your question is added. Enter your email to request a peer.');
    const calm = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    document.getElementById('peer')?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
    document.getElementById('e')?.focus({ preventScroll: true });
  };

  async function request(e) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setMsg('Enter a valid email address.');
    try {
      const res = await fetch('/api/peer', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), goal: input.goal, hurdles: input.hurdles, question }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setMsg('Request received. We’ll be in touch when a peer is available.');
    } catch (ex) {
      setMsg(ex.message || 'Something went wrong. Please try again.');
    }
  }

  return (
    <div id="v-roadmap" className="view on">
      <div className="wrap">
        <p className="logo" aria-label="AI Kazi">@</p>
        <h1>Your route to {plan.destination}.</h1>
        <p className="line">{stages.length} checkpoints. {plan.duration}. One finish line.</p>

        <section className="strat" aria-labelledby="sg">
          <h2 id="sg">Your strategy</h2>
          <p className="name">{plan.strategy.name}</p>
          <p>{plan.strategy.explanation}</p>
        </section>

        <section className="move" aria-labelledby="ft">
          <h2 id="ft">Your first move this week</h2>
          <p>{plan.first_move}</p>
          <p className="t">About 15 minutes.</p>
        </section>

        <p className="prog" aria-live="polite">{count} of {stages.length} checkpoints reached</p>
        <p className="tip">Tap each checkpoint on the map to see what’s inside.</p>

        <div className={`map${won ? ' won' : ''}`}>
          <div className="pin"><span className="dot"></span><div><b>You are here</b><p>{plan.start}</p></div></div>
          <ol>
            {stages.map((s, k) => (
              <li key={k} className={`stage${k % 2 === 0 ? ' r' : ''}${seen[k] ? ' seen' : ''}${done[k] ? ' reached' : ''}`}>
                <Conn flip={k % 2 === 1} />
                <details open={open === k}>
                  <summary onClick={(e) => { e.preventDefault(); toggleStage(k); }}>
                    <span className="n">{done[k] ? '✓' : k + 1}</span>
                    <div className="sh"><h2 className="st">{s.title}</h2><span className="when">{s.timeframe}</span></div>
                  </summary>
                  <div className="body">
                    <div className="goal">
                      <p><b>Goal for this stage:</b> {s.goal}</p>
                      <p><b>Why we suggest this:</b> {s.why}</p>
                    </div>
                    {s.actions.map((t, j) => <p className="step" key={j}>{t}</p>)}
                    <p className="hurdle"><b>Likely hurdle:</b> {s.hurdle}</p>
                    <p className="ask">Ask someone who’s done it: {s.peer_question}</p>
                    <button type="button" className="askbtn" onClick={() => ask(s.peer_question)}>Ask a peer this</button>
                    <label className="flag">
                      <input type="checkbox" checked={!!done[k]} onChange={(e) => setDone({ ...done, [k]: e.target.checked })} />
                      <span><b>Checkpoint:</b> {s.checkpoint}</span>
                    </label>
                  </div>
                </details>
              </li>
            ))}
          </ol>
          <Conn on={won} />
          <div className="pin end"><span className="x">X</span><div><b>Your treasure</b><p>{won ? 'Treasure unlocked. Go get that role.' : `Your ${plan.destination.replace(/^your /i, '')}.`}</p></div></div>
        </div>
      </div>

      <section className="peer" id="peer">
        <div className="in">
          <h2>Talk to someone who’s been there</h2>
          <p className="diff">This is what makes us different from <span className="gpt">ChatGPT</span> and other AI models: we connect you with people on the same journey.</p>
          <p className="s">Leave your email and we’ll introduce you to a person who has faced the same hurdle.</p>
          <form onSubmit={request} noValidate>
            <label className="hid" htmlFor="e">Your email</label>
            <input id="e" type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button type="submit" className="go">Request a peer</button>
            <p className="note" role="status">{msg}</p>
          </form>
          <p className="note"><button type="button" className="linkbtn" onClick={() => router.push('/')}>Start again</button></p>
        </div>
      </section>
    </div>
  );
}
