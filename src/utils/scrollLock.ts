// Body-scroll lock shared by every full-screen overlay (Projects modal,
// CommandPalette). Reference-counted so nested/overlapping overlays don't
// release the lock out from under each other: the body only unlocks when the
// last holder lets go. `isScrollLocked()` is the canonical "is a modal up?"
// signal — App reads it to decide whether ⌘K may open the palette.
let lockCount = 0;

export function lockScroll(): void {
  lockCount += 1;
  document.body.style.overflow = "hidden";
}

export function unlockScroll(): void {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) document.body.style.overflow = "unset";
}

export function isScrollLocked(): boolean {
  return lockCount > 0;
}
