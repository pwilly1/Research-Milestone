export function getStudyFeedback(minutes: number): string {
  if (minutes < 20) {
    return 'Quick review complete — a little progress still moves you forward.';
  }

  if (minutes < 45) {
    return 'Solid focus session — you gave this topic meaningful attention.';
  }

  if (minutes < 90) {
    return 'Deep work achieved — take a short break before your next session.';
  }

  return 'Major study block complete — recharge and let the material settle.';
}
