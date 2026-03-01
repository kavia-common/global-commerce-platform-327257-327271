"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getProduct, getRecommendations, listProducts } from "@/lib/apiClient";
import { useI18n } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/models";
import { Button, RecommendationCarousel } from "@/components/ui";

export default function ProductClient({ productId }: { productId: string }) {
  const { t, locale } = useI18n();
  const { currency, convert, format } = useCurrency();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [all, setAll] = useState<Product[]>([]);
  const [recs, setRecs] = useState<string[]>([]);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const p = await getProduct(productId);
      if (!cancelled) setProduct(p.ok ? p.data : null);

      const lp = await listProducts();
      if (!cancelled) setAll(lp.ok ? lp.data : []);

      const r = await getRecommendations(productId);
      if (!cancelled) setRecs(r.ok ? r.data.map((x) => x.productId) : []);
    })();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const priceLabel = useMemo(() => {
    if (!product) return "";
    return format(convert(product.price, currency));
  }, [product, currency, convert, format]);

  const recProducts = useMemo(() => {
    const set = new Set(recs);
    return all.filter((p) => set.has(p.id)).slice(0, 6);
  }, [all, recs]);

  if (!product) {
    return (
      <main className="container-page">
        <div className="card">
          <p className="muted">{t("common.loading")}</p>
          <Link className="text-sm underline" href="/catalog">
            Back to catalog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container-page flex flex-col gap-4">
      <section className="card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold">{product.name[locale]}</h1>
            <p className="muted text-sm">SKU: {product.sku}</p>
          </div>
          <Link className="text-sm underline" href="/catalog">
            Back to catalog
          </Link>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="aspect-[4/3] rounded-md border border-[var(--border)] bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center text-xs muted">
            Image placeholder
          </div>

          <div className="flex flex-col gap-3">
            <p className="muted">{product.description[locale]}</p>
            <div className="text-lg font-semibold">{priceLabel}</div>

            <div className="flex items-center gap-2">
              <label className="text-sm muted" htmlFor="qty">
                {t("product.quantity")}
              </label>
              <input
                id="qty"
                type="number"
                min={1}
                className="w-24 rounded-md border border-[var(--border)] bg-white px-2 py-2"
                value={qty}
                onChange={(e) =>
                  setQty(Math.max(1, Math.floor(Number(e.target.value) || 1)))
                }
              />
            </div>

            <Button
              onClick={() => addItem(product.id, qty)}
              disabled={!product.inventory.inStock}
            >
              {t("product.addToCart")}
            </Button>

            {!product.inventory.inStock ? (
              <p className="text-sm text-[var(--danger)]">Out of stock</p>
            ) : (
              <p className="text-sm muted">
                Available: {product.inventory.quantity}
              </p>
            )}
          </div>
        </div>
      </section>

      <RecommendationCarousel title={t("recommendations.title")}>
        {recProducts.map((p) => (
          <div key={p.id} className="min-w-[260px]">
            <div className="card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{p.name[locale]}</div>
                  <div className="text-sm muted">
                    {format(convert(p.price, currency))}
                  </div>
                </div>
                <Link className="text-sm underline" href={`/product/${p.id}`}>
                  View
                </Link>
              </div>
              <div className="mt-2">
                <Button onClick={() => addItem(p.id, 1)}>
                  {t("product.addToCart")}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </RecommendationCarousel>
    </main>
  );
}
