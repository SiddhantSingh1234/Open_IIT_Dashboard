// app/api/content/route.js
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs"; // ensure Node runtime so fs works

function toArray(v) {
  if (Array.isArray(v)) return v.filter(Boolean).map((s) => String(s).trim());
  if (typeof v === "string" && v.trim()) {
    return v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function decodePossiblyUnicode(buffer) {
  if (buffer.length >= 2) {
    const b0 = buffer[0];
    const b1 = buffer[1];
    if (b0 === 0xff && b1 === 0xfe)
      return new TextDecoder("utf-16le").decode(buffer);
    if (b0 === 0xfe && b1 === 0xff)
      return new TextDecoder("utf-16be").decode(buffer);
  }
  return new TextDecoder("utf-8").decode(buffer); // also handles UTF-8 BOM
}

async function readMovies() {
  const filePath = path.join(process.cwd(), "public", "movies.json");
  const buf = await fs.readFile(filePath);
  let text = decodePossiblyUnicode(buf)
    .replace(/^\uFEFF/, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    // NDJSON fallback
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("//"));
    parsed = lines.map((l) => JSON.parse(l));
  }

  const arr = Array.isArray(parsed) ? parsed : [parsed];
  return normalize(arr);
}

function normalize(items) {
  return items.map((item) => {
    const ratingNum =
      typeof item?.vote_average === "number"
        ? item.vote_average
        : typeof item?.rating === "number"
        ? item.rating
        : parseFloat(String(item?.vote_average ?? item?.rating ?? "")) || 0;

    const releaseYear =
      typeof item?.release_year === "number"
        ? item.release_year
        : parseInt(String(item?.release_year ?? "")) || undefined;

    const popularity =
      typeof item?.popularity === "number"
        ? item.popularity
        : parseFloat(String(item?.popularity ?? "")) || undefined;

    const revenue =
      typeof item?.revenue === "number"
        ? item.revenue
        : parseFloat(String(item?.revenue ?? "")) || undefined;

    const budget =
      typeof item?.budget === "number"
        ? item.budget
        : parseFloat(String(item?.budget ?? "")) || undefined;

    const language =
      (typeof item?.language === "string" && item.language) ||
      (Array.isArray(item?.languages) ? item.languages[0] : "N/A");

    return {
      ...item,
      show_id: item?.show_id ?? randomUUID(),
      title: item?.title ?? "N/A",
      type: item?.type ?? "Movie",
      director: item?.director ?? "N/A",
      cast: toArray(item?.cast ?? []),
      country: toArray(item?.country ?? []),
      genres: toArray(item?.genres ?? item?.listed_in ?? []),
      language,
      rating: ratingNum,
      popularity,
      revenue,
      budget,
      release_year: releaseYear,
      description: item?.description ?? "",
    };
  });
}

function stringContains(hay, needle) {
  return hay.toLowerCase().includes(needle.toLowerCase());
}

function applyFilters(data, params) {
  const q = params.get("q")?.trim() ?? "";
  const type = params.get("type") ?? "all";
  const country = params.get("country") ?? "all";
  const genre = params.get("genre") ?? "all";
  const language = params.get("language") ?? "all";
  const yearMin = parseInt(params.get("yearMin") ?? "1900");
  const yearMax = parseInt(params.get("yearMax") ?? "2024");
  const ratingMin = parseFloat(params.get("ratingMin") ?? "0");
  const ratingMax = parseFloat(params.get("ratingMax") ?? "10");

  return data.filter((item) => {
    const matchesSearch =
      !q ||
      (item.title && stringContains(item.title, q)) ||
      (item.description && stringContains(item.description, q)) ||
      (item.director && stringContains(item.director, q)) ||
      (Array.isArray(item.cast) && item.cast.some((c) => stringContains(c, q)));

    const matchesType = type === "all" || item.type === type;
    const matchesCountry =
      country === "all" ||
      (Array.isArray(item.country) && item.country.includes(country));
    const matchesGenre =
      genre === "all" ||
      (Array.isArray(item.genres) && item.genres.includes(genre));
    const matchesLanguage = language === "all" || item.language === language;

    const yr = item.release_year ?? 0;
    const matchesYear = yr >= yearMin && yr <= yearMax;

    const rt = typeof item.rating === "number" ? item.rating : 0;
    const matchesRating = rt >= ratingMin && rt <= ratingMax;

    return (
      matchesSearch &&
      matchesType &&
      matchesCountry &&
      matchesGenre &&
      matchesLanguage &&
      matchesYear &&
      matchesRating
    );
  });
}

function applySort(data, sortBy, sortOrder) {
  const asc = sortOrder !== "desc";
  const cmp = (a, b) => (a > b ? 1 : a < b ? -1 : 0);

  data.sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case "release_year":
        aVal = a.release_year ?? 0;
        bVal = b.release_year ?? 0;
        break;
      case "date_added":
        aVal = a.date_added ? new Date(a.date_added).getTime() : 0;
        bVal = b.date_added ? new Date(b.date_added).getTime() : 0;
        break;
      case "rating":
        aVal = a.rating ?? 0;
        bVal = b.rating ?? 0;
        break;
      case "popularity":
        aVal = a.popularity ?? 0;
        bVal = b.popularity ?? 0;
        break;
      case "revenue":
        aVal = a.revenue ?? 0;
        bVal = b.revenue ?? 0;
        break;
      case "title":
      default:
        aVal = String(a.title ?? "").toLowerCase();
        bVal = String(b.title ?? "").toLowerCase();
    }
    return asc ? cmp(aVal, bVal) : -cmp(aVal, bVal);
  });
}

function buildFacets(all) {
  const countries = new Set();
  const genres = new Set();
  const languages = new Set();
  for (const it of all) {
    (it.country || []).forEach((c) => countries.add(c));
    (it.genres || []).forEach((g) => genres.add(g));
    if (it.language) languages.add(it.language);
  }
  return {
    countries: Array.from(countries).sort(),
    genres: Array.from(genres).sort(),
    languages: Array.from(languages).sort(),
  };
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const params = url.searchParams;

    const page = Math.max(1, parseInt(params.get("page") ?? "1"));
    const pageSize = Math.min(
      500,
      Math.max(1, parseInt(params.get("pageSize") ?? "50"))
    );
    const sortBy = params.get("sortBy") ?? "title";
    const sortOrder = params.get("sortOrder") ?? "asc";
    const doExport = params.get("export") === "1";

    const all = await readMovies();
    const facets = buildFacets(all);

    const filtered = applyFilters(all, params);
    applySort(filtered, sortBy, sortOrder);

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = doExport ? filtered : filtered.slice(start, end);

    return NextResponse.json(
      {
        meta: {
          total,
          page,
          pageSize,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
        facets,
        items,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}
