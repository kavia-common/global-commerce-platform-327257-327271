"use client";

import Link from "next/link";
import React from "react";
import { useI18n } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { useCart } from "@/lib/cart";
import type { CurrencyCode, LocaleCode, Product } from "@/lib/models";

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition border";
  const styles =
    variant === "primary"
      ? "bg-[var(--primary)] text-white border-transparent hover:opacity-90 disabled:opacity-50"
      : variant === "secondary"
        ? "bg-white text-[var(--text)] border-[var(--border)] hover:bg-gray-50 disabled:opacity-50"
        : "bg-transparent text-[var(--text)] border-transparent hover:bg-gray-100 disabled:opacity-50";
  return (
    <button
      className={`${base} ${styles}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="muted">{label}</span>
      <select
        className="rounded-md border border-[var(--border)] bg-white px-2 py-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Header() {
  const { t, locale, setLocale } = useI18n();
  const { currency, setCurrency } = useCurrency();
  const { cart } = useCart();
  const cartCount = cart.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-white/90 backdrop-blur">
      <div className="container-page flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-semibold">
            {t("app.title")}
          </Link>
          <nav className="hidden sm:flex items-center gap-3 text-sm">
            <Link className="hover:underline" href="/catalog">
              {t("nav.shop")}
            </Link>
            <Link className="hover:underline" href="/cart">
              {t("nav.cart")}
            </Link>
            <Link className="hover:underline" href="/admin">
              {t("nav.admin")}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm muted">
            {t("nav.cart")}: {cartCount}
          </span>
          <Select
            label="Lang"
            value={locale}
            onChange={(v) => setLocale(v as LocaleCode)}
            options={[
              { value: "en", label: "EN" },
              { value: "es", label: "ES" },
              { value: "fr", label: "FR" },
              { value: "de", label: "DE" },
            ]}
          />
          <Select
            label="Cur"
            value={currency}
            onChange={(v) => setCurrency(v as CurrencyCode)}
            options={[
              { value: "USD", label: "USD" },
              { value: "EUR", label: "EUR" },
              { value: "GBP", label: "GBP" },
              { value: "JPY", label: "JPY" },
            ]}
          />
          <Link
            className="inline-flex items-center rounded-md border border-[var(--border)] px-3 py-2 text-sm hover:bg-gray-50"
            href="/cart"
            aria-label={`${t("nav.cart")} (${cartCount})`}
          >
            {t("nav.cart")} ({cartCount})
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-white">
      <div className="container-page text-sm muted">
        <p>
          Static-export friendly demo storefront. Integrations are stubs for
          backend microservices.
        </p>
      </div>
    </footer>
  );
}

export function ProductCard({
  product,
  priceLabel,
  onAddToCart,
}: {
  product: Product;
  priceLabel: string;
  onAddToCart: () => void;
}) {
  const { t, locale } = useI18n();
  return (
    <article className="card flex flex-col gap-2">
      <div className="aspect-[4/3] w-full rounded-md border border-[var(--border)] bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center text-xs muted">
        {product.imageUrl ? <span>Image</span> : <span>Placeholder</span>}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold">{product.name[locale]}</h3>
        <p className="text-sm muted line-clamp-2">
          {product.description[locale]}
        </p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold">{priceLabel}</div>
        <Button onClick={onAddToCart} disabled={!product.inventory.inStock}>
          {t("product.addToCart")}
        </Button>
      </div>
      {!product.inventory.inStock ? (
        <p className="text-xs text-[var(--danger)]">Out of stock</p>
      ) : (
        <p className="text-xs muted">In stock: {product.inventory.quantity}</p>
      )}
    </article>
  );
}

export function RecommendationCarousel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      <h2 className="font-semibold mb-3">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">{children}</div>
    </section>
  );
}

export function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-2 py-1 text-xs muted">
      {children}
    </span>
  );
}
