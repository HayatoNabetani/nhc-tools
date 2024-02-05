interface Props {
  id: string;
  textAreaLabel: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

const TextArea = ({
  id,
  textAreaLabel,
  placeholder,
  value,
  disabled,
  onChange,
}: Props) => {
  return (
    <div className="px-4 py-2 bg-white rounded-lg">
      <label htmlFor={id} className="sr-only">
        {textAreaLabel}
      </label>
      <textarea
        id={id}
        rows={12}
        className="w-full px-0 text-sm text-gray-900 bg-white border-0"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      ></textarea>
    </div>
  );
};

export default TextArea;
