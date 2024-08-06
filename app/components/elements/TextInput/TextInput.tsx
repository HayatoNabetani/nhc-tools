interface Props {
  id: string;
  textAreaLabel: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

const TextInput = ({
  id,
  textAreaLabel,
  placeholder,
  value,
  disabled,
  onChange,
}: Props) => {
  return (
    <div className="mb-6">
      <label
        htmlFor={id}
        className="block mb-2 text-sm font-medium text-gray-900"
      >
        {textAreaLabel}
      </label>
      <input
        id={id}
        type="search"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        className="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-md focus:ring-blue-500 focus:border-blue-500"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default TextInput;
