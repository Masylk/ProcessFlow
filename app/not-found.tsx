export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800">404 - Not Found</h1>
      <p className="mt-4 text-gray-600">
        The page you're looking for doesn't exist.
      </p>
      <a 
        href="/" 
        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Return to Dashboard
      </a>
    </div>
  );
} 