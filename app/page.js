'use client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  return (
    <div id="v-start" className="view on">
      <header className="top">
        <p className="logo" aria-label="AI Kazi"><span className="at">@</span>i kazi</p>
        <main>
          <h1><span>Plan your next career step.</span><span className="soft">Then talk to someone who’s taken it.</span></h1>
          <button type="button" id="go" onClick={() => router.push('/questions')}>Build my roadmap</button>
        </main>
      </header>
      <section className="about">
        <p className="word">kazi</p>
        <p className="ipa">/ˈka.zi/</p>
        <p className="pos">noun, Swahili</p>
        <p className="mean">work. The job you do, and the effort you put into it.</p>
        <p className="mission">@i kazi helps people create work they can build a life on, by showing the path and connecting them with people who’ve already walked it.</p>
      </section>
    </div>
  );
}
