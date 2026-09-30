export function blurActiveElement(): void {
  try {
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  } catch (e) {
    // ignore
  }
}

function setInertOnContent(enable: boolean) {
  try {
    if (typeof document === 'undefined') return;
    const contents = Array.from(document.querySelectorAll('ion-content')) as Element[];
    contents.forEach((c) => {
      try {
        // Some browsers support the inert property; fallback to aria-hidden
        // Some browsers support the inert property; fallback to aria-hidden
        if ('inert' in c) {
          (c as any).inert = enable;
        } else {
          if (enable) (c as HTMLElement).setAttribute('aria-hidden', 'true');
          else (c as HTMLElement).removeAttribute('aria-hidden');
        }
      } catch (e) {
        // ignore per-element errors
      }
    });
  } catch (e) {
    // ignore
  }
}

export function enableBackgroundInert() {
  setInertOnContent(true);
}

export function disableBackgroundInert() {
  setInertOnContent(false);
}

export default {
  blurActiveElement,
  enableBackgroundInert,
  disableBackgroundInert,
};
