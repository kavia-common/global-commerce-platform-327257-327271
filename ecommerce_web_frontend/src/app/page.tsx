"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { listProducts, getRecommendations } from "@/lib/apiClient";
import { useI18n } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/models";
import {
  Button,
  Pill,
  ProductCard,
  RecommendationCarousel,
} from "@/components/ui";

export default function Home() {
  const { t, locale } = useI18n();
  const { currency, convert, format } = useCurrency();
  const { addItem } = useCart();

  const [products, setProducts] = useState<Product[] | null>(null);
  const [recs, setRecs] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const p = await listProducts();
      if (!cancelled) setProducts(p.ok ? p.data : []);
      const r = await getRecommendations();
      if (!cancelled) setRecs(r.ok ? r.data.map((x) => x.productId) : []);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const featured = useMemo(() => (products ?? []).slice(0, 3), [products]);
  const recProducts = useMemo(() => {
    if (!products || !recs) return [];
    const set = new Set(recs);
    return products.filter((p) => set.has(p.id)).slice(0, 6);
  }, [products, recs]);

  return (
    <main className="container-page flex flex-col gap-6">
      <section className="card bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl sm:text-3xl font-semibold">
            {t("home.heroTitle")}
          </h1>
          <p className="muted">{t("home.heroSubtitle")}</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/catalog">
              <Button>{t("nav.shop")}</Button>
            </Link>
            <Link href="/cart">
              <Button variant="secondary">{t("nav.cart")}</Button>
            </Link>
            <Link href="/admin">
              <Button variant="ghost">{t("nav.admin")}</Button>
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill>i18n: {locale.toUpperCase()}</Pill>
            <Pill>currency: {currency}</Pill>
            <Pill>static export compatible</Pill>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">{t("catalog.title")}</h2>
        {!products ? (
          <p className="muted">{t("common.loading")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {featured.map((p) => {
              const price = format(convert(p.price, currency));
              return (
                <ProductCard
                  key={p.id}
                  product={p}
                  priceLabel={price}
                  onAddToCart={() => addItem(p.id, 1)}
                />
              );
            })}
          </div>
        )}
      </section>

      <RecommendationCarousel title={t("recommendations.title")}>
        {recProducts.length === 0 ? (
          <div className="muted text-sm">{t("common.loading")}</div>
        ) : (
          recProducts.map((p) => {
            const price = format(convert(p.price, currency));
            return (
              <div key={p.id} className="min-w-[260px]">
                <div className="card">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold">{p.name[locale]}</div>
                      <div className="text-sm muted">{price}</div>
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
            );
          })
        )}
      </RecommendationCarousel>
    </main>
  );
}
