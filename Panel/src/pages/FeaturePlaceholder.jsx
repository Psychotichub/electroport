const FeaturePlaceholder = ({ title, description }) => {
  return (
    <section className="panel stack gap-md">
      <div>
        <p className="eyebrow">Coming soon</p>
        <h1 className="title">{title}</h1>
      </div>
      <p className="muted">{description}</p>
      <p className="muted">
        Wire this view to the existing Express endpoints to support data entry and reporting. The layout is ready for
        mobile, tablet, and desktop.
      </p>
    </section>
  )
}

export default FeaturePlaceholder

