import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Edit2, Trash2, X, Image as ImageIcon, Tag, DollarSign, Box } from "lucide-react";
import { Product, PRODUCTS as INITIAL_PRODUCTS, Category } from "@/types/pos";

interface MasterProdukProps {
  products: Product[];
  categories: Category[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onSeedBanner?: () => void;
}

export default function MasterProduk({
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onSeedBanner,
}: MasterProdukProps) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] p-4 lg:p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2
            className="text-xl lg:text-2xl font-bold"
            style={{ fontFamily: "Syne, sans-serif", color: "#1E293B" }}
          >
            Master Produk
          </h2>
          <p
            className="text-xs lg:text-sm"
            style={{ fontFamily: "Space Grotesk, sans-serif", color: "#64748B" }}
          >
            Kelola data produk dan harga layanan
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {onSeedBanner && (
            <button
              onClick={onSeedBanner}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] lg:text-sm font-bold border border-[#0EA5E9] text-[#0EA5E9]"
            >
              Pulihkan
            </button>
          )}
          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[10px] lg:text-sm font-bold transition-all"
            style={{
              backgroundColor: "#0EA5E9",
              color: "#FFFFFF",
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            <Plus size={16} />
            Tambah
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: "#64748B" }}
        />
        <input
          type="text"
          placeholder="Cari..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#0EA5E9] transition-all shadow-sm"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
        />
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] overflow-x-auto shadow-sm">
        <div className="min-w-[600px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#F8FAFC] z-10 border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Produk</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Harga</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Satuan</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0"
                        style={{
                          backgroundColor: product.color + "18",
                          border: `1px solid ${product.color}30`,
                        }}
                      >
                        {product.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#1E293B] text-xs truncate" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                          {product.name}
                        </p>
                        <p className="text-[10px] text-[#64748B] truncate" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider whitespace-nowrap"
                      style={{
                        backgroundColor: "#F8FAFC",
                        color: "#64748B",
                        border: "1px solid #E2E8F0",
                        fontFamily: "Space Grotesk, sans-serif",
                      }}
                    >
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-[#1E293B] text-xs">
                    {formatPrice(product.pricePerM2)}
                  </td>
                  <td className="px-6 py-4 text-[#8A8A95] text-xs" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                    {product.unit}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="p-1.5 rounded-lg hover:bg-[#0EA5E9]/10 text-[#64748B] hover:text-[#0EA5E9] transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(product.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-[#64748B] hover:text-red-500 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-[#8A8A95] text-sm" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Tidak ada produk ditemukan.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <ProductModal
            product={editingProduct}
            categories={categories}
            onClose={() => setIsModalOpen(false)}
            onSave={(data) => {
              if (editingProduct) {
                onUpdateProduct({ ...editingProduct, ...data });
              } else {
                onAddProduct({ ...data, id: Date.now().toString() } as Product);
              }
              setIsModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductModal({
  product,
  categories,
  onClose,
  onSave,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSave: (data: Partial<Product>) => void;
}) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    category: product?.category || "",
    pricePerM2: product?.pricePerM2 || 0,
    unit: product?.unit || "m²",
    icon: product?.icon || "📦",
    color: product?.color || "#0EA5E9",
    description: product?.description || "",
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-lg bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <h3 className="text-lg font-bold text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>
            {product ? "Edit Produk" : "Tambah Produk Baru"}
          </h3>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#1E293B]">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#64748B] uppercase">Nama Produk</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={14} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#0EA5E9]"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#64748B] uppercase">Kategori</label>
              <div className="relative">
                <Box className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={14} />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#0EA5E9] appearance-none"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#64748B] uppercase">Harga (per Satuan)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={14} />
                <input
                  type="number"
                  value={formData.pricePerM2}
                  onChange={(e) => setFormData({ ...formData, pricePerM2: Number(e.target.value) })}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#0EA5E9]"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#64748B] uppercase">Satuan</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#FF6B1A]"
              >
                <option value="m²">m²</option>
                <option value="pcs">pcs</option>
                <option value="lembar">lembar</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#8A8A95] uppercase">Icon (Emoji)</label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A95]" size={14} />
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full bg-[#1A1A1F] border border-[#2E2E36] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#F0EDE8] outline-none focus:border-[#FF6B1A]"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#8A8A95] uppercase">Warna Tema</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-10 h-10 bg-transparent border-none cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 bg-[#1A1A1F] border border-[#2E2E36] rounded-xl px-4 py-2.5 text-sm text-[#F0EDE8] outline-none focus:border-[#FF6B1A]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#64748B] uppercase">Deskripsi Singkat</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#0EA5E9] h-20 resize-none"
            />
          </div>
        </div>

        <div className="p-6 border-t border-[#E2E8F0] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-[#E2E8F0] text-[#1E293B] hover:bg-[#F8FAFC] transition-all"
          >
            Batal
          </button>
          <button
            onClick={() => onSave(formData)}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-[#0EA5E9] text-[#FFFFFF] hover:bg-[#38BDF8] transition-all shadow-md shadow-blue-500/20"
          >
            Simpan Produk
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
