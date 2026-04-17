import { useEffect, useState } from "react";
import { Loader2, LogOut, Lock, Save, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  useProductSettings,
  useSellerSettings,
  useCheckoutSettings,
} from "@/hooks/useSiteData";
import {
  ProductSettings,
  SellerSettings,
  CheckoutSettings,
  ProductDetail,
  CouponItem,
  DEFAULT_PRODUCT,
  DEFAULT_SELLER,
  DEFAULT_CHECKOUT,
} from "@/lib/siteData";
import ImageUploadField from "@/components/admin/ImageUploadField";

const ADMIN_PASSWORD = "barroca";
const AUTH_KEY = "admin_authed";

// =====================================================================
// LOGIN
// =====================================================================
const LoginScreen = ({ onSuccess }: { onSuccess: () => void }) => {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "1");
      onSuccess();
    } else {
      setErr("Senha incorreta");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <form
        onSubmit={submit}
        className="bg-card border border-border rounded-xl p-8 w-full max-w-sm space-y-5 shadow-lg"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Painel Admin</h1>
          <p className="text-sm text-muted-foreground">Digite a senha para continuar</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pwd">Senha</Label>
          <Input
            id="pwd"
            type="password"
            value={pwd}
            onChange={(e) => { setPwd(e.target.value); setErr(""); }}
            autoFocus
          />
          {err && <p className="text-xs text-destructive">{err}</p>}
        </div>
        <Button type="submit" className="w-full">Entrar</Button>
      </form>
    </div>
  );
};

