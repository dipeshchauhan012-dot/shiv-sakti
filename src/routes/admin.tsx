import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";
import { 
  KeyRound, LogOut, Utensils, FolderOpen, Image, Calendar, 
  PartyPopper, MessageSquare, Plus, Edit2, Trash2, Check, X, 
  Search, ShieldAlert, Loader2, Star, Phone, ShoppingBag, 
  User, MapPin, Eye, FileText, CheckCircle2, Info
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: `Admin Panel · ${SITE.name}` },
      { name: "robots", content: "noindex, nofollow" }
    ],
  }),
  component: AdminPage,
});

type Tab = "menu" | "categories" | "gallery" | "bookings";
type BookingsSubTab = "reservations" | "banquet" | "contact";

function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  
  // Auth Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<Tab>("menu");
  const [bookingsTab, setBookingsTab] = useState<BookingsSubTab>("reservations");

  // Database Data States
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [banquetEnquiries, setBanquetEnquiries] = useState<any[]>([]);
  const [contactLeads, setContactLeads] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modals / Editor States
  const [editItem, setEditItem] = useState<any | null>(null);
  const [editCategory, setEditCategory] = useState<any | null>(null);
  const [editGallery, setEditGallery] = useState<any | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // Upload state
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Check if session is already active in localStorage
    const isAdmin = localStorage.getItem("shiv_shakti_admin") === "true";
    if (isAdmin) {
      setSession({ user: { email: "admin@shivshakti.com" } });
    }
    setLoadingSession(false);
  }, []);

  // Fetch all dashboard data when session is active
  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  async function fetchDashboardData() {
    setLoadingData(true);
    try {
      const [
        { data: items, error: errItems },
        { data: cats, error: errCats },
        { data: gal, error: errGal },
        { data: resv, error: errResv },
        { data: banq, error: errBanq },
        { data: leads, error: errLeads }
      ] = await Promise.all([
        supabase.from("menu_items").select("*").order("sort_order"),
        supabase.from("menu_categories").select("*").order("sort_order"),
        supabase.from("gallery").select("*").order("sort_order"),
        supabase.from("reservations").select("*").order("created_at", { ascending: false }),
        supabase.from("banquet_enquiries").select("*").order("created_at", { ascending: false }),
        supabase.from("contact_leads").select("*").order("created_at", { ascending: false })
      ]);

      if (errItems) throw errItems;
      if (errCats) throw errCats;
      if (errGal) throw errGal;
      if (errResv) throw errResv;
      if (errBanq) throw errBanq;
      if (errLeads) throw errLeads;

      setMenuItems(items || []);
      setCategories(cats || []);
      setGalleryItems(gal || []);
      setReservations(resv || []);
      setBanquetEnquiries(banq || []);
      setContactLeads(leads || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load dashboard data: " + err.message);
    } finally {
      setLoadingData(false);
    }
  }

  // Authentication Handlers
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoggingIn(true);
    
    if (email.trim() === "admin" && password.trim() === "ShivShakti@2026") {
      localStorage.setItem("shiv_shakti_admin", "true");
      setSession({ user: { email: "admin@shivshakti.com" } });
      toast.success("Welcome back, Admin!");
    } else {
      toast.error("Invalid Username or Password");
    }
    setLoggingIn(false);
  }

  async function handleLogout() {
    localStorage.removeItem("shiv_shakti_admin");
    setSession(null);
    toast.success("Logged out successfully");
  }

  // Storage Upload Handler
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      
      // Try uploading to public bucket named 'gallery'
      const { data, error } = await supabase.storage
        .from("gallery")
        .upload(fileName, file);

      if (error) {
        // Fallback to 'photos' bucket if 'gallery' fails
        const { error: err2 } = await supabase.storage
          .from("photos")
          .upload(fileName, file);
        if (err2) throw new Error("Could not upload. Please paste a URL directly.");
        
        const { data: urlData } = supabase.storage.from("photos").getPublicUrl(fileName);
        setUrl(urlData.publicUrl);
      } else {
        const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(fileName);
        setUrl(urlData.publicUrl);
      }
      toast.success("File uploaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  // Item Mutations
  async function toggleAvailability(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from("menu_items")
        .update({ is_available: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      
      setMenuItems(prev => prev.map(item => item.id === id ? { ...item, is_available: !currentStatus } : item));
      toast.success("Availability updated");
    } catch (err: any) {
      toast.error("Failed to update status: " + err.message);
    }
  }

  async function deleteMenuItem(id: string) {
    if (!window.confirm("Are you sure you want to delete this dish?")) return;
    try {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw error;
      setMenuItems(prev => prev.filter(item => item.id !== id));
      toast.success("Dish deleted");
    } catch (err: any) {
      toast.error("Delete failed: " + err.message);
    }
  }

  async function handleSaveMenuItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      price: Number(fd.get("price")),
      category_id: fd.get("category_id") as string,
      description: fd.get("description") as string || null,
      image_url: fd.get("image_url") as string || null,
      is_veg: fd.get("is_veg") === "on",
      is_available: fd.get("is_available") === "on",
      is_special: fd.get("is_special") === "on",
      is_popular: fd.get("is_popular") === "on",
      is_featured: fd.get("is_featured") === "on",
      sort_order: Number(fd.get("sort_order") || 10),
    };

    try {
      if (editItem && editItem.id) {
        // Edit Mode
        const { error } = await supabase
          .from("menu_items")
          .update(payload)
          .eq("id", editItem.id);
        if (error) throw error;
        toast.success("Dish updated!");
      } else {
        // Create Mode
        const { error } = await supabase.from("menu_items").insert([payload]);
        if (error) throw error;
        toast.success("New dish added!");
      }
      setShowItemModal(false);
      setEditItem(null);
      fetchDashboardData();
    } catch (err: any) {
      toast.error("Save failed: " + err.message);
    }
  }

  // Category Mutations
  async function handleSaveCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const payload = {
      name,
      slug,
      is_active: fd.get("is_active") === "on",
      sort_order: Number(fd.get("sort_order") || 10),
    };

    try {
      if (editCategory && editCategory.id) {
        const { error } = await supabase
          .from("menu_categories")
          .update(payload)
          .eq("id", editCategory.id);
        if (error) throw error;
        toast.success("Category updated!");
      } else {
        const { error } = await supabase.from("menu_categories").insert([payload]);
        if (error) throw error;
        toast.success("Category created!");
      }
      setShowCategoryModal(false);
      setEditCategory(null);
      fetchDashboardData();
    } catch (err: any) {
      toast.error("Save failed: " + err.message);
    }
  }

  async function deleteCategory(id: string) {
    if (!window.confirm("Deleting category will not delete its items, but they will become orphaned. Continue?")) return;
    try {
      const { error } = await supabase.from("menu_categories").delete().eq("id", id);
      if (error) throw error;
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success("Category deleted");
    } catch (err: any) {
      toast.error("Delete failed: " + err.message);
    }
  }

  // Gallery Mutations
  async function handleSaveGallery(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get("title") as string || null,
      image_url: fd.get("image_url") as string,
      category: fd.get("category") as string || null,
      is_active: fd.get("is_active") === "on",
      sort_order: Number(fd.get("sort_order") || 10),
    };

    if (!payload.image_url) {
      toast.error("Image URL or Upload is required");
      return;
    }

    try {
      if (editGallery && editGallery.id) {
        const { error } = await supabase
          .from("gallery")
          .update(payload)
          .eq("id", editGallery.id);
        if (error) throw error;
        toast.success("Photo updated!");
      } else {
        const { error } = await supabase.from("gallery").insert([payload]);
        if (error) throw error;
        toast.success("Photo added to gallery!");
      }
      setShowGalleryModal(false);
      setEditGallery(null);
      fetchDashboardData();
    } catch (err: any) {
      toast.error("Save failed: " + err.message);
    }
  }

  async function deleteGalleryItem(id: string) {
    if (!window.confirm("Delete this photo from gallery?")) return;
    try {
      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (error) throw error;
      setGalleryItems(prev => prev.filter(g => g.id !== id));
      toast.success("Photo removed");
    } catch (err: any) {
      toast.error("Delete failed: " + err.message);
    }
  }

  // Booking / Enquiry Mutations
  async function updateReservationStatus(id: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from("reservations")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      toast.success("Reservation status updated");
    } catch (err: any) {
      toast.error("Update failed: " + err.message);
    }
  }

  async function updateBanquetStatus(id: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from("banquet_enquiries")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
      setBanquetEnquiries(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
      toast.success("Banquet enquiry status updated");
    } catch (err: any) {
      toast.error("Update failed: " + err.message);
    }
  }

  async function toggleLeadHandled(id: string, current: boolean) {
    try {
      const { error } = await supabase
        .from("contact_leads")
        .update({ handled: !current })
        .eq("id", id);
      if (error) throw error;
      setContactLeads(prev => prev.map(l => l.id === id ? { ...l, handled: !current } : l));
      toast.success("Lead status updated");
    } catch (err: any) {
      toast.error("Update failed: " + err.message);
    }
  }

  // Filters calculation
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || item.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Loading indicator for Session auth check
  if (loadingSession) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-background text-foreground gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-sm font-medium tracking-wider">Verifying Admin Session...</p>
      </div>
    );
  }

  // Login Page View
  if (!session) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
          {/* Subtle backgrounds */}
          <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-secondary/5 blur-[80px]" />
          <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-primary/5 blur-[80px]" />
          
          <div className="w-full max-w-md card-premium p-8 relative z-10 space-y-6">
            <div className="text-center space-y-2">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground font-display text-2xl mx-auto shadow-md">श</span>
              <h1 className="text-2xl md:text-3xl font-display mt-2 tracking-tight">Admin Dashboard</h1>
              <p className="text-xs uppercase tracking-[0.2em] text-secondary font-medium">Shiv Shakti Restaurant</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <label className="block space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Username</span>
                <input 
                  type="text" 
                  required
                  placeholder="admin" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 text-foreground transition-all"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Password</span>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 text-foreground transition-all"
                />
              </label>

              <button 
                type="submit" 
                disabled={loggingIn}
                className="w-full btn-gold rounded-lg py-3 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <KeyRound className="h-4 w-4" />
                {loggingIn ? "Logging in..." : "Login Securely"}
              </button>
            </form>

            <div className="pt-2 text-center text-[10px] text-muted-foreground/80 flex items-center gap-1.5 justify-center">
              <Info className="h-3 w-3" />
              Enter your admin username and password.
            </div>
          </div>
        </div>
      </>
    );
  }

  // Dashboard Page View
  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Admin Header */}
        <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-30">
          <div className="container-x flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground font-display text-base">श</span>
              <div className="leading-tight">
                <h2 className="font-display text-base md:text-lg text-primary">{SITE.short} Admin</h2>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Management Panel</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={fetchDashboardData}
                disabled={loadingData}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:border-secondary transition-colors"
              >
                {loadingData ? "Refreshing..." : "Refresh Data"}
              </button>
              <button 
                onClick={handleLogout}
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/25 transition-colors flex items-center gap-1"
              >
                <LogOut className="h-3 w-3" /> Log Out
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Shell */}
        <main className="container-x py-8 flex-1 flex flex-col gap-6">
          {/* Summary Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-premium p-5 flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Active Dishes</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-display text-primary">{menuItems.filter(i=>i.is_available).length}</span>
                <span className="text-xs text-muted-foreground">/ {menuItems.length} total</span>
              </div>
            </div>
            <div className="card-premium p-5 flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Pending Bookings</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-display text-secondary">
                  {reservations.filter(r=>r.status==="pending").length + banquetEnquiries.filter(b=>b.status==="pending").length}
                </span>
                <span className="text-xs text-muted-foreground">Requires attention</span>
              </div>
            </div>
            <div className="card-premium p-5 flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Banquet Enquiries</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-display text-primary">{banquetEnquiries.length}</span>
                <span className="text-xs text-muted-foreground">Total queries</span>
              </div>
            </div>
            <div className="card-premium p-5 flex flex-col justify-between">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Contact Leads</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-display text-primary">{contactLeads.filter(l=>!l.handled).length}</span>
                <span className="text-xs text-muted-foreground">Unhandled queries</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border/80 overflow-x-auto gap-2 md:gap-4 scrollbar-none">
            <TabButton active={activeTab === "menu"} onClick={() => setActiveTab("menu")} icon={<Utensils className="h-4 w-4" />} label="Menu Items" />
            <TabButton active={activeTab === "categories"} onClick={() => setActiveTab("categories")} icon={<FolderOpen className="h-4 w-4" />} label="Categories" />
            <TabButton active={activeTab === "gallery"} onClick={() => setActiveTab("gallery")} icon={<Image className="h-4 w-4" />} label="Photo Gallery" />
            <TabButton active={activeTab === "bookings"} onClick={() => setActiveTab("bookings")} icon={<Calendar className="h-4 w-4" />} label="Bookings & Leads" />
          </div>

          {/* Main Tab Contents */}
          <div className="flex-1">
            {loadingData && (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Loading database tables...</p>
              </div>
            )}

            {!loadingData && activeTab === "menu" && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-card/40 p-4 rounded-xl border border-border">
                  {/* Filters & Search */}
                  <div className="flex flex-1 flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input 
                        type="text" 
                        placeholder="Search items..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full rounded-full border border-border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/35 text-foreground"
                      />
                    </div>
                    <select
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                      className="rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:border-secondary"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <button 
                    onClick={() => { setEditItem(null); setShowItemModal(true); }}
                    className="btn-gold text-xs font-semibold px-4 py-2 rounded-full inline-flex items-center gap-1.5 justify-center cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Add New Dish
                  </button>
                </div>

                <div className="overflow-x-auto border border-border rounded-xl bg-card/20">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-card/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                        <th className="p-4 font-semibold">Dish Name</th>
                        <th className="p-4 font-semibold">Category</th>
                        <th className="p-4 font-semibold text-right">Price</th>
                        <th className="p-4 font-semibold text-center">Veg</th>
                        <th className="p-4 font-semibold text-center">Status</th>
                        <th className="p-4 font-semibold text-center">Badges</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMenuItems.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-muted-foreground">No dishes found. Add a dish to get started!</td>
                        </tr>
                      ) : (
                        filteredMenuItems.map(item => {
                          const catName = categories.find(c => c.id === item.category_id)?.name || "Uncategorized";
                          return (
                            <tr key={item.id} className="border-b border-border/60 hover:bg-card/40 transition-colors">
                              <td className="p-4">
                                <div className="font-semibold text-foreground">{item.name}</div>
                                {item.description && <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5 max-w-sm">{item.description}</div>}
                              </td>
                              <td className="p-4 text-muted-foreground">{catName}</td>
                              <td className="p-4 text-right font-semibold text-primary">₹{item.price}</td>
                              <td className="p-4 text-center">
                                <span className={`inline-grid h-4.5 w-4.5 place-items-center border rounded-sm ${item.is_veg ? "border-green-700 bg-green-50" : "border-red-700 bg-red-50"} mx-auto`}>
                                  <span className={`h-2.5 w-2.5 rounded-full ${item.is_veg ? "bg-green-700" : "bg-red-700"}`} />
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <button 
                                  onClick={() => toggleAvailability(item.id, item.is_available)}
                                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase cursor-pointer transition-colors ${item.is_available ? "bg-green-500/10 text-green-500 border border-green-500/25" : "bg-destructive/10 text-destructive border border-destructive/20"}`}
                                >
                                  {item.is_available ? "Available" : "Sold Out"}
                                </button>
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex gap-1 justify-center flex-wrap max-w-xs mx-auto">
                                  {item.is_special && <span className="bg-secondary/15 text-secondary text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">Special</span>}
                                  {item.is_popular && <span className="bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">Popular</span>}
                                  {item.is_featured && <span className="bg-blue-500/10 text-blue-500 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">Featured</span>}
                                </div>
                              </td>
                              <td className="p-4 text-right space-x-1.5">
                                <button 
                                  onClick={() => { setEditItem(item); setShowItemModal(true); }}
                                  className="p-1.5 rounded-lg border border-border text-foreground hover:border-secondary hover:text-secondary transition-colors cursor-pointer inline-flex items-center"
                                  title="Edit Dish"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button 
                                  onClick={() => deleteMenuItem(item.id)}
                                  className="p-1.5 rounded-lg border border-border text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors cursor-pointer inline-flex items-center"
                                  title="Delete Dish"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!loadingData && activeTab === "categories" && (
              <div className="space-y-4 max-w-3xl">
                <div className="flex justify-between items-center bg-card/40 p-4 rounded-xl border border-border">
                  <h3 className="font-display text-lg text-primary">Menu Categories</h3>
                  <button 
                    onClick={() => { setEditCategory(null); setShowCategoryModal(true); }}
                    className="btn-gold text-xs font-semibold px-4 py-2 rounded-full inline-flex items-center gap-1.5 justify-center cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Add Category
                  </button>
                </div>

                <div className="overflow-x-auto border border-border rounded-xl bg-card/20">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-card/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                        <th className="p-4 font-semibold">Category Name</th>
                        <th className="p-4 font-semibold">Url Slug</th>
                        <th className="p-4 font-semibold text-center">Sort Order</th>
                        <th className="p-4 font-semibold text-center">Status</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">No categories yet. Create one!</td>
                        </tr>
                      ) : (
                        categories.map(c => (
                          <tr key={c.id} className="border-b border-border/60 hover:bg-card/40 transition-colors">
                            <td className="p-4 font-semibold text-foreground">{c.name}</td>
                            <td className="p-4 text-muted-foreground font-mono text-xs">{c.slug}</td>
                            <td className="p-4 text-center text-foreground">{c.sort_order}</td>
                            <td className="p-4 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${c.is_active ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-muted text-muted-foreground border-border"}`}>
                                {c.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-1.5">
                              <button 
                                onClick={() => { setEditCategory(c); setShowCategoryModal(true); }}
                                className="p-1.5 rounded-lg border border-border text-foreground hover:border-secondary hover:text-secondary transition-colors cursor-pointer inline-flex items-center"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => deleteCategory(c.id)}
                                className="p-1.5 rounded-lg border border-border text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors cursor-pointer inline-flex items-center"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!loadingData && activeTab === "gallery" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-card/40 p-4 rounded-xl border border-border">
                  <h3 className="font-display text-lg text-primary">Photo Gallery Manager</h3>
                  <button 
                    onClick={() => { setEditGallery(null); setShowGalleryModal(true); }}
                    className="btn-gold text-xs font-semibold px-4 py-2 rounded-full inline-flex items-center gap-1.5 justify-center cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Add Photo
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {galleryItems.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-muted-foreground">No photos in gallery. Add a photo to get started!</div>
                  ) : (
                    galleryItems.map(photo => (
                      <div key={photo.id} className="card-premium p-3 relative group overflow-hidden flex flex-col justify-between">
                        <div className="aspect-video w-full rounded-lg overflow-hidden border border-border bg-muted">
                          <img src={photo.image_url} alt={photo.title || "Gallery"} className="h-full w-full object-cover" />
                        </div>
                        <div className="mt-3">
                          <h4 className="font-semibold text-xs truncate text-foreground">{photo.title || "Untitled Photo"}</h4>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                            <span>Order: {photo.sort_order}</span>
                            <span className={photo.is_active ? "text-green-500" : "text-destructive"}>
                              {photo.is_active ? "Active" : "Hidden"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1.5 mt-3 justify-end">
                          <button 
                            onClick={() => { setEditGallery(photo); setShowGalleryModal(true); }}
                            className="p-1 rounded bg-card border border-border text-foreground hover:border-secondary hover:text-secondary cursor-pointer inline-flex"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button 
                            onClick={() => deleteGalleryItem(photo.id)}
                            className="p-1 rounded bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 cursor-pointer inline-flex"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {!loadingData && activeTab === "bookings" && (
              <div className="space-y-6">
                {/* Sub tabs for Bookings */}
                <div className="flex gap-2 bg-card/60 p-1.5 rounded-lg border border-border w-fit">
                  <button 
                    onClick={() => setBookingsTab("reservations")}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${bookingsTab === "reservations" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Table Reservations ({reservations.length})
                  </button>
                  <button 
                    onClick={() => setBookingsTab("banquet")}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${bookingsTab === "banquet" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Banquet Enquiries ({banquetEnquiries.length})
                  </button>
                  <button 
                    onClick={() => setBookingsTab("contact")}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${bookingsTab === "contact" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Contact Leads ({contactLeads.length})
                  </button>
                </div>

                {/* Sub Tab Contents */}
                <div className="border border-border bg-card/25 rounded-xl overflow-hidden">
                  {bookingsTab === "reservations" && (
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-card/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                          <th className="p-4">Customer</th>
                          <th className="p-4">Details</th>
                          <th className="p-4">Booking Date/Time</th>
                          <th className="p-4">Requests</th>
                          <th className="p-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservations.length === 0 ? (
                          <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No table reservations logged yet.</td></tr>
                        ) : (
                          reservations.map(res => (
                            <tr key={res.id} className="border-b border-border/60 hover:bg-card/40 transition-colors">
                              <td className="p-4">
                                <div className="font-semibold text-foreground flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-secondary" /> {res.name}</div>
                                <a href={`tel:${res.phone}`} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1 font-mono"><Phone className="h-3 w-3" /> {res.phone}</a>
                              </td>
                              <td className="p-4">
                                <span className="font-medium text-foreground">{res.guest_count} Guests</span>
                              </td>
                              <td className="p-4">
                                <div className="font-medium text-foreground">{res.reservation_date}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{res.reservation_time}</div>
                              </td>
                              <td className="p-4 text-muted-foreground italic text-xs max-w-xs">{res.special_request || "—"}</td>
                              <td className="p-4 text-center">
                                <select 
                                  value={res.status}
                                  onChange={e => updateReservationStatus(res.id, e.target.value)}
                                  className={`rounded-lg border px-3 py-1.5 text-xs focus:outline-none font-semibold cursor-pointer ${res.status === "confirmed" ? "bg-green-500/10 border-green-500/30 text-green-500" : res.status === "cancelled" ? "bg-destructive/10 border-destructive/25 text-destructive" : "bg-secondary/15 border-secondary/30 text-secondary"}`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}

                  {bookingsTab === "banquet" && (
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-card/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                          <th className="p-4">Enquirer</th>
                          <th className="p-4">Event Type</th>
                          <th className="p-4">Guests</th>
                          <th className="p-4">Event Date</th>
                          <th className="p-4">Notes</th>
                          <th className="p-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {banquetEnquiries.length === 0 ? (
                          <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No banquet enquiries logged yet.</td></tr>
                        ) : (
                          banquetEnquiries.map(enq => (
                            <tr key={enq.id} className="border-b border-border/60 hover:bg-card/40 transition-colors">
                              <td className="p-4">
                                <div className="font-semibold text-foreground flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-primary" /> {enq.name}</div>
                                <a href={`tel:${enq.phone}`} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1 font-mono"><Phone className="h-3 w-3" /> {enq.phone}</a>
                              </td>
                              <td className="p-4 font-semibold text-foreground">{enq.event_type}</td>
                              <td className="p-4 font-medium text-foreground">{enq.guest_count} Guests</td>
                              <td className="p-4 text-foreground">{enq.event_date}</td>
                              <td className="p-4 text-muted-foreground italic text-xs max-w-xs">{enq.message || "—"}</td>
                              <td className="p-4 text-center">
                                <select 
                                  value={enq.status}
                                  onChange={e => updateBanquetStatus(enq.id, e.target.value)}
                                  className={`rounded-lg border px-3 py-1.5 text-xs focus:outline-none font-semibold cursor-pointer ${enq.status === "confirmed" ? "bg-green-500/10 border-green-500/30 text-green-500" : enq.status === "cancelled" ? "bg-destructive/10 border-destructive/25 text-destructive" : "bg-secondary/15 border-secondary/30 text-secondary"}`}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}

                  {bookingsTab === "contact" && (
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-card/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                          <th className="p-4">Customer</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Message</th>
                          <th className="p-4 text-center">Handled</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contactLeads.length === 0 ? (
                          <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No contact messages received yet.</td></tr>
                        ) : (
                          contactLeads.map(lead => (
                            <tr key={lead.id} className="border-b border-border/60 hover:bg-card/40 transition-colors">
                              <td className="p-4">
                                <div className="font-semibold text-foreground flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-muted-foreground" /> {lead.name}</div>
                                <a href={`tel:${lead.phone}`} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1 font-mono"><Phone className="h-3 w-3" /> {lead.phone}</a>
                              </td>
                              <td className="p-4 font-mono text-xs text-muted-foreground">{lead.email || "—"}</td>
                              <td className="p-4 text-foreground text-xs leading-relaxed max-w-md">{lead.message}</td>
                              <td className="p-4 text-center">
                                <button 
                                  onClick={() => toggleLeadHandled(lead.id, lead.handled)}
                                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer border ${lead.handled ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-secondary/15 text-secondary border-secondary/25"}`}
                                >
                                  {lead.handled ? "Resolved" : "Open Query"}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* -------------------- MODALS & EDITORS -------------------- */}

      {/* Menu Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-lg rounded-xl border border-border p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <button 
              onClick={() => { setShowItemModal(false); setEditItem(null); }}
              className="absolute right-4 top-4 p-1 rounded-lg border border-border hover:border-secondary text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-display text-xl text-primary">{editItem ? "Edit Dish" : "Add New Dish"}</h3>
            
            <form onSubmit={handleSaveMenuItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Dish Name *</span>
                  <input type="text" name="name" required defaultValue={editItem?.name || ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-secondary text-foreground" />
                </label>
                <label className="block space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Price (₹) *</span>
                  <input type="number" name="price" required defaultValue={editItem?.price || ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-secondary text-foreground" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Category *</span>
                  <select name="category_id" required defaultValue={editItem?.category_id || ""} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-secondary text-foreground">
                    <option value="">Select category...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <label className="block space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Sort Order</span>
                  <input type="number" name="sort_order" defaultValue={editItem?.sort_order ?? 10} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-secondary text-foreground" />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Description</span>
                <textarea name="description" defaultValue={editItem?.description || ""} rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-secondary text-foreground" />
              </label>

              {/* Image Input & Upload */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block">Dish Photo</span>
                <div className="grid md:grid-cols-[1.5fr_1fr] gap-4 items-end">
                  <label className="block space-y-1 flex-1">
                    <span className="text-[9px] text-muted-foreground font-semibold">Image URL (direct links allowed)</span>
                    <input 
                      type="url" 
                      name="image_url" 
                      id="item-img-url"
                      defaultValue={editItem?.image_url || ""} 
                      placeholder="https://example.com/dish.jpg" 
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-secondary text-foreground" 
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[9px] text-muted-foreground font-semibold">Or Upload File</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => handleImageUpload(e, (url) => {
                        const input = document.getElementById("item-img-url") as HTMLInputElement;
                        if (input) input.value = url;
                      })}
                      disabled={uploading}
                      className="w-full text-xs text-muted-foreground file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-primary/10 file:text-primary file:hover:bg-primary/20 file:cursor-pointer"
                    />
                  </label>
                </div>
                {uploading && <div className="text-xs text-secondary flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin" /> Uploading image...</div>}
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-2 gap-4 bg-card/60 p-3 rounded-lg border border-border text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="is_veg" defaultChecked={editItem?.is_veg ?? true} className="rounded text-primary focus:ring-primary h-4 w-4" />
                  <span className="font-semibold">Vegetarian Dish (Veg)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="is_available" defaultChecked={editItem?.is_available ?? true} className="rounded text-primary focus:ring-primary h-4 w-4" />
                  <span className="font-semibold">In Stock (Available)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="is_special" defaultChecked={editItem?.is_special ?? false} className="rounded text-primary focus:ring-primary h-4 w-4" />
                  <span className="font-semibold">House Special Tag</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="is_popular" defaultChecked={editItem?.is_popular ?? false} className="rounded text-primary focus:ring-primary h-4 w-4" />
                  <span className="font-semibold">Most Loved Tag</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer col-span-2">
                  <input type="checkbox" name="is_featured" defaultChecked={editItem?.is_featured ?? false} className="rounded text-primary focus:ring-primary h-4 w-4" />
                  <span className="font-semibold">Chef's Featured Row (Featured Grid)</span>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={uploading}
                className="w-full btn-gold rounded-full py-2.5 font-semibold text-sm cursor-pointer disabled:opacity-50"
              >
                {editItem ? "Save Changes" : "Create Dish"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card w-full max-w-md rounded-xl border border-border p-6 shadow-2xl relative space-y-4">
            <button 
              onClick={() => { setShowCategoryModal(false); setEditCategory(null); }}
              className="absolute right-4 top-4 p-1 rounded-lg border border-border hover:border-secondary text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-display text-xl text-primary">{editCategory ? "Edit Category" : "Add Category"}</h3>
            
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <label className="block space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Category Name *</span>
                <input type="text" name="name" required defaultValue={editCategory?.name || ""} placeholder="e.g. Punjabi Dishes, Indo-Chinese" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-secondary text-foreground" />
              </label>

              <label className="block space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Sort Order</span>
                <input type="number" name="sort_order" defaultValue={editCategory?.sort_order ?? 10} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-secondary text-foreground" />
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-card/60 p-3 rounded-lg border border-border text-xs">
                <input type="checkbox" name="is_active" defaultChecked={editCategory?.is_active ?? true} className="rounded text-primary focus:ring-primary h-4 w-4" />
                <span className="font-semibold">Category is active (visible in menu)</span>
              </label>

              <button 
                type="submit" 
                className="w-full btn-gold rounded-full py-2.5 font-semibold text-sm cursor-pointer"
              >
                {editCategory ? "Save Changes" : "Create Category"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card w-full max-w-md rounded-xl border border-border p-6 shadow-2xl relative space-y-4">
            <button 
              onClick={() => { setShowGalleryModal(false); setEditGallery(null); }}
              className="absolute right-4 top-4 p-1 rounded-lg border border-border hover:border-secondary text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-display text-xl text-primary">{editGallery ? "Edit Photo Details" : "Add Photo to Gallery"}</h3>
            
            <form onSubmit={handleSaveGallery} className="space-y-4">
              <label className="block space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Photo Title / Caption</span>
                <input type="text" name="title" defaultValue={editGallery?.title || ""} placeholder="e.g. Sizzling Paneer Tikka, Banquet Hall Setup" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-secondary text-foreground" />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Category / Tag</span>
                  <input type="text" name="category" defaultValue={editGallery?.category || ""} placeholder="e.g. Food, Banquet, Interior" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-secondary text-foreground" />
                </label>
                <label className="block space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Sort Order</span>
                  <input type="number" name="sort_order" defaultValue={editGallery?.sort_order ?? 10} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-secondary text-foreground" />
                </label>
              </div>

              {/* Photo Input & Upload */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block">Upload Photo *</span>
                <div className="flex flex-col gap-2">
                  <label className="block space-y-1">
                    <span className="text-[9px] text-muted-foreground font-semibold">Image URL</span>
                    <input 
                      type="url" 
                      name="image_url" 
                      id="gal-img-url"
                      defaultValue={editGallery?.image_url || ""} 
                      placeholder="https://example.com/photo.jpg" 
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-secondary text-foreground" 
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[9px] text-muted-foreground font-semibold">Or Upload File</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => handleImageUpload(e, (url) => {
                        const input = document.getElementById("gal-img-url") as HTMLInputElement;
                        if (input) input.value = url;
                      })}
                      disabled={uploading}
                      className="w-full text-xs text-muted-foreground file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-primary/10 file:text-primary file:hover:bg-primary/20 file:cursor-pointer"
                    />
                  </label>
                </div>
                {uploading && <div className="text-xs text-secondary flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin" /> Uploading photo...</div>}
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-card/60 p-3 rounded-lg border border-border text-xs">
                <input type="checkbox" name="is_active" defaultChecked={editGallery?.is_active ?? true} className="rounded text-primary focus:ring-primary h-4 w-4" />
                <span className="font-semibold">Photo is active (visible in gallery page)</span>
              </label>

              <button 
                type="submit" 
                disabled={uploading}
                className="w-full btn-gold rounded-full py-2.5 font-semibold text-sm cursor-pointer disabled:opacity-50"
              >
                {editGallery ? "Save Changes" : "Add to Gallery"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Sub components
function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-3 rounded-t-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap border-b-2 ${active ? "border-primary text-primary bg-card/40" : "border-transparent text-muted-foreground hover:text-foreground"}`}
    >
      {icon} {label}
    </button>
  );
}
