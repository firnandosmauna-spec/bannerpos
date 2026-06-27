import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import TopNav from "./TopNav";
import Sidebar from "./Sidebar";
import ProductCatalog from "./ProductCatalog";
import InvoicePrint from "./InvoicePrint";
import CartPanel from "./CartPanel";
import OrderHistoryTable from "./OrderHistoryTable";
import { CartItem, OrderHistory, Product, MATERIALS, FINISHINGS, Material, Employee, Customer, Supplier, User } from "@/types/pos";
import MasterProduk from "./MasterProduk";
import MasterBahan from "./MasterBahan";
import StockCard from "./StockCard";
import MasterKaryawan from "./MasterKaryawan";
import MasterPelanggan from "./MasterPelanggan";
import MasterSupplier from "./MasterSupplier";
import MasterPengguna from "./MasterPengguna";
import MasterKategori from "./MasterKategori";
import ReportView from "./ReportView";
import SettingsView from "./SettingsView";
import DesignIntakeView from "./DesignIntakeView";
import PurchaseView from "./PurchaseView";
import MasterMesin from "./MasterMesin";
import TransactionHistoryView from "./TransactionHistoryView";
import ProductionTrackingView from "./ProductionTrackingView";
import MainDashboardView from "./MainDashboardView";
import AccountingCOA from "./AccountingCOA";
import AccountingJournal from "./AccountingJournal";
import AccountingLedger from "./AccountingLedger";
import AccountingStatements from "./AccountingStatements";
import { useMasterData } from "@/hooks/useMasterData";
import { TrendingUp, Users, Package, DollarSign } from "lucide-react";

interface DashboardProps {
  kasirName: string;
  kasirRole?: string;
  kasirPermissions?: string[];
  onLogout: () => void;
}

let orderCounter = 1;

