/**
 * Reading the API from a Server Component.
 *
 * The browser client in `api-client.ts` attaches a token from a cookie, which a
 * server render has no business doing. This is for the handful of endpoints
 * that are public — the taxonomy the marketing pages describe — so the copy on
 * those pages comes from the same records the app runs on rather than from a
 * constant that quietly drifts the first time an admin edits a category.
 *
 * Responses are revalidated rather than fetched per request: this data changes
 * when an administrator edits it, not per visitor.
 */
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

/** How long a taxonomy answer is reused before the API is asked again. */
const REVALIDATE_SECONDS = 300;

type Envelope<T> = { data?: { items?: T[] } | T[] };

/**
 * Returns an empty list rather than throwing. These pages are readable without
 * the taxonomy — a reader loses the ward directory, not the page — and a public
 * page that 500s because an unrelated service is down is the worse trade.
 */
export async function getPublicList<T>(path: string): Promise<T[]> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return [];

    const body = (await response.json()) as Envelope<T>;
    const data = body.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    return [];
  } catch {
    return [];
  }
}

export type PublicDepartment = {
  id: string;
  name: string;
  email: string | null;
};

export type PublicCategory = {
  id: string;
  name: string;
  slaHours: number;
  department: { id: string; name: string } | null;
};

export type PublicZone = {
  id: string;
  name: string;
  wards: { id: string; number: number; name: string }[];
};

export const getDepartments = () =>
  getPublicList<PublicDepartment>("/departments");

export const getCategories = () => getPublicList<PublicCategory>("/categories");

export const getZones = () => getPublicList<PublicZone>("/zones");

export type DepartmentWithCategories = PublicDepartment & {
  categories: { name: string; slaHours: number }[];
};

/**
 * Departments with the categories routed to them.
 *
 * Both public pages describe "who handles what", and deriving it here means the
 * two descriptions cannot drift apart — the earlier hardcoded copies managed to
 * disagree with each other inside a single commit.
 */
export async function getDepartmentsWithCategories(): Promise<
  DepartmentWithCategories[]
> {
  const [departments, categories] = await Promise.all([
    getDepartments(),
    getCategories(),
  ]);

  return departments.map((department) => ({
    ...department,
    categories: categories
      .filter((category) => category.department?.id === department.id)
      .map(({ name, slaHours }) => ({ name, slaHours })),
  }));
}

export type PublicServiceType = {
  id: string;
  name: string;
  fee: string | number;
  isActive: boolean;
};

export const getServiceTypes = () =>
  getPublicList<PublicServiceType>("/service-types");
