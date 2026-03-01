"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listProducts } from "@/lib/apiClient";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { CurrencyProvider } from "@/lib/currency";
import { CartProvider } from "@/lib/cart";
import type { InventoryRow, Product } from "@/lib/models";
import { Button, Pill } from "@/components/ui";
import { log } from "@/lib/logger";

type Tab = "inventory" | "orders" | "social";

type OrderRow = {
  id: string;
  status: "pending" | "paid" | "shipped";
  customer: string;
  total: string;
};

const MOCK_ORDERS: OrderRow[] = [
  { id: "o_1001", status: "paid", customer: "alex@example.com", total: "USD 129.00" },
  { id: "o_1002", status: "pending", customer: "maria@example.com", total: "USD 39.50" },
  { id: "o_1003", status: "shipped", customer: "sam@example.com", total: "USD 89.99" },
];

function AdminPageInner() {
  const { t, locale } = useI18n();
  const [tab, setTab] = useState<Tab>("inventory");
  const [products, setProducts] = useState<Product[]>([]);
  const [inventoryEdits, setInventoryEdits] = useState<Record<string, number>>(
    {}
  );

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

  const inventory: InventoryRow[] = useMemo(() => {
    return products.map((p) => ({
      productId: p.id,
      sku: p.sku,
      name: p.name[locale],
      quantity: inventoryEdits[p.id] ?? p.inventory.quantity,
      inStock: (inventoryEdits[p.id] ?? p.inventory.quantity) > 0,
    }));
  }, [products, inventoryEdits, locale]);

  const saveInventoryStub = () => {
    log("info", "AdminFlow:saveInventory_stub", { edits: inventoryEdits });
    alert("Saved inventory (stub). Wire to backend inventory service.");
    setInventoryEdits({});
  };

  return (
    <main className="container-page flex flex-col gap-4">
      <section className="card">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-xl font-semibold">{t("admin.title")}</h1>
          <Link className="text-sm underline" href="/">
            Home
          </Link>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant={tab === "inventory" ? "primary" : "secondary"}
            onClick={() => setTab("inventory")}
          >
            {t("admin.inventory")}
          </Button>
          <Button
            variant={tab === "orders" ? "primary" : "secondary"}
            onClick={() => setTab("orders")}
          >
            {t("admin.orders")}
          </Button>
          <Button
            variant={tab === "social" ? "primary" : "secondary"}
            onClick={() => setTab("social")}
          >
            {t("admin.social")}
          </Button>
        </div>

        <p className="muted mt-3 text-sm">{t("admin.integrationsNote")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Pill>Locale: {locale.toUpperCase()}</Pill>
          <Pill>Role: admin (demo)</Pill>
          <Pill>Microfrontend-friendly routing (App Router)</Pill>
        </div>
      </section>

      {tab === "inventory" ? (
        <section className="card">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="font-semibold">{t("admin.inventory")}</h2>
            <Button
              onClick={saveInventoryStub}
              disabled={Object.keys(inventoryEdits).length === 0}
            >
              {t("common.save")}
            </Button>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="min-w-[700px] w-full border-collapse">
              <thead>
                <tr className="text-left text-sm muted">
                  <th className="py-2 border-b border-[var(--border)]">SKU</th>
                  <th className="py-2 border-b border-[var(--border)]">Name</th>
                  <th className="py-2 border-b border-[var(--border)]">
                    Quantity
                  </th>
                  <th className="py-2 border-b border-[var(--border)]">
                    In stock
                  </th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((row) => (
                  <tr key={row.productId} className="text-sm">
                    <td className="py-2 border-b border-[var(--border)]">
                      {row.sku}
                    </td>
                    <td className="py-2 border-b border-[var(--border)]">
                      {row.name}
                    </td>
                    <td className="py-2 border-b border-[var(--border)]">
                      <input
                        className="w-28 rounded-md border border-[var(--border)] bg-white px-2 py-1"
                        type="number"
                        min={0}
                        value={row.quantity}
                        onChange={(e) =>
                          setInventoryEdits((prev) => ({
                            ...prev,
                            [row.productId]: Math.max(
                              0,
                              Math.floor(Number(e.target.value) || 0)
                            ),
                          }))
                        }
                      />
                    </td>
                    <td className="py-2 border-b border-[var(--border)]">
                      {row.inStock ? (
                        <span className="text-[var(--success)] font-medium">
                          Yes
                        </span>
                      ) : (
                        <span className="text-[var(--danger)] font-medium">
                          No
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "orders" ? (
        <section className="card">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="font-semibold">{t("admin.orders")}</h2>
            <Button
              variant="secondary"
              onClick={() => alert("Export orders (stub). Wire to order service.")}
            >
              Export (stub)
            </Button>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="min-w-[700px] w-full border-collapse">
              <thead>
                <tr className="text-left text-sm muted">
                  <th className="py-2 border-b border-[var(--border)]">Order</th>
                  <th className="py-2 border-b border-[var(--border)]">
                    Status
                  </th>
                  <th className="py-2 border-b border-[var(--border)]">
                    Customer
                  </th>
                  <th className="py-2 border-b border-[var(--border)]">Total</th>
                  <th className="py-2 border-b border-[var(--border)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ORDERS.map((o) => (
                  <tr key={o.id} className="text-sm">
                    <td className="py-2 border-b border-[var(--border)]">
                      {o.id}
                    </td>
                    <td className="py-2 border-b border-[var(--border)]">
                      {o.status}
                    </td>
                    <td className="py-2 border-b border-[var(--border)]">
                      {o.customer}
                    </td>
                    <td className="py-2 border-b border-[var(--border)]">
                      {o.total}
                    </td>
                    <td className="py-2 border-b border-[var(--border)]">
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="ghost"
                          onClick={() => alert(`Mark ${o.id} as shipped (stub)`)}
                        >
                          Mark shipped
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => alert(`Refund ${o.id} (stub)`)}
                        >
                          Refund
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "social" ? (
        <section className="card">
          <h2 className="font-semibold">{t("admin.social")}</h2>
          <p className="muted mt-2 text-sm">
            Social media integrations are placeholders. Add OAuth + backend
            connectors for Instagram/TikTok/YouTube, and track attribution.
          </p>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="border border-[var(--border)] rounded-md p-3">
              <div className="font-semibold">Instagram (stub)</div>
              <p className="muted text-sm mt-1">Connect product catalog sync.</p>
              <Button
                variant="secondary"
                onClick={() => alert("Connect Instagram (stub)")}
              >
                Connect
              </Button>
            </div>
            <div className="border border-[var(--border)] rounded-md p-3">
              <div className="font-semibold">TikTok (stub)</div>
              <p className="muted text-sm mt-1">Enable social commerce feeds.</p>
              <Button
                variant="secondary"
                onClick={() => alert("Connect TikTok (stub)")}
              >
                Connect
              </Button>
            </div>
            <div className="border border-[var(--border)] rounded-md p-3">
              <div className="font-semibold">YouTube (stub)</div>
              <p className="muted text-sm mt-1">
                Affiliate links and campaigns.
              </p>
              <Button
                variant="secondary"
                onClick={() => alert("Connect YouTube (stub)")}
              >
                Connect
              </Button>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

export default function AdminPage() {
  return (
    <I18nProvider>
      <CurrencyProvider>
        <CartProvider>
          <AdminPageInner />
        </CartProvider>
      </CurrencyProvider>
    </I18nProvider>
  );
}
