import { useState } from "react";
import { motion } from "framer-motion";
import { Search, PlusCircle } from "lucide-react";
import { Product } from "@/types/pos";

interface ProductCatalogProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
}

export default function ProductCatalog({ products, onAddProduct }: ProductCatalogProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  const categories = ["Semua", ...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      activeCategory === "Semua" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <h2
          className="text-base font-bold mb-3"
          style={{
            fontFamily: "Syne, sans-serif",
            color: "#1E293B",
            letterSpacing: "-0.01em",
          }}
        >
          Katalog Produk
        </h2>

        {/* Search & Categories */}
        <div className="flex flex-col gap-2 mb-3">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#FF6B1A] transition-colors"
              size={14}
              style={{ color: "#94A3B8" }}
            />
            <input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-8 pr-4 py-1.5 text-xs outline-none focus:border-[#FF6B1A] focus:ring-4 focus:ring-[#FF6B1A]/5 transition-all"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => {
              const icons: Record<string, string> = {
                "Semua": "🛍️",
                "Banner": "🖼️",
                "Spanduk": "📢",
                "Sticker": "🏷️",
                "Neon Box": "💡",
                "Baliho": "🗺️",
                "MMT": "📋",
                "Backdrop": "🎭"
              };
              const icon = icons[cat] || "📦";
              
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                    activeCategory === cat
                      ? "bg-[#FF6B1A] text-[#FFFFFF] shadow-lg shadow-orange-500/20 scale-105"
                      : "bg-[#FFFFFF] text-[#64748B] border border-[#E2E8F0] hover:border-[#FF6B1A] hover:bg-[#F8FAFC]"
                  }`}
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  <span className="text-sm">{icon}</span>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {filtered.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              onAdd={onAddProduct}
              formatPrice={formatPrice}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="text-4xl mb-3">🔍</span>
            <p
              className="text-sm"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                color: "#64748B",
              }}
            >
              Produk tidak ditemukan
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({
  product,
  index,
  onAdd,
  formatPrice,
}: {
  product: Product;
  index: number;
  onAdd: (p: Product) => void;
  formatPrice: (n: number) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      onClick={() => onAdd(product)}
      className="group bg-[#FFFFFF] rounded-lg border border-[#E2E8F0] p-2 cursor-pointer transition-all hover:border-[#FF6B1A] hover:shadow-sm relative overflow-hidden"
    >
      <div className="flex flex-col gap-1.5 relative z-10">
        <div className="flex justify-between items-start gap-2">
          <h3
            className="text-[12px] font-bold leading-tight line-clamp-2 group-hover:text-[#FF6B1A] transition-colors"
            style={{ fontFamily: "Syne, sans-serif", color: "#1E293B" }}
          >
            {product.name}
          </h3>
          <div className="shrink-0 text-[#FF6B1A] opacity-0 group-hover:opacity-100 transition-opacity">
            <PlusCircle size={14} />
          </div>
        </div>

        <p
          className="text-[9px] line-clamp-1"
          style={{ fontFamily: "Space Grotesk, sans-serif", color: "#64748B" }}
        >
          {product.description}
        </p>

        <div className="mt-1 flex items-center justify-between">
          <p
            className="text-[11px] font-black"
            style={{ fontFamily: "JetBrains Mono, monospace", color: "#FF6B1A" }}
          >
            {formatPrice(product.pricePerM2)}
          </p>
          <span className="text-[8px] font-bold text-[#94A3B8] uppercase">
            /{product.unit}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
