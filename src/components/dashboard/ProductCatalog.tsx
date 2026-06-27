import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, PlusCircle, X } from "lucide-react";
import { Product } from "@/types/pos";

interface ProductCatalogProps {
  products: Product[];
  onAddProduct: (product: Product, width?: number, height?: number, customPricePerM2?: number) => void;
}

export default function ProductCatalog({ products, onAddProduct }: ProductCatalogProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [selectedProductForSize, setSelectedProductForSize] = useState<Product | null>(null);
  const [customWidth, setCustomWidth] = useState<number | string>(100);
  const [customHeight, setCustomHeight] = useState<number | string>(100);
  const [customPrice, setCustomPrice] = useState<number | string>(0);

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

  const handleProductClick = (product: Product) => {
    if (product.unit === "m²") {
      setSelectedProductForSize(product);
      setCustomWidth(100);
      setCustomHeight(100);
      setCustomPrice(product.pricePerM2);
    } else {
      onAddProduct(product, 100, 100, product.pricePerM2);
    }
  };

  const confirmAddProduct = () => {
    if (selectedProductForSize) {
      const w = typeof customWidth === "string" ? parseFloat(customWidth) || 100 : customWidth;
      const h = typeof customHeight === "string" ? parseFloat(customHeight) || 100 : customHeight;
      const p = typeof customPrice === "string" ? parseFloat(customPrice) || selectedProductForSize.pricePerM2 : customPrice;
      onAddProduct(selectedProductForSize, w, h, p);
      setSelectedProductForSize(null);
    }
  };

  return (
    <div
      className="flex flex-col h-full relative"
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
              onAdd={handleProductClick}
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

      {/* Size Selection Modal */}
      <AnimatePresence>
        {selectedProductForSize && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#FFFFFF] rounded-xl shadow-xl w-full max-w-[280px] overflow-hidden"
              style={{ border: "1px solid #E2E8F0" }}
            >
              <div className="px-3 py-2 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
                <h3 className="text-xs font-bold text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>
                  Tentukan Ukuran & Harga
                </h3>
                <button
                  onClick={() => setSelectedProductForSize(null)}
                  className="w-5 h-5 rounded flex items-center justify-center hover:bg-gray-200 text-[#64748B] transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] flex items-center justify-center border border-[#E2E8F0] text-lg">
                    {selectedProductForSize.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1E293B] leading-tight" style={{ fontFamily: "Syne, sans-serif" }}>
                      {selectedProductForSize.name}
                    </h4>
                    <p className="text-[9px] text-[#64748B]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                      Base: Rp {formatPrice(selectedProductForSize.pricePerM2)}/{selectedProductForSize.unit}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] mb-0.5 font-bold text-[#8A8A95]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                      Lebar (cm)
                    </label>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(e.target.value)}
                      className="w-full rounded-md px-2 py-1.5 text-xs outline-none bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF6B1A] text-[#1E293B]"
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] mb-0.5 font-bold text-[#8A8A95]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                      Tinggi (cm)
                    </label>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(e.target.value)}
                      className="w-full rounded-md px-2 py-1.5 text-xs outline-none bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF6B1A] text-[#1E293B]"
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] mb-0.5 font-bold text-[#8A8A95]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                    Harga per {selectedProductForSize.unit} (Rp)
                  </label>
                  <input
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-full rounded-md px-2 py-1.5 text-xs outline-none bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#FF6B1A] text-[#1E293B]"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  />
                </div>
                
                <div className="bg-[#FF6B1A]/5 rounded-lg p-2 flex justify-between items-center border border-[#FF6B1A]/20">
                  <span className="text-[10px] font-bold text-[#64748B]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Total</span>
                  <span className="text-[13px] font-black text-[#FF6B1A]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    Rp {formatPrice(
                      ((typeof customWidth === "string" ? parseFloat(customWidth) || 0 : customWidth) / 100) *
                      ((typeof customHeight === "string" ? parseFloat(customHeight) || 0 : customHeight) / 100) *
                      (typeof customPrice === "string" ? parseFloat(customPrice) || 0 : customPrice)
                    )}
                  </span>
                </div>
              </div>

              <div className="px-3 py-2 border-t border-[#E2E8F0] bg-[#F8FAFC] flex gap-2">
                <button
                  onClick={() => setSelectedProductForSize(null)}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-[#64748B] bg-white border border-[#E2E8F0] hover:bg-gray-50 transition-colors"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  Batal
                </button>
                <button
                  onClick={confirmAddProduct}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-white bg-[#FF6B1A] hover:bg-[#FF8534] transition-colors"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  Tambah
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
