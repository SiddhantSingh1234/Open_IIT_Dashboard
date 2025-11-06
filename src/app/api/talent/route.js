// app/api/talent/route.js
import { NextResponse } from "next/server";

function normalizeArray(x) {
  if (!x) return [];
  if (Array.isArray(x)) return x.filter(Boolean).map((s) => String(s).trim());
  return [String(x).trim()];
}

function buildTalentIndex(items) {
  const talents = new Map();

  for (const item of items) {
    const directors =
      item?.director && item.director !== "N/A"
        ? String(item.director)
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean)
        : [];
    const cast = normalizeArray(item?.cast);
    const genres = normalizeArray(item?.genres);
    const countries = normalizeArray(item?.country);
    const popularity = Number(item?.popularity) || 0;
    const rating = Number(item?.rating) || 0;
    const budget = Number(item?.budget) || 0;
    const revenue = Number(item?.revenue) || 0;

    for (const director of directors) {
      if (!talents.has(director)) {
        talents.set(director, {
          name: director,
          role: "Director",
          projects: [],
          genres: new Set(),
          countries: new Set(),
          collaborators: new Set(),
          totalRevenue: 0,
          totalBudget: 0,
          totalPopularity: 0,
          ratings: [],
        });
      }
      const t = talents.get(director);
      t.projects.push(item);
      t.totalRevenue += revenue;
      t.totalBudget += budget;
      t.totalPopularity += popularity;
      if (rating > 0) t.ratings.push(rating);
      for (const g of genres) t.genres.add(g);
      for (const c of countries) t.countries.add(c);
      for (const a of cast) t.collaborators.add(a);
    }

    for (const actor of cast) {
      if (!actor || actor === "N/A") continue;
      if (!talents.has(actor)) {
        talents.set(actor, {
          name: actor,
          role: "Actor",
          projects: [],
          genres: new Set(),
          countries: new Set(),
          collaborators: new Set(),
          totalRevenue: 0,
          totalBudget: 0,
          totalPopularity: 0,
          ratings: [],
        });
      }
      const t = talents.get(actor);
      t.projects.push(item);
      t.totalRevenue += revenue;
      t.totalBudget += budget;
      t.totalPopularity += popularity;
      if (rating > 0) t.ratings.push(rating);
      for (const g of genres) t.genres.add(g);
      for (const c of countries) t.countries.add(c);
      for (const d of directors) t.collaborators.add(d);
    }
  }

  const arr = [];
  for (const t of talents.values()) {
    const projectCount = t.projects.length;
    const avgRating = t.ratings.length
      ? Math.round(
          (t.ratings.reduce((a, b) => a + b, 0) / t.ratings.length) * 10
        ) / 10
      : 0;
    const moviesCount = t.projects.filter((p) => p?.type === "Movie").length;
    const tvShowsCount = t.projects.filter((p) => p?.type === "TV Show").length;
    const avgPopularity = projectCount ? t.totalPopularity / projectCount : 0;

    arr.push({
      ...t,
      projectCount,
      avgRating,
      avgPopularity,
      genres: Array.from(t.genres),
      countries: Array.from(t.countries),
      collaborators: Array.from(t.collaborators),
      moviesCount,
      tvShowsCount,
    });
  }
  return arr;
}

