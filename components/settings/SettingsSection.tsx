import { useId } from "react";

/** One card of /settings, named by its visible heading. */
const SettingsSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-lg border border-gray-700 bg-gray-800 p-5 sm:p-6"
    >
      <h2 id={headingId} className="text-xl font-bold text-gray-100">
        {title}
      </h2>
      {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
};

export default SettingsSection;
