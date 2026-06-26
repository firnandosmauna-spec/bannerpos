import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Product, Material, Employee, Customer, Supplier, User, Category, Machine } from "@/types/pos";
import { toast } from "sonner";

export function useMasterData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      // Products
      const { data: prodData } = await supabase.from("products").select("*");
      console.log("Fetched Products:", prodData);
      if (prodData) {
        setProducts(prodData.map((p: any) => ({
          id: p.id.toString(),
          name: p.name,
          category: p.category || "General",
          pricePerM2: p.price || 0,
          unit: p.unit || "m²",
          icon: p.image_url || "📦",
          color: "#FF6B1A",
          description: p.description || "",
        })));
      }

      // Materials (Ingredients)
      const { data: matData } = await supabase.from("ingredients").select("*");
      console.log("Fetched Materials:", matData);
      if (matData) {
        setMaterials(matData.map((m: any) => ({
          id: m.id.toString(),
          name: m.name,
          stock: m.stock || 0,
          unit: m.unit || "pcs",
          minStock: m.min_stock || 0,
        })));
      }

      // Employees
      const { data: empData } = await supabase.from("employees").select("*");
      if (empData) {
        setEmployees(empData.map((e: any) => ({
          id: e.id.toString(),
          name: e.name,
          role: e.position || "Staff",
          phone: e.phone || "",
          status: e.status === "Active" ? "aktif" : "nonaktif",
        })));
      }

      // Contacts (Customers & Suppliers)
      const { data: contactData } = await supabase.from("contacts").select("*");
      if (contactData) {
        const cust = contactData.filter((c: any) => c.type === "Customer");
        const supp = contactData.filter((c: any) => c.type === "Supplier");
        
        setCustomers(cust.map((c: any) => ({
          id: c.id.toString(),
          name: c.name,
          phone: c.phone || "",
          address: c.address || "",
          totalOrders: c.points || 0,
        })));

        setSuppliers(supp.map((s: any) => ({
          id: s.id.toString(),
          name: s.name,
          contact: s.company || "",
          phone: s.phone || "",
          address: s.address || "",
        })));
      }

      // Users (Profiles)
      const { data: userData } = await supabase.from("profiles").select("*");
      if (userData) {
        setUsers(userData.map((u: any) => ({
          id: u.id,
          username: u.email?.split("@")[0] || "user",
          name: u.name || "User",
          role: u.role?.toLowerCase() === "admin" ? "admin" : "kasir",
        })));
      }

      // Categories
      const { data: catData } = await supabase.from("categories").select("*");
      console.log("Fetched Categories:", catData);
      if (catData) {
        setCategories(catData.map((c: any) => ({
          id: c.id.toString(),
          name: c.name,
          description: c.description || "",
        })));
      }

      // Machines
      const { data: machineData } = await supabase.from("machines").select("*");
      console.log("Fetched Machines:", machineData);
      if (machineData) {
        setMachines(machineData.map((m: any) => ({
          id: m.id.toString(),
          name: m.name,
          type: m.type || "Other",
          status: m.status || "aktif",
          ipAddress: m.ip_address || "",
          lastService: m.last_service || "",
        })));
      }
    } catch (error) {
      console.error("Error fetching master data:", error);
      toast.error("Gagal mengambil data dari server");
    } finally {
      setLoading(false);
    }
  };

  const fetchStockLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("inventory_logs")
        .select(`*, ingredients (name)`)
        .order("created_at", { ascending: false });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const fetchMachineLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("machine_logs")
        .select(`*, machines (name)`)
        .order("created_at", { ascending: false });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Mutators
  const addProduct = async (item: Partial<Product>) => {
    const { data, error } = await supabase.from("products").insert([{
      name: item.name,
      price: item.pricePerM2,
      unit: item.unit,
      category: item.category,
      description: item.description,
      image_url: item.icon,
    }]).select();
    if (!error) fetchData();
    return { data, error };
  };

  const updateProduct = async (item: Product) => {
    const { error } = await supabase.from("products").update({
      name: item.name,
      price: item.pricePerM2,
      unit: item.unit,
      category: item.category,
      description: item.description,
      image_url: item.icon,
    }).eq("id", item.id);
    if (!error) fetchData();
    return { error };
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) fetchData();
    return { error };
  };

  // Generic helpers for other tables
  const addItem = async (table: string, payload: any) => {
    const { error } = await supabase.from(table).insert([payload]);
    if (!error) {
      fetchData();
      toast.success("Data berhasil ditambah");
    } else {
      toast.error(`Gagal menambah data: ${error.message}`);
    }
  };

  const addProfile = async (payload: any) => {
    // 1. Create auth user first
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: payload.email,
      password: "password123", // Default password for new users
    });

    if (authError) {
      toast.error(`Gagal membuat otentikasi: ${authError.message}`);
      return;
    }

    if (authData.user) {
      // 2. Insert into profiles with the new auth.users ID
      const { error: profileError } = await supabase.from("profiles").insert([{
        id: authData.user.id,
        email: payload.email,
        name: payload.name,
        role: payload.role
      }]);

      if (!profileError) {
        fetchData();
        toast.success("Pengguna berhasil ditambahkan");
      } else {
        toast.error(`Gagal membuat profil: ${profileError.message}`);
      }
    }
  };

  const updateItem = async (table: string, id: string, payload: any) => {
    const { error } = await supabase.from(table).update(payload).eq("id", id);
    if (!error) {
      fetchData();
      toast.success("Data berhasil diubah");
    } else {
      toast.error("Gagal mengubah data");
    }
  };

  const deleteItem = async (table: string, id: string) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (!error) {
      fetchData();
      toast.success("Data berhasil dihapus");
    } else {
      toast.error("Gagal menghapus data");
    }
  };

  const seedBannerProducts = async () => {
    const bannerProducts = [
      { name: "Banner Vinyl", category: "Banner", price: 35000, unit: "m²", description: "Vinyl premium outdoor", image_url: "🖼️" },
      { name: "Spanduk", category: "Spanduk", price: 25000, unit: "m²", description: "Spanduk kain/parasut", image_url: "📢" },
      { name: "Sticker Vinyl", category: "Sticker", price: 45000, unit: "m²", description: "Sticker cutting/print", image_url: "🏷️" },
      { name: "MMT / Flexi", category: "MMT", price: 20000, unit: "m²", description: "Flexi backlite/frontlite", image_url: "📋" },
    ];
    
    const { error } = await supabase.from("products").insert(bannerProducts);
    if (!error) {
      fetchData();
      toast.success("Produk Banner berhasil dipulihkan!");
    } else {
      toast.error("Gagal memulihkan produk banner");
    }
  };



  return {
    products,
    materials,
    employees,
    customers,
    suppliers,
    users,
    categories,
    machines,
    loading,
    refresh: fetchData,
    addProduct,
    updateProduct,
    deleteProduct,
    addItem,
    updateItem,
    deleteItem,
    addProfile,
    seedBannerProducts,
    fetchStockLogs,
    fetchMachineLogs,
  };
}
