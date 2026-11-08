export function bindEyedropper(button, { onPick, t, toast }) {
  if (!button) return;
  if (!("EyeDropper" in window) || !window.isSecureContext) {
    button.disabled = true;
    button.title = t("eyedropperUnavailable");
    return;
  }
  button.onclick = async () => {
    try {
      const { sRGBHex } = await new window.EyeDropper().open();
      onPick(sRGBHex.toUpperCase());
    } catch (error) {
      if (error.name !== "AbortError") toast(t("pickFailed"));
    }
  };
}
