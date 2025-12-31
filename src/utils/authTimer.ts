let logoutTimer: ReturnType<typeof setTimeout> | null = null;

// 30 mins
const TIMEOUT = 30 * 60 * 1000; // 1800000 ms

export function startInactivityTimer(onTimeout: () => void) {
  resetInactivityTimer(onTimeout);

  // Listen to user activity
  window.addEventListener("mousemove", () => resetInactivityTimer(onTimeout));
  window.addEventListener("keydown", () => resetInactivityTimer(onTimeout));
  window.addEventListener("click", () => resetInactivityTimer(onTimeout));
}

export function resetInactivityTimer(onTimeout: () => void) {
  if (logoutTimer) clearTimeout(logoutTimer);

  logoutTimer = setTimeout(() => {
    onTimeout();
  }, TIMEOUT);
}
