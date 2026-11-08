let installPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  installPrompt = e;
});
export async function installApp(showInstructions) {
  if (
    matchMedia("(display-mode: standalone)").matches ||
    navigator.standalone
  ) {
    showInstructions(true);
    return;
  }
  if (installPrompt) {
    const prompt = installPrompt;
    installPrompt = null;
    await prompt.prompt();
    await prompt.userChoice;
  } else showInstructions(false);
}
export function registerApp(onUpdate) {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker
    .register("/sw.js")
    .then((reg) => {
      if (reg.waiting)
        onUpdate(() => reg.waiting.postMessage({ type: "SKIP_WAITING" }));
      reg.addEventListener("updatefound", () => {
        const worker = reg.installing;
        worker?.addEventListener("statechange", () => {
          if (
            worker.state === "installed" &&
            navigator.serviceWorker.controller
          )
            onUpdate(() => worker.postMessage({ type: "SKIP_WAITING" }));
        });
      });
    })
    .catch(() => {});
  const hadController = !!navigator.serviceWorker.controller;
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing || !hadController) return;
    refreshing = true;
    location.reload();
  });
}
