export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="empty-state"><span>◇</span><strong>{title}</strong><p>{description}</p></div>
}
