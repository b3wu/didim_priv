import React from "react";
export default function ThanksPage({ goHome }: { goHome: () => void }) {
  return (<div className="min-h-screen bg-[#0B0F14] text-white flex items-center justify-center px-4">
    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
      <img src="/logo.svg" className="mx-auto h-12 w-12 mb-4" alt="Bewu3D" />
      <h1 className="text-2xl font-semibold">Dziękujemy za wiadomość!</h1>
      <p className="mt-2 text-sm text-white/70">Twoja prośba o wycenę została wysłana. Odezwiemy się możliwie szybko.</p>
      <button onClick={goHome} className="mt-6 rounded-xl bg-gradient-to-r from-[#36F3D6] to-[#00A3FF] px-5 py-2 text-sm font-semibold text-[#0B0F14]">Wróć na stronę główną</button>
    </div>
  </div>);
}
