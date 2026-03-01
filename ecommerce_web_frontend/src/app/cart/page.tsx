"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listProducts } from "@/lib/apiClient";
import { useI18n } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/models";
import { Button } from "@/components/ui";

export default function CartPage() {
  const { t, locale } = useI18n();
  const { currency, convert, format } = useCurrency();
  const { cart, updateQty, removeItem, clear, subtotalUSD } = useCart();

  const [products, setProducts] = useState<Product[]>([]);

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

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );

  const subtotal = useMemo(() => {
    const usd = subtotalUSD(products);
    const money = convert({ currency: "USD", amount: usd }, currency);
    return format(money);
  }, [products, subtotalUSD, currency, convert, format]);

  return (
    <main className="container-page flex flex-col gap-4">
      <section className="card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-xl font-semibold">{t("cart.title")}</h1>
          <div className="flex gap-2">
            <Link className="text-sm underline" href="/catalog">
              {t("nav.shop")}
            </Link>
            <Button
              variant="secondary"
              onClick={clear}
              disabled={cart.items.length === 0}
            >
              Clear
            </Button>
          </div>
        </div>

        {cart.items.length === 0 ? (
          <p className="muted mt-3">{t("cart.empty")}</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {cart.items.map((it) => {
              const p = productMap.get(it.productId);
              const name = p ? p.name[locale] : it.productId;
              const price = p ? format(convert(p.price, currency)) : "";
              return (
                <div
                  key={it.productId}
                  className="flex items-center justify-between gap-3 flex-wrap border border-[var(--border)] rounded-md p-3"
                >
                  <div>
                    <div className="font-semibold">{name}</div>
                    <div className="text-sm muted">{price}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label
                      className="text-sm muted"
                      htmlFor={`qty-${it.productId}`}
                    >
                      Qty
                    </label>
                    <input
                      id={`qty-${it.productId}`}
                      className="w-20 rounded-md border border-[var(--border)] bg-white px-2 py-2"
                      type="number"
                      min={1}
                      value={it.quantity}
                      onChange={(e) =>
                        updateQty(it.productId, Number(e.target.value) || 1)
                      }
                    />
                    <Button
                      variant="ghost"
                      onClick={() => removeItem(it.productId)}
                    >
                      Remove
                    </Button>
                    {p ? (
                      <Link className="text-sm underline" href={`/product/${p.id}`}>
                        View
                      </Link>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm muted">
            {t("cart.subtotal")}:{" "}
            <span className="font-semibold text-[var(--text)]">{subtotal}</span>
          </div>
          <Link href="/checkout">
            <Button disabled={cart.items.length === 0}>
              {t("cart.checkout")}
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
