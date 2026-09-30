import {
  getCategories,
  getDepartments,
  getServiceTypes,
  getZones,
} from "@/lib/server-api";

/**
 * The numbers under the hero.
 *
 * Every one of them is counted from the records the app runs on — wards from
 * the zone directory, categories from the routing table — because the only
 * honest number on a civic site is one you can go and check. There is no
 * "10,000 happy citizens" here and there will not be: a statistic nobody can
 * verify is worth less than no statistic, and on a government service it is
 * worse than that.
 *
 * The whole band disappears if the directory is unreachable. A row of zeros
 * says something false; nothing says nothing.
 */
export async function CoverageStats() {
  const [zones, departments, categories, services] = await Promise.all([
    getZones(),
    getDepartments(),
    getCategories(),
    getServiceTypes(),
  ]);

  const stats = [
    {
      value: zones.reduce((total, zone) => total + zone.wards.length, 0),
      label: "wards covered",
    },
    { value: departments.length, label: "departments taking reports" },
    { value: categories.length, label: "complaint categories" },
    { value: services.length, label: "services you can apply for" },
  ].filter((stat) => stat.value > 0);

  if (stats.length < 2) return null;

  return (
    <section
      aria-label="What CityCare covers"
      className="border-b border-border bg-card/40"
    >
      <dl className="page-shell cc-stagger grid grid-cols-2 gap-x-6 gap-y-8 py-10 lg:grid-cols-4 lg:py-12">
        {stats.map((stat) => (
          <div key={stat.label} className="space-y-1">
            {/* tabular-nums so the figures sit on a common width — a column of
                numbers that shifts as it counts reads as an accident. */}
            <dd className="font-heading text-3xl font-semibold tracking-tight tabular-nums lg:text-4xl">
              {stat.value}
            </dd>
            <dt className="text-sm text-muted-foreground">{stat.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
