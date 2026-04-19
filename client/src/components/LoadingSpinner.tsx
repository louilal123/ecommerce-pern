export default function LoadingSpinner() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="relative">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200"></div>
        <div className="absolute left-0 top-0 h-16 w-16 animate-spin rounded-full border-4 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent"></div>
      </div>
      <p className="mt-4 text-sm font-medium text-gray-500">Loading...</p>
    </div>
  );
}