export default function Dashboard({ kasirName, kasirRole = "kasir", kasirPermissions = [], onLogout }: DashboardProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const [printData, setPrintData] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [posStep, setPosStep] = useState<"intake" | "transaction">("intake");
  const [initialDesignData, setInitialDesignData] = useState<{ hasDesign: boolean; fee: number; note: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const {
    products,
    materials,
    employees,
    customers,
    suppliers,
    users,
    loading,
    refresh,
    addProduct,
    updateProduct,
    deleteProduct,
    addItem,
    updateItem,
    deleteItem,
    addProfile,
    seedBannerProducts,
    categories,
    machines,
    fetchMachineLogs,
  } = useMasterData();

  const handleAddProduct = (product: Product) => {
    const existingIndex = cartItems.findIndex(
      (item) =>
        item.productId === product.id &&
        item.width === 100 &&
        item.height === 100
    );

    if (existingIndex !== -1) {
      const updated = [...cartItems];
      const item = updated[existingIndex];
      const newQty = item.quantity + 1;
      const area = (item.width / 100) * (item.height / 100);
      updated[existingIndex] = {
        ...item,
        quantity: newQty,
        totalPrice: area * item.pricePerM2 * newQty,
      };
      setCartItems(updated);
    } else {
      const defaultW = 100;
      const defaultH = 100;
      const area = (defaultW / 100) * (defaultH / 100);
      const newItem: CartItem = {
        id: `${product.id}-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        width: defaultW,
        height: defaultH,
        quantity: 1,
        material: MATERIALS[0],
        finishing: FINISHINGS[0],
        designNote: "",
        pricePerM2: product.pricePerM2,
        unit: product.unit,
        totalPrice: area * product.pricePerM2 + (cartItems.length === 0 && initialDesignData?.hasDesign ? (initialDesignData?.fee || 0) : 0),
        hasDesignRequest: cartItems.length === 0 && (initialDesignData?.hasDesign ?? false),
        designFee: cartItems.length === 0 && initialDesignData?.hasDesign ? (initialDesignData?.fee || 0) : 0,
        designNote: cartItems.length === 0 && initialDesignData?.hasDesign ? (initialDesignData?.note || "") : "",
      };
      setCartItems((prev) => [...prev, newItem]);
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<CartItem>) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const fetchOrders = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", today.toISOString())
        .order("created_at", { ascending: false });

      if (data) {
        setOrderHistory(data.map((o: any) => ({
          id: o.id.toString(),
          orderNo: o.order_no,
          items: o.items_summary,
          total: o.total_amount,
          paidAmount: o.paid_amount,
          remainingAmount: o.remaining_amount,
          paymentMethod: o.payment_method,
          status: o.status,
          time: new Date(o.created_at).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })));
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCheckout = async (paymentMethod: any, paidAmount: number, manualInvoiceNo: string = "") => {
    const total = cartItems.reduce((sum, i) => sum + i.totalPrice, 0);
    const itemsLabel = cartItems
      .map((i) => `${i.productName} (${i.width}×${i.height})`)
      .join(", ");

    const now = new Date();
    
    const prefix = localStorage.getItem("autoInvoicePrefix") || "ORD-";
    let counter = parseInt(localStorage.getItem("currentInvoiceCounter") || "1");
    if (isNaN(counter)) counter = 1;

    const orderNo = manualInvoiceNo.trim() !== "" 
      ? manualInvoiceNo.trim() 
      : `${prefix}${String(counter).padStart(4, "0")}`;

    if (manualInvoiceNo.trim() === "") {
      localStorage.setItem("currentInvoiceCounter", (counter + 1).toString());
    }

    const newOrder = {
      order_no: orderNo,
      items_summary: itemsLabel.length > 40 ? itemsLabel.slice(0, 40) + "..." : itemsLabel,
      total_amount: total,
      paid_amount: paidAmount,
      remaining_amount: Math.max(0, total - paidAmount),
      payment_method: paymentMethod,
      status: "pending", // Semua order masuk antrian produksi dulu
    };

    try {
      const { error } = await supabase.from("orders").insert([newOrder]);
      if (error) throw error;
      toast.success("Transaksi Berhasil!");
      fetchOrders();
      
      // Siapkan data cetak
      setPrintData({
        orderNo,
        kasirName,
        items: cartItems.map(i => ({
          name: `${i.productName} (${i.width}x${i.height})`,
          qty: i.quantity,
          price: i.pricePerM2,
          total: i.totalPrice,
          note: i.hasDesignRequest ? 'Termasuk Jasa Desain' : ''
        })),
        total,
        paidAmount,
        paymentMethod,
        date: new Date()
      });

      setCartItems([]);
      setSuccessMessage(`Transaksi ${orderNo} berhasil! Total: Rp ${new Intl.NumberFormat("id-ID").format(total)}`);
      
      // Auto-print delay to allow render
      setTimeout(() => {
        window.print();
        setTimeout(() => setSuccessMessage(""), 4000);
      }, 500);

    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error("Gagal menyimpan transaksi: " + error.message);
    }
  };

  const todayOrdersCount = orderHistory.length;
  const todaySales = orderHistory.reduce((sum, order) => sum + order.total, 0);
  const formatCurrency = (val: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  const stats = [
    { label: "Omzet Hari Ini", value: formatCurrency(todaySales), icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Pesanan Hari Ini", value: `${todayOrdersCount} Order`, icon: TrendingUp, color: "text-[#FF6B1A]", bg: "bg-[#FF6B1A]/10" },
    { label: "Total Produk", value: products.length.toString(), icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Pelanggan Aktif", value: customers.length.toString(), icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-[#F8FAFC] print:hidden">
        <Sidebar 
          kasirName={kasirName} 
          onLogout={onLogout} 
          currentView={currentView} 
          onViewChange={(v) => { setCurrentView(v); setIsMobileMenuOpen(false); }}
          role={kasirRole} 
          permissions={kasirPermissions}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

      <div className="flex-1 flex flex-col min-w-0 bg-[#F1F5F9] relative">
        <TopNav 
          kasirName={kasirName} 
          onLogout={onLogout} 
          currentView={currentView} 
          onViewChange={(v) => { setCurrentView(v); setIsMobileMenuOpen(false); }} 
          onToggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        <div className="flex-1 overflow-hidden flex flex-col relative">
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl px-5 py-3 flex items-center gap-2.5 bg-green-50 border border-green-100 shadow-lg"
              >
                <span className="text-xl">✅</span>
                <p className="text-sm font-bold text-[#2ECC71]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <main className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-4 lg:p-5 flex flex-col">
            {currentView === "dashboard" ? (
              <MainDashboardView 
                stats={{
                  totalSales: formatCurrency(todaySales),
                  todayOrders: `${todayOrdersCount} Order`,
                  totalProducts: products.length.toString(),
                  activeCustomers: customers.length.toString(),
                }}
                recentOrders={orderHistory}
                lowStockItems={materials.filter(m => m.stock <= m.minStock)}
                onViewTransactions={() => setCurrentView("report-transactions")}
              />
            )}
            {currentView === "pos" ? (
              <div className="flex flex-col h-full gap-6">
                {posStep === "intake" ? (
                  <DesignIntakeView 
                    onProceed={(data) => {
                      setInitialDesignData(data);
                      setPosStep("transaction");
                    }} 
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {stats.map((stat, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E2E8F0] flex items-center gap-3 hover:border-[#FF6B1A]/30 transition-all cursor-default group shadow-sm"
                        >
                          <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon size={20} />
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">{stat.label}</p>
                            <p className="text-base font-bold text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>{stat.value}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="flex flex-col lg:flex-row flex-1 gap-4 lg:overflow-hidden min-h-[500px]">
                      <div className="flex flex-col flex-1 bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm">
                        <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-center px-4 py-2 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">
                              Mode: {initialDesignData?.hasDesign ? "Layanan Desain" : "Cetak Saja"}
                            </span>
                            <button 
                              onClick={() => setPosStep("intake")}
                              className="text-[10px] font-bold text-[#FF6B1A] hover:underline"
                            >
                              Ganti Mode
                            </button>
                          </div>
                          <ProductCatalog products={products} onAddProduct={handleAddProduct} />
                        </div>
                        <div className="hidden lg:block border-t border-[#E2E8F0] bg-[#F8FAFC] h-[140px]">
                          <OrderHistoryTable orders={orderHistory} onViewAll={() => setCurrentView("report-transactions")} />
                        </div>
                      </div>

                      <div className="w-full lg:w-[320px] flex flex-col bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm shrink-0">
                        <CartPanel
                          items={cartItems}
                          onUpdateItem={handleUpdateItem}
                          onRemoveItem={handleRemoveItem}
                          onCheckout={(method, paid, manualInvoice) => {
                            handleCheckout(method, paid, manualInvoice);
                            setPosStep("intake");
                          }}
                          onPreviewInvoice={(method, paid) => {
                            if (cartItems.length === 0) return;
                            const total = cartItems.reduce((sum, i) => sum + i.totalPrice, 0);
                            setPrintData({
                              orderNo: "DRAFT-PREVIEW",
                              kasirName,
                              items: cartItems.map(i => ({
                                name: `${i.productName} (${i.width}x${i.height})`,
                                qty: i.quantity,
                                price: i.pricePerM2,
                                total: i.totalPrice,
                                note: i.hasDesignRequest ? 'Termasuk Jasa Desain' : ''
                              })),
                              total,
                              paidAmount: paid,
                              paymentMethod: method,
                              date: new Date()
                            });
                            setTimeout(() => window.print(), 200);
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <motion.div 
                key={currentView}
                initial={{ opacity: 0, scale: 0.995 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] overflow-hidden shadow-lg"
              >
                {currentView === "master-produk" && (
                  <MasterProduk
                    products={products}
                    categories={categories}
                    onAddProduct={addProduct}
                    onUpdateProduct={updateProduct}
                    onDeleteProduct={deleteProduct}
                    onSeedBanner={seedBannerProducts}
                  />
                )}
                {currentView === "master-kategori" && (
                  <MasterKategori
                    categories={categories}
                    onAdd={(item) => addItem("categories", { name: item.name, description: item.description })}
                    onUpdate={(item) => updateItem("categories", item.id, { name: item.name, description: item.description })}
                    onDelete={(id) => deleteItem("categories", id)}
                  />
                )}
                {currentView === "master-bahan" && (
                  <MasterBahan
                    materials={materials}
                    onAdd={(item) => addItem("ingredients", { name: item.name, stock: item.stock, unit: item.unit, min_stock: item.minStock })}
                    onUpdate={(item) => updateItem("ingredients", item.id, { name: item.name, stock: item.stock, unit: item.unit, min_stock: item.minStock })}
                    onDelete={(id) => deleteItem("ingredients", id)}
                  />
                )}
                {currentView === "stock-card" && (
                  <StockCard materials={materials} />
                )}
                {currentView === "master-karyawan" && (
                  <MasterKaryawan
                    employees={employees}
                    onAdd={(item) => addItem("employees", { name: item.name, position: item.role, phone: item.phone, status: item.status === "aktif" ? "Active" : "Inactive" })}
                    onUpdate={(item) => updateItem("employees", item.id, { name: item.name, position: item.role, phone: item.phone, status: item.status === "aktif" ? "Active" : "Inactive" })}
                    onDelete={(id) => deleteItem("employees", id)}
                  />
                )}
                {currentView === "master-pelanggan" && (
                  <MasterPelanggan
                    customers={customers}
                    onAdd={(item) => addItem("contacts", { name: item.name, phone: item.phone, address: item.address, type: "Customer" })}
                    onUpdate={(item) => updateItem("contacts", item.id, { name: item.name, phone: item.phone, address: item.address, type: "Customer" })}
                    onDelete={(id) => deleteItem("contacts", id)}
                  />
                )}
                {currentView === "master-supplier" && (
                  <MasterSupplier
                    suppliers={suppliers}
                    onAdd={(item) => addItem("contacts", { name: item.name, company: item.contact, phone: item.phone, address: item.address, type: "Supplier" })}
                    onUpdate={(item) => updateItem("contacts", item.id, { name: item.name, company: item.contact, phone: item.phone, address: item.address, type: "Supplier" })}
                    onDelete={(id) => deleteItem("contacts", id)}
                  />
                )}
                {currentView === "purchase-materials" && (
                  <PurchaseView
                    materials={materials}
                    suppliers={suppliers}
                    onRefreshMaterials={refresh}
                  />
                )}
                {currentView === "master-mesin" && (
                  <MasterMesin
                    machines={machines}
                    onAdd={(item) => addItem("machines", { name: item.name, type: item.type, status: item.status, ip_address: item.ipAddress })}
                    onUpdate={(item) => updateItem("machines", item.id, { name: item.name, type: item.type, status: item.status, ip_address: item.ipAddress })}
                    onDelete={(id) => deleteItem("machines", id)}
                    fetchLogs={fetchMachineLogs}
                  />
                )}
                {currentView === "production-tracking" && (
                  <ProductionTrackingView onPrintSPK={(order) => {
                    setPrintData({
                      orderNo: order.order_no,
                      kasirName,
                      items: [{ name: order.items_summary, qty: 1, price: 0, total: 0 }],
                      total: 0,
                      paidAmount: 0,
                      paymentMethod: "-",
                      date: new Date(order.created_at),
                      isSPK: true
                    });
                    setTimeout(() => window.print(), 200);
                  }} />
                )}
                {currentView === "report-transactions" && (
                  <TransactionHistoryView onPrint={(data) => {
                    setPrintData(data);
                    setTimeout(() => window.print(), 200);
                  }} />
                )}
                {currentView === "report-sales" && <ReportView title="Laporan Penjualan" type="sales" />}
                {currentView === "report-purchases" && <ReportView title="Laporan Pembelian" type="purchases" />}
                {currentView === "report-damaged" && <ReportView title="Laporan Barang Rusak" type="damaged" />}
                {currentView === "report-profit" && <ReportView title="Laporan Laba & Rugi" type="profit" />}
                {currentView === "accounting-coa" && <AccountingCOA />}
                {currentView === "accounting-journal" && <AccountingJournal />}
                {currentView === "accounting-ledger" && <AccountingLedger />}
                {currentView === "accounting-statements" && <AccountingStatements />}
                {currentView === "settings" && (
                  <SettingsView
                    users={users}
                    onAddUser={(item) => addProfile({ email: `${item.username.replace(/\s+/g, '').toLowerCase()}@example.com`, name: item.name, role: item.role, password: item.password, permissions: item.permissions || [] })}
                    onUpdateUser={(item) => updateItem("profiles", item.id, { email: `${item.username.replace(/\s+/g, '').toLowerCase()}@example.com`, name: item.name, role: item.role, permissions: item.permissions || [] })}
                    onDeleteUser={(id) => deleteItem("profiles", id)}
                  />
                )}
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
    {printData && (
        <InvoicePrint {...printData} />
    )}
    </>
  );
}
