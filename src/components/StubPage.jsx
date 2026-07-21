const StubPage = ({ title, description }) => (
  <div className="stub-page">
    <div className="stub-page-inner">
      <span className="stub-page-mark">◆</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  </div>
);

export default StubPage;