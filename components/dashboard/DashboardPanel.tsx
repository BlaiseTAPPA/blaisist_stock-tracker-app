type DashboardPanelProps = {
  title: string;
  /** Link or button shown next to the title. */
  action?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Dashboard column: the title and its action are static, so they are part of
 * the first HTML chunk; `children` is usually a `<Suspense>` boundary.
 */
const DashboardPanel = ({ title, action, children }: DashboardPanelProps) => (
  <section className="flex flex-col gap-4" aria-label={title}>
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-xl font-bold text-gray-100">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

export default DashboardPanel;
