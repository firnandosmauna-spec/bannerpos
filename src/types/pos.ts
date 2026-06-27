export interface Product {
  id: string;
  name: string;
  category: string;
  pricePerM2: number;
  unit: "m²" | "pcs" | "lembar";
  icon: string;
  color: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  width: number;
  height: number;
  quantity: number;
  material: string;
  finishing: string;
  designNote: string;
  pricePerM2: number;
  unit: string;
  totalPrice: number;
  hasDesignRequest?: boolean;
  designFee?: number;
  isDesignTimerRunning?: boolean;
  designTimerElapsed?: number;
  designTimerStart?: number | null;
}

export interface OrderHistory {
  id: string;
  orderNo: string;
  items: string;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: string;
  status: "selesai" | "proses" | "antrian" | "dp";
  time: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "banner-vinyl",
    name: "Banner Vinyl",
    category: "Banner",
    pricePerM2: 35000,
    unit: "m²",
    icon: "🖼️",
    color: "#FF6B1A",
    description: "Vinyl premium outdoor",
  },
  {
    id: "spanduk",
    name: "Spanduk",
    category: "Spanduk",
    pricePerM2: 25000,
    unit: "m²",
    icon: "📢",
    color: "#FFB347",
    description: "Spanduk kain/parasut",
  },
  {
    id: "sticker-vinyl",
    name: "Sticker Vinyl",
    category: "Sticker",
    pricePerM2: 45000,
    unit: "m²",
    icon: "🏷️",
    color: "#2ECC71",
    description: "Sticker cutting/print",
  },
  {
    id: "mmt",
    name: "MMT / Flexi",
    category: "MMT",
    pricePerM2: 20000,
    unit: "m²",
    icon: "📋",
    color: "#3498DB",
    description: "Flexi backlite/frontlite",
  },
  {
    id: "neon-box",
    name: "Neon Box",
    category: "Neon Box",
    pricePerM2: 150000,
    unit: "m²",
    icon: "💡",
    color: "#9B59B6",
    description: "Box akrilik + LED",
  },
  {
    id: "baliho",
    name: "Baliho",
    category: "Baliho",
    pricePerM2: 30000,
    unit: "m²",
    icon: "🗺️",
    color: "#E74C3C",
    description: "Cetak baliho besar",
  },
  {
    id: "roll-banner",
    name: "Roll Banner",
    category: "Banner",
    pricePerM2: 55000,
    unit: "m²",
    icon: "🎪",
    color: "#1ABC9C",
    description: "Roll up banner display",
  },
  {
    id: "backdrop",
    name: "Backdrop",
    category: "Backdrop",
    pricePerM2: 40000,
    unit: "m²",
    icon: "🎭",
    color: "#F39C12",
    description: "Backdrop event/foto",
  },
  {
    id: "cutting-sticker",
    name: "Cutting Sticker",
    category: "Sticker",
    pricePerM2: 60000,
    unit: "m²",
    icon: "✂️",
    color: "#E91E63",
    description: "Sticker cutting presisi",
  },
];

export const MATERIALS = [
  "Vinyl Premium",
  "Vinyl Glossy",
  "Vinyl Matte",
  "Parasut",
  "Flexi Korea",
  "Flexi China",
  "Akrilik 3mm",
  "Akrilik 5mm",
];

export const FINISHINGS = [
  "Tanpa Laminasi",
  "Laminasi Doff",
  "Laminasi Glossy",
  "Laminasi Anti-Gores",
];

export interface Material {
  id: string;
  name: string;
  stock: number;
  unit: string;
  minStock: number;
}

export interface StockLog {
  id: string;
  ingredient_id: string;
  ingredient_name?: string;
  type: "in" | "out";
  quantity: number;
  previous_stock: number;
  current_stock: number;
  note: string;
  created_at: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone: string;
  status: "aktif" | "nonaktif";
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalOrders: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  address: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: "admin" | "kasir";
  lastLogin?: string;
  password?: string;
  permissions?: string[];
}



export interface Purchase {
  id: string;
  purchaseNo: string;
  materialId: string;
  materialName?: string;
  supplierId: string;
  supplierName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentStatus: "lunas" | "hutang";
  purchaseDate: string;
  note: string;
}
export interface Machine {
  id: string;
  name: string;
  type: string;
  status: "aktif" | "maintenance" | "rusak";
  ipAddress?: string;
  lastService?: string;
}


