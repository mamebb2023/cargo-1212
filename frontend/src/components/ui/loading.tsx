const Loading = ({ message = "" }: { message?: string }) => {
  return (
    <span className="px-3 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600 inline-flex items-center gap-2">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-4"></div>
      {message}
    </span>
  );
};

export default Loading;
