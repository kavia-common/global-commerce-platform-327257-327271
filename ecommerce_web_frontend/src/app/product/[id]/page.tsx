import React from "react";
import ProductClient from "./ProductClient";

// PUBLIC_INTERFACE
export function generateStaticParams() {
  /** Provide static params for Next.js static export.
   *
   * Contract:
   * - Output: list of params objects for the [id] segment
   * - Source: mock catalog IDs (static-export safe)
   */
  return [{ id: "p_001" }, { id: "p_002" }, { id: "p_003" }];
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductClient productId={id} />;
}
