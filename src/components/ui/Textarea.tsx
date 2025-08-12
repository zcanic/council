interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        className={`
          block w-full rounded-md border px-3 py-2 text-sm transition-colors resize-vertical
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error 
            ? 'border-red-300 bg-red-50 placeholder-red-400 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 bg-white placeholder-gray-400 hover:border-gray-400'
          }
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
