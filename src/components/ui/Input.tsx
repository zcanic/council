interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`
          block w-full rounded-md border px-3 py-2 text-sm transition-colors
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
