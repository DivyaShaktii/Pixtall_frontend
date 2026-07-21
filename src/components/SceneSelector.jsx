const SceneSelector = ({ scenes, value, onChange }) => (
  <div className="field stagger field-card">
    <label htmlFor="scene">Scene</label>
    <p className="field-hint">Set the visual background environment</p>
    <select id="scene" value={value} onChange={event => onChange(event.target.value)}>
      <option value="">Select scene</option>
      {scenes.map(scene => (
        <option key={scene.value} value={scene.value}>
          {scene.label}
        </option>
      ))}
    </select>
  </div>
);

export default SceneSelector;
