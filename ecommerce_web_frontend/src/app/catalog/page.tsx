"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listProducts } from "@/lib/apiClient";
import { useI18n } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/models";
import { Button, Pill, ProductCard } from "@/components/ui";

export default function CatalogPage() {
  const { t, locale } = useI18n();
  const { currency, convert, format } = useCurrency();
  const { addItem } = useCart();

  const [products, setProducts] = useState<Product[] | null>(null);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await listProducts();
      if (!cancelled) setProducts(res.ok ? res.data : []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const p of products ?? []) p.tags.forEach((x) => set.add(x));
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (products ?? []).filter((p) => {
      const name = p.name[locale].toLowerCase();
      const desc = p.description[locale].toLowerCase();
      const qOk =
        !q ||
        name.includes(q) ||
        desc.includes(q) ||
        p.sku.toLowerCase().includes(q);
      const tagOk = !tag || p.tags.includes(tag);
      return qOk && tagOk;
    });
  }, [products, query, tag, locale]);

  return (
    <main className="container-page flex flex-col gap-4">
      <section className="card">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h1 className="text-xl font-semibold">{t("catalog.title")}</h1>
            <Link className="text-sm underline" href="/">
              Home
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <label className="flex-1">
              <span className="sr-only">{t("catalog.searchPlaceholder")}</span>
              <input
                className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2"
                placeholder={t("catalog.searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>

            <label className="flex items-center gap-2 text-sm">
              <span className="muted">{t("catalog.filters")}</span>
              <select
                className="rounded-md border border-[var(--border)] bg-white px-2 py-2"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              >
                <option value="">All</option>
                {tags.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </label>

            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                setTag("");
              }}
            >
              Reset
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Pill>Locale: {locale.toUpperCase()}</Pill>
            <Pill>Currency: {currency}</Pill>
            <Pill>Results: {filtered.length}</Pill>
          </div>
        </div>
      </section>

      {!products ? (
        <p className="muted">{t("common.loading")}</p>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => {
            const price = format(convert(p.price, currency));
            return (
              <div key={p.id} className="flex flex-col gap-2">
                <Link className="text-sm underline" href={`/product/${p.id}`}>
                  View details
                </Link>
                <ProductCard
                  product={p}
                  priceLabel={price}
                  onAddToCart={() => addItem(p.id, 1)}
                />
              </div>
            );
          })}
        </section>
      )}
    </main>
  );
}
