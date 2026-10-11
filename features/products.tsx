"use client";
import { useState } from "react";
import { ArrowDownToLine, ArrowUpRight, Package, Star } from "lucide-react";
import { useResource } from "@/hooks/use-resource";
import { useNotifications } from "@/providers";
import {
  EmptyState,
  ErrorState,
  Loading,
  Modal,
  PageHeading,
  SearchBox,
  Select,
} from "@/components/ui";
import { exportCsv, money, number } from "@/utils/format";
import type { Product } from "@/types";
const categories = [
  "All products",
  "Electronics",
  "Accessories",
  "Workspace",
  "Lifestyle",
  "Audio",
];
export function ProductsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All products");
  const [sort, setSort] = useState("featured");
  const [selected, setSelected] = useState<Product | null>(null);
  const notify = useNotifications();
  const result = useResource("products", query);
  const rows = (result.data || [])
    .filter(
      (product) => category === "All products" || product.category === category,
    )
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : sort === "rating"
            ? b.rating - a.rating
            : a.id.localeCompare(b.id),
    );
  return (
    <>
      <PageHeading
        eyebrow="YOUR CATALOG"
        title="Products"
        description="Considered essentials. A catalog built for everyday life."
      >
        <button
          className="button"
          disabled={!rows.length}
          onClick={() => {
            exportCsv("products", rows);
            notify("Product catalog exported.");
          }}
        >
          <ArrowDownToLine size={16} />
          Export catalog
        </button>
      </PageHeading>
      <div className="catalog-toolbar">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Search products..."
        />
        <Select
          label="Sort products"
          value={sort}
          onChange={setSort}
          options={[
            { value: "featured", label: "Featured" },
            { value: "low", label: "Price: low to high" },
            { value: "high", label: "Price: high to low" },
            { value: "rating", label: "Top rated" },
          ]}
        />
      </div>
      <div
        className="catalog-tabs"
        role="tablist"
        aria-label="Product category"
      >
        {categories.map((item) => (
          <button
            key={item}
            role="tab"
            aria-selected={item === category}
            className={item === category ? "selected" : ""}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="catalog-count">
        <span>{number(rows.length)} products</span>
        <span>
          <Package size={14} />
          Curated for your workspace
        </span>
      </div>
      {result.isPending ? (
        <Loading label="Loading the catalog..." />
      ) : result.error ? (
        <ErrorState error={result.error} retry={() => result.refetch()} />
      ) : !rows.length ? (
        <EmptyState />
      ) : (
        <div className="product-grid">
          {rows.map((product) => (
            <article className="product-card" key={product.id}>
              <button
                className="product-image"
                onClick={() => setSelected(product)}
                aria-label={`View ${product.name}`}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  width={700}
                  height={550}
                />
                {product.stock < 20 && (
                  <span className="stock-tag">
                    {product.stock === 0 ? "Out of stock" : "Low stock"}
                  </span>
                )}
                <span className="product-image-arrow">
                  <ArrowUpRight size={18} />
                </span>
              </button>
              <div className="product-card-content">
                <div className="product-meta">
                  <span>{product.category}</span>
                  <span>
                    <Star size={12} fill="currentColor" />
                    {product.rating.toFixed(1)}
                  </span>
                </div>
                <button
                  className="name-button"
                  onClick={() => setSelected(product)}
                >
                  {product.name}
                </button>
                <div className="product-card-bottom">
                  <strong>{money(product.price)}</strong>
                  <small>{product.stock} in stock</small>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {selected && (
        <Modal title="Product details" onClose={() => setSelected(null)}>
          <img
            className="detail-product-image"
            src={selected.image}
            alt={selected.name}
            width={700}
            height={400}
          />
          <div className="product-detail-title">
            <div>
              <div className="eyebrow">{selected.category}</div>
              <h3>{selected.name}</h3>
            </div>
            <strong>{money(selected.price)}</strong>
          </div>
          <p className="detail-description">{selected.description}</p>
          <dl className="detail-grid">
            <div>
              <dt>Product ID</dt>
              <dd>{selected.id}</dd>
            </div>
            <div>
              <dt>Inventory</dt>
              <dd>{selected.stock} units available</dd>
            </div>
            <div>
              <dt>Customer rating</dt>
              <dd>{selected.rating.toFixed(1)} / 5</dd>
            </div>
            <div>
              <dt>Fulfillment</dt>
              <dd>Standard shipping</dd>
            </div>
          </dl>
        </Modal>
      )}
    </>
  );
}
