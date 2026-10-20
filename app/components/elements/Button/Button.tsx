interface Props {
  text: string;
  handleClick: () => void;
}

const Button = ({ text, handleClick }: Props) => {
  return (
    <button type="button" className="primary-button" onClick={handleClick}>
      {text}
    </button>
  );
};

export default Button;
