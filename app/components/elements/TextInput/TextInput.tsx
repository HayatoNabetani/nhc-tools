interface Props {
  id: string;
  textAreaLabel: string;
  placeholder: string;
  value: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

const TextInput = ({
  id,
  textAreaLabel,
  placeholder,
  value,
  disabled = false,
  onChange,
}: Props) => {
  return (
    <div className="mb-6">
      <label htmlFor={id} className="field-label">
        {textAreaLabel}
      </label>
      <input
        id={id}
        type="text"
        aria-label={textAreaLabel || placeholder}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        readOnly={!onChange}
        className="field-input"
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
};

export default TextInput;
