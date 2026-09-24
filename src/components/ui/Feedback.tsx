export function Feedback({ message, tone = "success" }: { message: string; tone?: "success" | "error" }) {
  return message ? <div className={`feedback-banner ${tone}`} role="status">{message}</div> : null
}
