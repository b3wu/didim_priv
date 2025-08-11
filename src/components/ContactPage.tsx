import React, { useState } from "react";
export default function ContactPage({ goHome }: { goHome: () => void }) {
  const [name, setName] = useState(""), [email, setEmail] = useState(""), [subject, setSubject] = useState(""), [message, setMessage] = useState("");
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(null); const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setStatus(null);
    try { const res = await fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,subject,message})}); const data = await res.json();
      setStatus(data.ok ? {ok:true,msg:"Wiadomość wysłana."}:{ok:false,msg:data.error||"Nie udało się wysłać."}); }
    catch { setStatus({ok:false,msg:"Błąd połączenia."}); } finally { setLoading(false); }
  }
  return (<div className="min-h-screen bg-[#0B0F14] text-white">
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B0F14]/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3"><img src="/logo.svg" className="h-9 w-9" alt="Bewu3D" /><span className="text-lg font-semibold">Bewu3D</span></div>
        <button onClick={goHome} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">← Powrót</button>
      </div>
    </header>
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Zadaj pytanie</h1>
      <form onSubmit={submit} className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div><label className="text-sm text-white/80">Imię</label><input value={name} onChange={e=>setName(e.target.value)} required className="mt-2 w-full rounded-xl border border-white/10 bg-[#0B0F14] p-3 text-sm"/></div>
        <div><label className="text-sm text-white/80">E-mail</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="mt-2 w-full rounded-xl border border-white/10 bg-[#0B0F14] p-3 text-sm"/></div>
        <div><label className="text-sm text-white/80">Temat</label><input value={subject} onChange={e=>setSubject(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0B0F14] p-3 text-sm"/></div>
        <div><label className="text-sm text-white/80">Wiadomość</label><textarea value={message} onChange={e=>setMessage(e.target.value)} required rows={6} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0B0F14] p-3 text-sm"/></div>
        <div className="flex items-center gap-3"><button disabled={loading} className="rounded-xl bg-gradient-to-r from-[#36F3D6] to-[#00A3FF] px-4 py-2 text-sm font-semibold text-[#0B0F14]">{loading?"Wysyłanie...":"Wyślij"}</button>{status && (<span className={status.ok?"text-emerald-300 text-sm":"text-rose-300 text-sm"}>{status.msg}</span>)}</div>
      </form>
    </main></div>);
}