// =====================================================================
// PRODUCT TAB
// =====================================================================
const ProductForm = () => {
  const { data, loading, reload } = useProductSettings();
  const [form, setForm] = useState<ProductSettings>(DEFAULT_PRODUCT);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!loading) setForm(data); }, [data, loading]);

  const update = <K extends keyof ProductSettings>(k: K, v: ProductSettings[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const updatePhoto = (i: number, url: string) => {
    const photos = [...form.photos];
    photos[i] = url;
    update("photos", photos);
  };
  const addPhoto = () => update("photos", [...form.photos, ""]);
  const removePhoto = (i: number) => update("photos", form.photos.filter((_, idx) => idx !== i));

  const updateDetail = (i: number, field: keyof ProductDetail, value: string) => {
    const details = [...form.details];
    details[i] = { ...details[i], [field]: value };
    update("details", details);
  };
  const addDetail = () => update("details", [...form.details, { label: "", value: "" }]);
  const removeDetail = (i: number) => update("details", form.details.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("product_settings")
      .update({
        title: form.title,
        description: form.description,
        price: form.price,
        installments_text: form.installments_text,
        coupon_code: form.coupon_code,
        coupon_label: form.coupon_label,
        location_neighborhood: form.location_neighborhood,
        location_city: form.location_city,
        location_state: form.location_state,
        location_cep: form.location_cep,
        photos: form.photos.filter((p) => p.trim()) as any,
        details: form.details.filter((d) => d.label.trim() || d.value.trim()) as any,
      })
      .eq("id", 1);
    setSaving(false);
    if (error) toast.error("Erro: " + error.message);
    else { toast.success("Produto atualizado!"); reload(); }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-foreground">Informações do anúncio</h3>
        <div className="space-y-3">
          <div>
            <Label>Título</Label>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea
              rows={10}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Preço (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => update("price", Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Texto de parcelamento</Label>
              <Input
                value={form.installments_text}
                onChange={(e) => update("installments_text", e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Código do cupom</Label>
              <Input value={form.coupon_code} onChange={(e) => update("coupon_code", e.target.value)} />
            </div>
            <div>
              <Label>Label do cupom (ex: R$ 50 OFF)</Label>
              <Input value={form.coupon_label} onChange={(e) => update("coupon_label", e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-foreground">Localização</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Bairro</Label>
            <Input value={form.location_neighborhood} onChange={(e) => update("location_neighborhood", e.target.value)} />
          </div>
          <div>
            <Label>CEP</Label>
            <Input value={form.location_cep} onChange={(e) => update("location_cep", e.target.value)} />
          </div>
          <div>
            <Label>Cidade</Label>
            <Input value={form.location_city} onChange={(e) => update("location_city", e.target.value)} />
          </div>
          <div>
            <Label>Estado (UF)</Label>
            <Input value={form.location_state} onChange={(e) => update("location_state", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Galeria de fotos</h3>
          <Button size="sm" variant="outline" onClick={addPhoto}>
            <Plus className="w-4 h-4 mr-1" /> Adicionar foto
          </Button>
        </div>
        <div className="space-y-3">
          {form.photos.map((url, i) => (
            <div key={i} className="border border-border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Foto {i + 1}</span>
                <Button size="sm" variant="ghost" onClick={() => removePhoto(i)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              <ImageUploadField
                value={url}
                onChange={(v) => updatePhoto(i, v)}
                prefix="product"
                preview="wide"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Detalhes técnicos</h3>
          <Button size="sm" variant="outline" onClick={addDetail}>
            <Plus className="w-4 h-4 mr-1" /> Adicionar
          </Button>
        </div>
        <div className="space-y-2">
          {form.details.map((d, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-center">
              <Input
                placeholder="Label"
                value={d.label}
                onChange={(e) => updateDetail(i, "label", e.target.value)}
              />
              <Input
                placeholder="Valor"
                value={d.value}
                onChange={(e) => updateDetail(i, "value", e.target.value)}
              />
              <Button size="sm" variant="ghost" onClick={() => removeDetail(i)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
        {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
        Salvar alterações
      </Button>
    </div>
  );
};

// =====================================================================
// SELLER TAB
// =====================================================================
const SellerForm = () => {
  const { data, loading, reload } = useSellerSettings();
  const [form, setForm] = useState<SellerSettings>(DEFAULT_SELLER);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!loading) setForm(data); }, [data, loading]);

  const update = <K extends keyof SellerSettings>(k: K, v: SellerSettings[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("seller_settings")
      .update({ ...form, id: undefined })
      .eq("id", 1);
    setSaving(false);
    if (error) toast.error("Erro: " + error.message);
    else { toast.success("Vendedor atualizado!"); reload(); }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-foreground">Foto e identificação</h3>
        <ImageUploadField
          label="Foto do vendedor (aparece na página e no checkout)"
          value={form.avatar_url}
          onChange={(v) => update("avatar_url", v)}
          prefix="seller"
          preview="circle"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Nome exibido na página</Label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div>
            <Label>Nome mascarado (checkout)</Label>
            <Input
              value={form.masked_name}
              onChange={(e) => update("masked_name", e.target.value)}
              placeholder="Ex: Neuza M*** S****"
            />
          </div>
          <div>
            <Label>CPF mascarado (checkout)</Label>
            <Input
              value={form.masked_cpf}
              onChange={(e) => update("masked_cpf", e.target.value)}
              placeholder="*** *** *** **"
            />
          </div>
          <div className="flex items-center gap-2 pt-7">
            <input
              id="verified"
              type="checkbox"
              checked={form.verified}
              onChange={(e) => update("verified", e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="verified" className="cursor-pointer">Conta verificada</Label>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-foreground">Status e datas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Último acesso (texto)</Label>
            <Input value={form.last_seen_text} onChange={(e) => update("last_seen_text", e.target.value)} />
          </div>
          <div>
            <Label>Membro desde (texto)</Label>
            <Input value={form.member_since_text} onChange={(e) => update("member_since_text", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-foreground">Localização do vendedor</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Bairro</Label>
            <Input value={form.location_neighborhood} onChange={(e) => update("location_neighborhood", e.target.value)} />
          </div>
          <div>
            <Label>CEP</Label>
            <Input value={form.location_cep} onChange={(e) => update("location_cep", e.target.value)} />
          </div>
          <div>
            <Label>Cidade</Label>
            <Input value={form.location_city} onChange={(e) => update("location_city", e.target.value)} />
          </div>
          <div>
            <Label>Estado (UF)</Label>
            <Input value={form.location_state} onChange={(e) => update("location_state", e.target.value)} />
          </div>
        </div>
        <div>
          <Label>URL do perfil OLX (botão "Acessar perfil")</Label>
          <Input value={form.profile_url} onChange={(e) => update("profile_url", e.target.value)} />
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-bold text-foreground">Histórico</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label>Vendas concluídas</Label>
            <Input value={form.sales_completed} onChange={(e) => update("sales_completed", e.target.value)} />
          </div>
          <div>
            <Label>Vendas canceladas</Label>
            <Input value={form.sales_cancelled} onChange={(e) => update("sales_cancelled", e.target.value)} />
          </div>
          <div>
            <Label>Tempo médio de despacho</Label>
            <Input value={form.avg_dispatch_time} onChange={(e) => update("avg_dispatch_time", e.target.value)} />
          </div>
        </div>
      </section>

      <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
        {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
        Salvar alterações
      </Button>
    </div>
  );
};

// =====================================================================
// CHECKOUT TAB
// =====================================================================
const CheckoutForm = () => {
  const { data, loading, reload } = useCheckoutSettings();
  const [form, setForm] = useState<CheckoutSettings>(DEFAULT_CHECKOUT);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!loading) setForm(data); }, [data, loading]);

  const update = <K extends keyof CheckoutSettings>(k: K, v: CheckoutSettings[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const updateCoupon = (i: number, field: keyof CouponItem, value: string) => {
    const coupons = [...form.coupons];
    coupons[i] = {
      ...coupons[i],
      [field]: field === "discount" ? Number(value) : value,
    };
    update("coupons", coupons);
  };
  const addCoupon = () => update("coupons", [...form.coupons, { code: "", discount: 0 }]);
  const removeCoupon = (i: number) => update("coupons", form.coupons.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("checkout_settings")
      .update({
        warranty_price: form.warranty_price,
        shipping_original: form.shipping_original,
        shipping_final: form.shipping_final,
        shipping_days: form.shipping_days,
        pickup_location: form.pickup_location,
        coupons: form.coupons.filter((c) => c.code.trim()) as any,
      })
      .eq("id", 1);
    setSaving(false);
    if (error) toast.error("Erro: " + error.message);
    else { toast.success("Checkout atualizado!"); reload(); }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-foreground">Valores do checkout</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Garantia OLX (R$)</Label>
            <Input
              type="number" step="0.01"
              value={form.warranty_price}
              onChange={(e) => update("warranty_price", Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Frete original (R$, riscado)</Label>
            <Input
              type="number" step="0.01"
              value={form.shipping_original}
              onChange={(e) => update("shipping_original", Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Frete final (R$)</Label>
            <Input
              type="number" step="0.01"
              value={form.shipping_final}
              onChange={(e) => update("shipping_final", Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Prazo de entrega (texto)</Label>
            <Input value={form.shipping_days} onChange={(e) => update("shipping_days", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Local de retirada</Label>
            <Input value={form.pickup_location} onChange={(e) => update("pickup_location", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Cupons disponíveis</h3>
          <Button size="sm" variant="outline" onClick={addCoupon}>
            <Plus className="w-4 h-4 mr-1" /> Adicionar cupom
          </Button>
        </div>
        <div className="space-y-2">
          {form.coupons.map((c, i) => (
            <div key={i} className="grid grid-cols-[1fr_120px_auto] gap-2 items-center">
              <Input
                placeholder="Código (ex: QUERO50)"
                value={c.code}
                onChange={(e) => updateCoupon(i, "code", e.target.value.toUpperCase())}
              />
              <Input
                type="number"
                placeholder="Desconto R$"
                value={c.discount}
                onChange={(e) => updateCoupon(i, "discount", e.target.value)}
              />
              <Button size="sm" variant="ghost" onClick={() => removeCoupon(i)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
        {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
        Salvar alterações
      </Button>
    </div>
  );
};

// =====================================================================
// MAIN ADMIN PAGE
// =====================================================================
const Admin = () => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === "1");

  if (!authed) return (<><Toaster /><LoginScreen onSuccess={() => setAuthed(true)} /></>);

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Toaster />
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-muted rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold text-foreground">Painel Admin</h1>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4 mr-1" /> Sair
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Tabs defaultValue="product">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="product">Produto</TabsTrigger>
            <TabsTrigger value="seller">Vendedor</TabsTrigger>
            <TabsTrigger value="checkout">Checkout</TabsTrigger>
          </TabsList>
          <TabsContent value="product"><ProductForm /></TabsContent>
          <TabsContent value="seller"><SellerForm /></TabsContent>
          <TabsContent value="checkout"><CheckoutForm /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
