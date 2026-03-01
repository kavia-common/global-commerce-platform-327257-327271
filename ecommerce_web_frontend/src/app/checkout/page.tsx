"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui";
import { log } from "@/lib/logger";

type PaymentProvider = "stub_stripe" | "stub_adyen" | "stub_paypal";

export default function CheckoutPage() {
  const { t } = useI18n();
  const { cart, clear } = useCart();

  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle"
  );
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    region: "",
    postal: "",
    country: "US",
    provider: "stub_stripe" as PaymentProvider,
  });

  const disabled = useMemo(
    () => cart.items.length === 0 || status === "submitting",
    [cart.items.length, status]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    // Payment gateway integration stub (client-side only for static export).
    // In production: send the draft order to backend, redirect to provider checkout.
    log("info", "CheckoutFlow:submit_stub", {
      email: form.email,
      provider: form.provider,
      cartItems: cart.items.length,
    });

    await new Promise((r) => setTimeout(r, 600));
    clear();
    setStatus("success");
  };

  return (
    <main className="container-page flex flex-col gap-4">
      <section className="card">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-semibold">{t("checkout.title")}</h1>
          <Link className="text-sm underline" href="/cart">
            {t("nav.cart")}
          </Link>
        </div>

        {status === "success" ? (
          <div className="mt-3">
            <p className="text-[var(--success)] font-semibold">
              {t("checkout.success")}
            </p>
            <div className="mt-2 flex gap-2">
              <Link href="/catalog">
                <Button>{t("nav.shop")}</Button>
              </Link>
              <Link href="/admin">
                <Button variant="secondary">{t("nav.admin")}</Button>
              </Link>
            </div>
          </div>
        ) : (
          <form
            className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3"
            onSubmit={onSubmit}
          >
            <label className="flex flex-col gap-1">
              <span className="text-sm muted">{t("checkout.email")}</span>
              <input
                className="rounded-md border border-[var(--border)] bg-white px-3 py-2"
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm muted">{t("checkout.name")}</span>
              <input
                className="rounded-md border border-[var(--border)] bg-white px-3 py-2"
                required
                value={form.fullName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fullName: e.target.value }))
                }
              />
            </label>

            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm muted">{t("checkout.address1")}</span>
              <input
                className="rounded-md border border-[var(--border)] bg-white px-3 py-2"
                required
                value={form.line1}
                onChange={(e) =>
                  setForm((f) => ({ ...f, line1: e.target.value }))
                }
              />
            </label>

            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm muted">{t("checkout.address2")}</span>
              <input
                className="rounded-md border border-[var(--border)] bg-white px-3 py-2"
                value={form.line2}
                onChange={(e) =>
                  setForm((f) => ({ ...f, line2: e.target.value }))
                }
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm muted">{t("checkout.city")}</span>
              <input
                className="rounded-md border border-[var(--border)] bg-white px-3 py-2"
                required
                value={form.city}
                onChange={(e) =>
                  setForm((f) => ({ ...f, city: e.target.value }))
                }
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm muted">{t("checkout.region")}</span>
              <input
                className="rounded-md border border-[var(--border)] bg-white px-3 py-2"
                value={form.region}
                onChange={(e) =>
                  setForm((f) => ({ ...f, region: e.target.value }))
                }
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm muted">{t("checkout.postal")}</span>
              <input
                className="rounded-md border border-[var(--border)] bg-white px-3 py-2"
                required
                value={form.postal}
                onChange={(e) =>
                  setForm((f) => ({ ...f, postal: e.target.value }))
                }
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm muted">{t("checkout.country")}</span>
              <input
                className="rounded-md border border-[var(--border)] bg-white px-3 py-2"
                required
                value={form.country}
                onChange={(e) =>
                  setForm((f) => ({ ...f, country: e.target.value }))
                }
              />
            </label>

            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm muted">
                {t("checkout.paymentProvider")}
              </span>
              <select
                className="rounded-md border border-[var(--border)] bg-white px-3 py-2"
                value={form.provider}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    provider: e.target.value as PaymentProvider,
                  }))
                }
              >
                <option value="stub_stripe">Stripe (stub)</option>
                <option value="stub_adyen">Adyen (stub)</option>
                <option value="stub_paypal">PayPal (stub)</option>
              </select>
            </label>

            <div className="md:col-span-2 flex items-center justify-between gap-3 flex-wrap mt-2">
              <p className="text-sm muted">Items in cart: {cart.items.length}</p>
              <Button type="submit" disabled={disabled}>
                {status === "submitting"
                  ? t("common.loading")
                  : t("checkout.placeOrder")}
              </Button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
