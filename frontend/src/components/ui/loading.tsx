const Loading = ({ message = "" }: { message?: string }) => {
  return (
    <span className="px-3 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600 inline-flex items-center gap-2">
      <svg
        className="h-4 w-4 animate-spin text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
      {message}
    </span>
  );
};

export default Loading;
