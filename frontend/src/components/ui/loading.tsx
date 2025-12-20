const Loading = ({ message = "" }: { message?: string }) => {
  return (
    <span className="text-xs font-medium rounded text-gray-600 inline-flex items-center gap-2">
      <div className="animate-spin rounded-full size-3 border-b-2 border-l-2 border-blue-600 mx-auto gap-3"></div>
      {message}
    </span>
  );
};

export default Loading;
