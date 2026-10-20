interface Props {
  id: string;
  textAreaLabel: string;
  placeholder: string;
  value: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}

const TextArea = ({
  id,
  textAreaLabel,
  placeholder,
  value,
  disabled = false,
  onChange,
}: Props) => {
  return (
    <div className="field-textarea">
      <label htmlFor={id} className="sr-only">
        {textAreaLabel}
      </label>
      <textarea
        id={id}
        rows={12}
        className="w-full"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        readOnly={!onChange}
        onChange={(e) => onChange?.(e.target.value)}
      ></textarea>
    </div>
  );
};

export default TextArea;
