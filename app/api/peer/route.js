// Peer requests are only written to the Vercel function logs for now (search for PEER_REQUEST).
// Replace the console.log with a database insert (for example Supabase) once you have real mentors.
export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid request.' }, { status: 400 }); }
  const email = String(body.email || '').trim().slice(0, 200);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: 'Enter a valid email address.' }, { status: 400 });
  console.log('PEER_REQUEST', JSON.stringify({
    email,
    goal: String(body.goal || '').slice(0, 300),
    hurdles: Array.isArray(body.hurdles) ? body.hurdles.slice(0, 8) : [],
    question: String(body.question || '').slice(0, 300),
    at: new Date().toISOString(),
  }));
  return Response.json({ ok: true });
}
