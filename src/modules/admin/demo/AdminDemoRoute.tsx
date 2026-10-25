import { useLayoutEffect, useRef } from "react";
import { Navigate, useSearchParams } from "react-router";
import styles from "./frame.module.scss";

export default function AdminDemoRoute() {
  const [params] = useSearchParams();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const enabled = import.meta.env.DEV && params.get("demoWorkspace") === "1";

  useLayoutEffect(() => {
    if (!enabled) return;
    const frame = frameRef.current;
    const shell = frame?.closest("main")?.parentElement;
    if (!frame || !shell) return;
    shell.classList.add(styles.shell);
    const header = shell.querySelector<HTMLElement>(":scope > header");
    let observer: MutationObserver | undefined;
    let restore: (() => void) | undefined;

    const release = () => {
      restore?.();
      restore = undefined;
      frame.classList.remove(styles.modalFrame);
    };
    const observe = () => {
      observer?.disconnect();
      release();
      const body = frame.contentDocument?.body;
      if (!body) return;
      const sync = () => {
        const open =
          body.style.overflow === "hidden" &&
          body.querySelector(".MuiDialog-root") !== null;
        if (open && !restore) {
          const overflow = document.body.style.overflow;
          const headerInert = header?.inert ?? false;
          document.body.style.overflow = "hidden";
          if (header) header.inert = true;
          frame.classList.add(styles.modalFrame);
          restore = () => {
            document.body.style.overflow = overflow;
            if (header) header.inert = headerInert;
          };
        } else if (!open) release();
      };
      observer = new MutationObserver(sync);
      observer.observe(body, {
        childList: true,
        attributes: true,
        attributeFilter: ["style"],
      });
      sync();
    };
    frame.addEventListener("load", observe);
    observe();
    return () => {
      frame.removeEventListener("load", observe);
      observer?.disconnect();
      release();
      shell.classList.remove(styles.shell);
    };
  }, [enabled]);

  if (!enabled) {
    return <Navigate to="/admin/users" replace />;
  }
  return (
    <iframe
      ref={frameRef}
      className={styles.frame}
      title="Демонстрационная среда Admin"
      src="/src/modules/admin/demo/index.html"
    />
  );
}
