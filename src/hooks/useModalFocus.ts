import { useEffect, useRef } from "react";

const inertLocks = new Map<HTMLElement, { count: number; previous: boolean }>();
let scrollLocks = 0;
let previousOverflow = "";

/** Keep modal keyboard focus and restore the invoking control on dismissal. */
export function useModalFocus(isOpen: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const dialog = ref.current;
    if (!isOpen || !dialog) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const locked: HTMLElement[] = [];
    let branch: HTMLElement = dialog;
    while (branch.parentElement && branch !== document.body) {
      for (const sibling of branch.parentElement.children) {
        if (sibling === branch || !(sibling instanceof HTMLElement) || sibling.tagName === "SCRIPT") continue;
        const lock = inertLocks.get(sibling) ?? { count: 0, previous: sibling.inert };
        lock.count++;
        inertLocks.set(sibling, lock);
        sibling.inert = true;
        locked.push(sibling);
      }
      branch = branch.parentElement;
    }
    if (scrollLocks++ === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'
    )).filter(el => el.getClientRects().length > 0 && !el.closest("[inert]"));
    const frame = requestAnimationFrame(() => (focusable()[0] ?? dialog).focus({ preventScroll: true }));
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
      } else if (event.key === "Tab") {
        const targets = focusable();
        const first = targets[0];
        const last = targets[targets.length - 1];
        if (!first) { event.preventDefault(); dialog.focus(); }
        else if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
          event.preventDefault(); first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKey, true);
      for (const element of locked) {
        const lock = inertLocks.get(element);
        if (lock && --lock.count === 0) { element.inert = lock.previous; inertLocks.delete(element); }
      }
      if (--scrollLocks === 0) document.body.style.overflow = previousOverflow;
      if (opener?.isConnected && !opener.closest("[inert]")) opener.focus({ preventScroll: true });
    };
  }, [isOpen]);
  return ref;
}
