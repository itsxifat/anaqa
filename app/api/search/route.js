import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

// Levenshtein distance for fuzzy matching when text search yields no results
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
  const skip = (page - 1) * limit;

  if (!q || q.length < 1) {
    return NextResponse.json({ products: [], total: 0, query: q });
  }

  await connectDB();

  // Strategy 1: MongoDB $text search (uses the text index — fast, ranked by relevance)
  let products = [];
  let total = 0;

  try {
    const textFilter = { $text: { $search: q } };
    [products, total] = await Promise.all([
      Product.find(textFilter, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .populate('category', 'name slug')
        .lean(),
      Product.countDocuments(textFilter),
    ]);
  } catch {
    // Text index may not exist yet (first deploy) — fall through to regex
  }

  // Strategy 2: Regex fallback — handles partial matches the text index misses
  if (products.length === 0) {
    const words = q.split(/\s+/).filter(Boolean);
    const regexParts = words.map(w => `(?=.*${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`).join('');
    const regexFilter = { name: { $regex: regexParts, $options: 'i' } };

    [products, total] = await Promise.all([
      Product.find(regexFilter)
        .sort({ views: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('category', 'name slug')
        .lean(),
      Product.countDocuments(regexFilter),
    ]);
  }

  // Strategy 3: Fuzzy fallback — user typed something wrong, find the nearest match
  if (products.length === 0) {
    // Load a sample of product names and score by edit distance
    const allNames = await Product.find({}, { name: 1, _id: 1 })
      .lean()
      .limit(500);

    const qLower = q.toLowerCase();
    const scored = allNames
      .map(p => ({
        id: p._id,
        name: p.name,
        dist: levenshtein(qLower, p.name.toLowerCase().slice(0, qLower.length + 4)),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, limit);

    const fuzzyIds = scored.map(s => s.id);
    if (fuzzyIds.length > 0) {
      products = await Product.find({ _id: { $in: fuzzyIds } })
        .populate('category', 'name slug')
        .lean();

      // Re-sort by original edit distance order
      const idOrder = Object.fromEntries(fuzzyIds.map((id, i) => [id.toString(), i]));
      products.sort((a, b) => (idOrder[a._id.toString()] ?? 99) - (idOrder[b._id.toString()] ?? 99));
      total = products.length;
    }
  }

  const serialized = JSON.parse(JSON.stringify(products));

  return NextResponse.json({
    products: serialized,
    total,
    page,
    pages: Math.ceil(total / limit),
    query: q,
  });
}
