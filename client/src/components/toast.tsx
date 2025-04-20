interface ToastOptions {
  title: string;
  description: string;
  variant?: "default" | "destructive";
}

export function Toast({ toast }: { toast: ToastOptions | null }) {
  if (!toast) return null;

  const baseClasses = "fixed bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-sm z-50";
  const variantClasses = toast.variant === "destructive"
    ? "bg-red-500 text-white"
    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700";

  return (
    <div className={`${baseClasses} ${variantClasses}`}>
      <h3 className="font-semibold">{toast.title}</h3>
      <p className="text-sm opacity-90">{toast.description}</p>
    </div>
  );
} 