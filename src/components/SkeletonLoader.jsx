export default function SkeletonLoader({ count = 1, className = '' }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse bg-primary-200 rounded-lg h-20 mb-4"
        />
      ))}
    </div>
  )
}

