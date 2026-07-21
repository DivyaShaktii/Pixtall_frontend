const GenerateButton = ({ onClick, label = "Generate images", disabled = false }) => (
  <button
    type="button"
    className="generate generate-primary"
    onClick={onClick}
    disabled={disabled}
  >
    {label}
  </button>
);

export default GenerateButton;