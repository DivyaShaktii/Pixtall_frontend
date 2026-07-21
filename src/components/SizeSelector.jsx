const SizeSelector = ({ sizes, value, onChange }) => (
  <div className="field stagger field-card">
    <label htmlFor="size">Output size</label>
    <p className="field-hint">Pick the output aspect ratio</p>
    <select id="size" value={value} onChange={event => onChange(event.target.value)}>
      <option value="">Select size</option>
      {sizes.map(size => (
        <option key={size.value} value={size.value}>
          {size.label}
        </option>
      ))}
    </select>
  </div>
);

export default SizeSelector;
