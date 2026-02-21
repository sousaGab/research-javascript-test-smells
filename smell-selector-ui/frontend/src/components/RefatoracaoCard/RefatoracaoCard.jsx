import './RefatoracaoCard.css';

function Badge({ value, trueLabel = 'Yes', falseLabel = 'No' }) {
  if (value === null || value === undefined) return <span className="badge badge-unknown">-</span>;
  return value
    ? <span className="badge badge-success">{trueLabel}</span>
    : <span className="badge badge-danger">{falseLabel}</span>;
}

export function RefatoracaoCard({ experiment, isSelected, onClick }) {
  const modelLabel = experiment.ai_model_version
    ? `${experiment.ai_tool} / ${experiment.ai_model_version}`
    : experiment.ai_tool || '—';

  const fileParts = experiment.file_path ? experiment.file_path.split('/') : [];
  const shortFile = fileParts.slice(-2).join('/');

  return (
    <div
      className={`refatoracao-card${isSelected ? ' refatoracao-card-selected' : ''}`}
      onClick={onClick}
    >
      <div className="rc-header">
        <span className="rc-id">#{experiment.id}</span>
        <span className="rc-smell-type">{experiment.smell_type || '—'}</span>
      </div>

      <div className="rc-meta">
        <span className="rc-repo" title={experiment.repository}>{experiment.repository}</span>
        <span className="rc-file" title={experiment.file_path}>{shortFile}</span>
      </div>

      <div className="rc-model">
        <span className="rc-model-label">{modelLabel}</span>
        {experiment.prompting_approach && (
          <span className="rc-approach">{experiment.prompting_approach}</span>
        )}
      </div>

      <div className="rc-badges">
        <span className="rc-badge-group">
          <span className="rc-badge-label">smell</span>
          <Badge value={experiment.smell_removed} trueLabel="removed" falseLabel="kept" />
        </span>
        <span className="rc-badge-group">
          <span className="rc-badge-label">tests</span>
          <Badge value={experiment.tests_still_passing} trueLabel="ok" falseLabel="failed" />
        </span>
        <span className="rc-badge-group">
          <span className="rc-badge-label">coverage</span>
          <Badge value={experiment.coverage_changed} trueLabel="changed" falseLabel="unchanged" />
        </span>
        <span className="rc-badge-group">
          <span className="rc-badge-label">cov. regr.</span>
          <Badge value={experiment.coverage_decreased} trueLabel="yes" falseLabel="no" />
        </span>
        <span className="rc-badge-group">
          <span className="rc-badge-label">test regr.</span>
          <Badge value={experiment.tests_pass_rate_decreased} trueLabel="yes" falseLabel="no" />
        </span>
      </div>
    </div>
  );
}
