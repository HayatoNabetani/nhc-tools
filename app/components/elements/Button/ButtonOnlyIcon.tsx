const ButtonOnlyIcon = () => {
  return (
    <button
      type="button"
      className="inline-flex justify-center items-center p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100"
    >
      <svg
        className="w-4 h-4"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 12 20"
      >
        <path
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M1 6v8a5 5 0 1 0 10 0V4.5a3.5 3.5 0 1 0-7 0V13a2 2 0 0 0 4 0V6"
        />
      </svg>
      <span className="sr-only">Attach file</span>
    </button>
  );
};

export default ButtonOnlyIcon;
