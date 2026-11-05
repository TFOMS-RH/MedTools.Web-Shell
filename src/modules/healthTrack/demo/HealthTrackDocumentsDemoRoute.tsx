import { useLayoutEffect, useRef } from "react";
import styles from "./styles.module.scss";

export default function HealthTrackDocumentsDemoRoute() {
  const ref = useRef<HTMLIFrameElement>(null);
  useLayoutEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    let resize: ResizeObserver | undefined;
    let mutations: MutationObserver | undefined;
    let restore: (() => void) | undefined;
    const release = () => { restore?.(); restore = undefined; frame.classList.remove(styles.modalFrame); };
    const observe = () => {
      resize?.disconnect(); mutations?.disconnect(); release();
      const body = frame.contentDocument?.body;
      const root = frame.contentDocument?.getElementById("root");
      if (!body || !root) return;
      const fit = () => {
        if (!restore) frame.style.height = Math.ceil(root.getBoundingClientRect().height) + "px";
      };
      const syncModal = () => {
        const open = body.style.overflow === "hidden" && Boolean(body.querySelector(".MuiDialog-root, .MuiDrawer-root"));
        if (open && !restore) {
          const overflow = document.body.style.overflow;
          const header = frame.closest("main")?.parentElement?.querySelector<HTMLElement>(":scope > header");
          const inert = header?.inert ?? false;
          document.body.style.overflow = "hidden";
          if (header) header.inert = true;
          restore = () => { document.body.style.overflow = overflow; if (header) header.inert = inert; };
          frame.classList.add(styles.modalFrame);
          frame.style.height = "100dvh";
        } else if (!open) { release(); fit(); }
      };
      resize = new ResizeObserver(fit);
      resize.observe(root);
      mutations = new MutationObserver(syncModal);
      mutations.observe(body, { childList: true, attributes: true, attributeFilter: ["style"] });
      fit(); syncModal();
    };
    frame.addEventListener("load", observe);
    observe();
    return () => { frame.removeEventListener("load", observe); resize?.disconnect(); mutations?.disconnect(); release(); };
  }, []);

  return import.meta.env.DEV ? (
    <iframe ref={ref} title="Превью HealthTrack — Документы и экспорт"
      className={styles.frame} src="/src/modules/healthTrack/demo/index.html" />
  ) : null;
}
