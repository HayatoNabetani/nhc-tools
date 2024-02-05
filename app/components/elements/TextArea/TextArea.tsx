const TextArea = () => {
  return (
    <div className="px-4 py-2 bg-white rounded-t-lg">
      <label htmlFor="comment" className="sr-only">
        Your comment
      </label>
      <textarea
        id="comment"
        rows={12}
        className="w-full px-0 text-sm text-gray-900 bg-white border-0"
        placeholder="jsonを貼り付ける"
        required
      ></textarea>
    </div>
  );
};

export default TextArea;
