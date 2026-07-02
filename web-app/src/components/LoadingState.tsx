export function LoadingState({ label = 'Loading from Firestore…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-10">
      <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      <p className="text-sm text-text-muted">{label}</p>
    </div>
  )
}