function computeGlobalStats(talentData) {
  const risingStars = talentData
    .filter((t) => t.projectCount >= 2 && t.projectCount <= 10)
    .sort((a, b) => b.avgPopularity - a.avgPopularity)
    .slice(0, 10);

  const collabMap = new Map();
  for (const t of talentData) {
    for (const collab of t.collaborators) {
      if (!collab || collab === t.name) continue;
      const key = [t.name, collab].sort().join("|||");
      const entry = collabMap.get(key) || {
        persons: [t.name, collab],
        count: 0,
      };
      entry.count += 1;
      collabMap.set(key, entry);
    }
  }
  const topCollaborations = Array.from(collabMap.values())
    .sort((x, y) => y.count - x.count)
    .slice(0, 15);

  const countryCounts = new Map();
  const genreCounts = new Map();
  for (const t of talentData) {
    for (const c of t.countries)
      countryCounts.set(c, (countryCounts.get(c) || 0) + 1);
    for (const g of t.genres) genreCounts.set(g, (genreCounts.get(g) || 0) + 1);
  }

  return {
    risingStars,
    topCollaborations,
    diversityMetrics: {
      totalCountries: countryCounts.size,
      totalGenres: genreCounts.size,
      topCountries: Array.from(countryCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      topGenres: Array.from(genreCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    },
  };
}

// Build a force-graph dataset (global), with safe limits
function buildNetwork(
  allTalent,
  { netLimit = 120, netMin = 2, role = "all", search = "" }
) {
  const q = search.trim().toLowerCase();

  // Prefer searched/role-matching talents, fill up with top project count
  let seed = allTalent
    .filter(
      (t) =>
        (role === "all" || t.role === role) &&
        (!q || t.name.toLowerCase().includes(q))
    )
    .sort((a, b) => b.projectCount - a.projectCount);

  if (seed.length < netLimit) {
    const extras = allTalent
      .filter((t) => (role === "all" || t.role === role) && !seed.includes(t))
      .sort((a, b) => b.projectCount - a.projectCount);
    seed = seed.concat(extras).slice(0, netLimit);
  } else {
    seed = seed.slice(0, netLimit);
  }

  const idSet = new Set(seed.map((t) => t.name));
  const linkMap = new Map();

  for (const t of seed) {
    for (const c of t.collaborators) {
      if (!idSet.has(c)) continue;
      const key = [t.name, c].sort().join("|||");
      const entry = linkMap.get(key) || { source: t.name, target: c, count: 0 };
      entry.count += 1;
      linkMap.set(key, entry);
    }
  }

  const links = Array.from(linkMap.values()).filter((l) => l.count >= netMin);
  const nodes = seed.map((t) => ({
    id: t.name,
    ...t, // include full talent object so your modal works from network clicks
  }));

  return { nodes, links };
}

function applyFiltersAndSort(
  talentData,
  { search, role, minProjects, sortBy }
) {
  const s = (search || "").toLowerCase();
  let filtered = talentData.filter((t) => {
    const matchesSearch = s ? t.name.toLowerCase().includes(s) : true;
    const matchesRole = role === "all" || t.role === role;
    const matchesMin = t.projectCount >= (minProjects || 1);
    return matchesSearch && matchesRole && matchesMin;
  });

  switch (sortBy) {
    case "projects":
      filtered.sort((a, b) => b.projectCount - a.projectCount);
      break;
    case "rating":
      filtered.sort((a, b) => b.avgRating - a.avgRating);
      break;
    case "revenue":
      filtered.sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0));
      break;
    case "popularity":
      filtered.sort((a, b) => (b.avgPopularity || 0) - (a.avgPopularity || 0));
      break;
    case "name":
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  return filtered;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      60,
      Math.max(6, parseInt(searchParams.get("pageSize") || "12", 10))
    );
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "all";
    const minProjects = parseInt(searchParams.get("minProjects") || "1", 10);
    const sortBy = searchParams.get("sortBy") || "projects";

    // network params
    const netLimit = Math.min(
      250,
      Math.max(30, parseInt(searchParams.get("netLimit") || "120", 10))
    );
    const netMin = Math.min(
      10,
      Math.max(1, parseInt(searchParams.get("netMin") || "2", 10))
    );

    // Load full content
    const contentUrl = new URL("/api/content?pageSize=5000", req.url);
    const contentRes = await fetch(contentUrl, { cache: "no-store" });
    if (!contentRes.ok) {
      return NextResponse.json(
        { error: `Upstream content error: ${contentRes.status}` },
        { status: 500 }
      );
    }
    const contentJson = await contentRes.json();
    const items = contentJson?.items || [];

    const allTalent = buildTalentIndex(items);
    const { risingStars, topCollaborations, diversityMetrics } =
      computeGlobalStats(allTalent);

    // Filter/sort + paginate for grid
    const filtered = applyFiltersAndSort(allTalent, {
      search,
      role,
      minProjects,
      sortBy,
    });
    const totalCount = filtered.length;
    const start = (page - 1) * pageSize;
    const pageItems = filtered.slice(start, start + pageSize);

    // Global network (optionally seeded by search/role)
    const network = buildNetwork(allTalent, { netLimit, netMin, role, search });

    return NextResponse.json({
      items: pageItems,
      totalCount,
      risingStars,
      topCollaborations,
      diversityMetrics,
      network,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Server error: ${err?.message || String(err)}` },
      { status: 500 }
    );
  }
}
