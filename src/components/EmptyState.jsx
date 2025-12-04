export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  illustration,
  suggestions = []
}) {
  return (
    <div className="card text-center py-12">
      {illustration && (
        <div className="mb-6">{illustration}</div>
      )}
      {Icon && (
        <Icon className="w-16 h-16 text-primary-300 mx-auto mb-4" />
      )}
      <h3 className="text-xl font-semibold text-primary-900 mb-2">{title}</h3>
      <p className="text-primary-600 mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <div className="mb-6">{action}</div>
      )}
      {suggestions.length > 0 && (
        <div className="mt-6 text-left max-w-md mx-auto">
          <p className="text-sm font-medium text-primary-700 mb-2">Try:</p>
          <ul className="text-sm text-primary-600 space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

