"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISSED_KEY = "atres:pwa-install-dismissed";

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (window.localStorage.getItem(DISMISSED_KEY) === "1") return;

    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (isIos && isSafari) {
      const timer = window.setTimeout(() => {
        setShowIosHint(true);
        setVisible(true);
      }, 1600);

      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  async function install() {
    if (!installEvent) return;

    await installEvent.prompt();
    const choice = await installEvent.userChoice;

    if (choice.outcome === "accepted") {
      setVisible(false);
      window.localStorage.setItem(DISMISSED_KEY, "1");
    }

    setInstallEvent(null);
  }

  function dismiss() {
    setVisible(false);
    window.localStorage.setItem(DISMISSED_KEY, "1");
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-md overflow-hidden rounded-[10px] bg-black text-white shadow-[0_24px_70px_rgba(0,0,0,0.35)] ring-1 ring-white/10 md:bottom-5">
      <div className="flex gap-3 p-4">
        <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-[10px] bg-white p-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png" alt="" className="h-full w-full object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black">Instala ATRES</p>
          <p className="mt-1 text-xs font-bold leading-5 text-white/70">
            {showIosHint
              ? "En iPhone toca Compartir y luego Agregar a pantalla de inicio."
              : "Agrega la tienda a tu pantalla de inicio para entrar mas rapido."}
          </p>
          <div className="mt-3 flex gap-2">
            {installEvent ? (
              <button onClick={install} className="rounded-full bg-white px-4 py-2 text-xs font-black text-black">
                Instalar
              </button>
            ) : null}
            <button onClick={dismiss} className="rounded-full bg-white/10 px-4 py-2 text-xs font-black text-white">
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
