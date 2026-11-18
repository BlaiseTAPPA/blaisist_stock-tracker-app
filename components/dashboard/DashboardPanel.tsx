import { useId } from "react";

type DashboardPanelProps = {
  title: string;
  /** Link or button shown next to the title. */
  action?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Dashboard column: the title and its action are static, so they are part of
 * the first HTML chunk; `children` is usually a `<Suspense>` boundary. The
 * section is named by its visible heading, so the name is defined once.
 */
const DashboardPanel = ({ title, action, children }: DashboardPanelProps) => {
  const headingId = useId();

  return (
    <section className="flex flex-col gap-4" aria-labelledby={headingId}>
      {/* `min-h-11`: same height with or without a 44 px action, so headings align. */}
      <div className="flex min-h-11 items-center justify-between gap-4">
        <h2 id={headingId} className="text-xl font-bold text-gray-100">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
};

export default DashboardPanel;
