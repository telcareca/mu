import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Check, X, Truck, MapPin, Package, Shield, Loader2, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProductSettings, useSellerSettings, useCheckoutSettings } from "@/hooks/useSiteData";
import { ProductSettings, SellerSettings, CheckoutSettings } from "@/lib/siteData";

const formatBRL = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;

function CheckoutSummary({
  onConfirm,
  activeCoupon,
  hasAddress,
  product,
  seller,
  checkout,
  total,
  discount,
}: {
  onConfirm: () => void;
  activeCoupon: string | null;
  hasAddress: boolean;
  product: ProductSettings;
  seller: SellerSettings;
  checkout: CheckoutSettings;
  total: number;
  discount: number;
}) {
  const mainPhoto = product.photos[0] || "/placeholder.svg";

  return (
    <div className="bg-card border border-border rounded-lg p-5 space-y-4">
      <h2 className="text-xl font-bold text-foreground">Resumo</h2>

      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
        <img src={mainPhoto} alt={product.title} width={56} height={56} className="rounded-lg object-cover w-14 h-14" />
        <p className="font-medium text-foreground text-sm">{product.title}</p>
      </div>

      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Vendedor: {seller.masked_name}</p>
          <p className="text-sm text-muted-foreground">CPF: {seller.masked_cpf}</p>
        </div>
        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center overflow-hidden">
          <img src={seller.avatar_url} alt={seller.name} width={40} height={40} className="rounded-full object-cover w-full h-full" />
        </div>
      </div>

      <div className="space-y-3">
        <p className="font-semibold text-foreground">Método de pagamento</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#32BCAD] rounded flex items-center justify-center">
              <span className="text-[10px] font-bold" style={{ color: "white" }}>PIX</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Pix</p>
              <p className="text-xs text-muted-foreground">A confirmação do seu pagamento é mais rápida</p>
            </div>
          </div>
          <p className="font-semibold text-foreground">{formatBRL(total)}</p>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Valor do Produto</span>
          <span className="text-foreground">{formatBRL(product.price)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Garantia da OLX</span>
          <span className="text-foreground">{formatBRL(checkout.warranty_price)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Entrega</span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground line-through">{formatBRL(checkout.shipping_original)}</span>
            <span className="text-foreground">{formatBRL(checkout.shipping_final)}</span>
          </div>
        </div>
        {activeCoupon && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cupom</span>
            <span className="text-olx-green font-medium">-{formatBRL(discount)}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-2 border-t border-border">
        <span className="font-bold text-foreground">Total a pagar</span>
        <span className="font-bold text-foreground text-lg">{formatBRL(total)}</span>
      </div>

      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <Shield size={16} className="shrink-0 mt-0.5" />
        <p>A garantia da OLX é cobrada para garantir seu reembolso em caso de problemas.</p>
      </div>

      <Button
        className={`w-full font-semibold py-6 ${hasAddress ? "bg-[#F56E00] hover:bg-[#E06500]" : "bg-[#F56E00]/50 cursor-not-allowed"}`}
        style={{ color: "white" }}
        onClick={onConfirm}
        disabled={!hasAddress}
      >
        Confirmar pagamento
      </Button>

      {!hasAddress && (
        <p className="text-[10px] text-destructive text-center font-medium">
          Adicione um endereço para confirmar o pagamento
        </p>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Ao confirmar o pagamento, você declara que está concordando com os{" "}
        <a href="#" className="text-primary hover:underline">Termos e Condições</a>{" "}
        de uso da Garantia da OLX.
      </p>
    </div>
  );
}

function CpfModal({
  onClose,
  totalAmount,
  onPixGenerated,
  product,
  seller,
  checkout,
}: {
  onClose: () => void;
  totalAmount: number;
  onPixGenerated: (pixData: { qrcode: string; copypaste: string }) => void;
  product: ProductSettings;
  seller: SellerSettings;
  checkout: CheckoutSettings;
}) {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  const handleFinalize = async () => {
    if (!name || cpf.length < 14) {
      setError("Preencha todos os campos obrigatórios corretamente.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://app.hubpague.io/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer GV9glMzKFdyolEYImSto5IOb8PSHwNhiffbL08dM",
        },
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100),
          method: "pix",
          customer: {
            name,
            email: "cliente@olx-vendas.com.br",
            phone: "(11) 99999-9999",
            document: { type: "CPF", value: cpf },
          },
          products: [{
            name: product.title,
            price: Math.round(totalAmount * 100),
            quantity: "1",
            type: "digital",
          }],
        }),
      });

      const data = await response.json();
      if (data.pix) {
        onPixGenerated(data.pix);
      } else {
        setError("Erro ao gerar pagamento. Tente novamente.");
      }
    } catch (err) {
      console.error(err);
      setError("Erro de conexão com o servidor de pagamento.");
    } finally {
      setLoading(false);
    }
  };

  const mainPhoto = product.photos[0] || "/placeholder.svg";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 sm:p-4">
      <div className="bg-card rounded-t-lg sm:rounded-lg max-w-md w-full p-5 sm:p-6 space-y-4 sm:space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-xl font-bold">Resumo</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">✕</button>
        </div>

        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <img src={mainPhoto} alt={product.title} width={56} height={56} className="rounded-lg object-cover w-14 h-14" />
          <p className="font-medium text-foreground text-sm">{product.title}</p>
        </div>

        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Vendedor: {seller.masked_name}</p>
            <p className="text-sm text-muted-foreground">CPF: {seller.masked_cpf}</p>
          </div>
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center overflow-hidden">
            <img src={seller.avatar_url} alt={seller.name} width={40} height={40} className="rounded-full object-cover w-full h-full" />
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <div className="w-6 h-6 bg-[#32BCAD] rounded flex items-center justify-center">
            <span className="text-[10px] font-bold" style={{ color: "white" }}>PIX</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Pix</p>
            <p className="text-xs text-muted-foreground">A confirmação do seu pagamento é mais rápida</p>
          </div>
          <p className="font-semibold text-foreground">{formatBRL(totalAmount)}</p>
        </div>

        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Valor do Produto</span>
            <span className="text-foreground">{formatBRL(product.price)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Garantia da OLX</span>
            <span className="text-foreground">{formatBRL(checkout.warranty_price)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Entrega</span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground line-through">{formatBRL(checkout.shipping_original)}</span>
              <span className="text-foreground">{formatBRL(checkout.shipping_final)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between py-2 border-t border-border">
          <span className="font-bold text-foreground">Total a pagar</span>
          <span className="font-bold text-foreground text-lg">{formatBRL(totalAmount)}</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nome completo*</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Preencha o nome conforme seu RG"
              className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">CPF*</label>
            <input
              type="text"
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              placeholder="000.000.000-00"
              maxLength={14}
              className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive font-medium">{error}</p>}

        <Button
          className="w-full bg-[#F56E00] hover:bg-[#E06500] font-semibold py-6 flex items-center justify-center gap-2"
          style={{ color: "white" }}
          onClick={handleFinalize}
          disabled={loading}
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : "Confirmar pagamento"}
        </Button>
      </div>
    </div>
  );
}

function PixModal({
  pixData,
  totalAmount,
  onClose,
}: {
  pixData: { qrcode: string; copypaste: string };
  totalAmount: number;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pixData.copypaste);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-md w-full p-6 space-y-6 text-center">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-xl font-bold">Pagamento via Pix</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">✕</button>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Escaneie o QR Code abaixo para pagar</p>
          <div className="bg-white p-4 rounded-lg inline-block border border-border">
            <img src={pixData.qrcode} alt="QR Code Pix" className="w-48 h-48" />
          </div>
          <p className="text-lg font-bold text-foreground">{formatBRL(totalAmount)}</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Ou copie o código abaixo:</p>
          <div className="relative">
            <textarea
              readOnly
              value={pixData.copypaste}
              className="w-full h-20 text-xs p-3 bg-muted rounded-lg border border-border resize-none focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="absolute right-2 bottom-2 bg-primary text-primary-foreground px-3 py-1 rounded text-xs font-bold flex items-center gap-1"
            >
              {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex items-start gap-3 text-left">
          <Shield size={20} className="text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-foreground">
            O pagamento é processado instantaneamente. Após a confirmação, o vendedor será notificado para realizar o envio.
          </p>
        </div>
      </div>
    </div>
  );
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: product } = useProductSettings();
  const { data: seller } = useSellerSettings();
  const { data: checkout } = useCheckoutSettings();

  const locationState = location.state as { cep?: string; shipping?: { original: string; final: string; days: string } } | null;
  const cepFromHome = locationState?.cep || "";
  const shippingFromHome = locationState?.shipping || null;
  const [showCpfModal, setShowCpfModal] = useState(false);
  const [pixData, setPixData] = useState<{ qrcode: string; copypaste: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [deliveryMethod, setDeliveryMethod] = useState("olx");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({ cep: "", rua: "", numero: "", complemento: "", referencia: "" });
  const [address, setAddress] = useState<null | { cep: string; rua: string; numero: string; complemento: string }>(null);
  const [cepLoading, setCepLoading] = useState(false);

  // Auto-fetch address from CEP passed from home page
  useEffect(() => {
    if (!cepFromHome || cepFromHome.length < 8) return;
    const fetchCep = async () => {
      setCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepFromHome}/json/`);
        const data = await res.json();
        if (!data.erro) {
          const formatted = data.cep || cepFromHome.replace(/(\d{5})(\d{3})/, "$1-$2");
          setAddressForm({
            cep: formatted,
            rua: data.logradouro || "",
            numero: "",
            complemento: "",
            referencia: "",
          });
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
      } finally {
        setCepLoading(false);
      }
    };
    fetchCep();
  }, [cepFromHome]);

  const couponMap: Record<string, number> = checkout.coupons.reduce((acc, c) => {
    acc[c.code.toUpperCase()] = c.discount;
    return acc;
  }, {} as Record<string, number>);

  const discount = appliedCoupon ? (couponMap[appliedCoupon] || 0) : 0;
  // Frete vindo da home se houver — caso contrário usa o do banco
  const shippingFinalNum = shippingFromHome
    ? parseFloat(shippingFromHome.final.replace(/[^\d,]/g, "").replace(",", "."))
    : checkout.shipping_final;
  const shippingOriginalDisplay = shippingFromHome?.original || formatBRL(checkout.shipping_original);
  const shippingFinalDisplay = shippingFromHome?.final || formatBRL(checkout.shipping_final);
  const shippingDaysDisplay = shippingFromHome?.days || checkout.shipping_days;

  const total = product.price + checkout.warranty_price + (Number.isFinite(shippingFinalNum) ? shippingFinalNum : checkout.shipping_final) - discount;

  const handleApplyCoupon = () => {
    const code = couponInput.toUpperCase().trim();
    if (couponMap[code] !== undefined) {
      setAppliedCoupon(code);
      setCouponError("");
    } else {
      setCouponError("Cupom inválido");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  const handleSaveAddress = () => {
    if (addressForm.cep && addressForm.rua && addressForm.numero) {
      setAddress({ ...addressForm });
      setShowAddressModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <button className="p-2 hover:bg-muted rounded-full" onClick={() => navigate("/")}>
            <ArrowLeft size={24} />
          </button>
          <img src="/olx-logo-new.svg" alt="OLX" className="h-6" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="flex-1 min-w-0 space-y-6">
            <h1 className="text-2xl font-bold text-foreground">Confirme sua compra</h1>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Entrega</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div
                  className={`flex-1 bg-card border-2 rounded-lg p-4 cursor-pointer transition-colors ${deliveryMethod === "olx" ? "border-primary" : "border-border"}`}
                  onClick={() => setDeliveryMethod("olx")}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <Truck className="text-primary" size={24} />
                    </div>
                    <div className="flex-1">
                      {deliveryMethod === "olx" && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">Recomendado</span>
                      )}
                      <p className="font-semibold text-foreground mt-1">Entrega pela OLX</p>
                      {address && (
                        <>
                          <p className="text-sm text-muted-foreground">{address.rua}, {address.numero}{address.complemento ? `, ${address.complemento}` : ""}</p>
                          <p className="text-sm text-muted-foreground">CEP: {address.cep}</p>
                        </>
                      )}
                      <button
                        className="text-primary text-sm font-medium mt-2 hover:underline"
                        onClick={(e) => { e.stopPropagation(); setShowAddressModal(true); }}
                      >
                        {address ? "Mudar endereço" : "Adicionar endereço"}
                      </button>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryMethod === "olx" ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                      {deliveryMethod === "olx" && <div className="w-2 h-2 bg-card rounded-full" />}
                    </div>
                  </div>
                </div>

                <div
                  className={`flex-1 bg-card border-2 rounded-lg p-4 cursor-pointer transition-colors ${deliveryMethod === "retirar" ? "border-primary" : "border-border"}`}
                  onClick={() => setDeliveryMethod("retirar")}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center shrink-0">
                      <Package className="text-muted-foreground" size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground mt-1">Retirar com vendedor</p>
                      <p className="text-sm text-muted-foreground">Combine diretamente com ele através do chat da OLX.</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                        <MapPin size={14} /> {checkout.pickup_location}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryMethod === "retirar" ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                      {deliveryMethod === "retirar" && <div className="w-2 h-2 bg-card rounded-full" />}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Prazo de entrega</h2>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Expressa</p>
                    <p className="text-sm text-muted-foreground">{shippingDaysDisplay}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground line-through">{shippingOriginalDisplay}</p>
                    <p className="font-bold text-foreground">{shippingFinalDisplay}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Saiba por que o frete não foi gratuito.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Pagamento</h2>

              <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                <p className="font-semibold text-foreground">Cupom de desconto</p>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-olx-green/10 border border-olx-green/30 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-olx-green" />
                      <span className="text-sm font-medium text-foreground">{appliedCoupon}</span>
                      <span className="text-sm text-olx-green">-R$ {discount}</span>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-muted-foreground hover:text-foreground">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Digite o código do cupom"
                      className="flex-1 border border-border rounded-lg px-3 py-2.5 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <button onClick={handleApplyCoupon} className="bg-accent text-accent-foreground px-4 py-2.5 rounded-lg text-sm font-semibold">
                      Aplicar
                    </button>
                  </div>
                )}
                {couponError && <p className="text-destructive text-xs">{couponError}</p>}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pagamentos Digitais</p>
                <div
                  className={`bg-card border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === "pix" ? "border-primary border-2" : "border-border"}`}
                  onClick={() => setPaymentMethod("pix")}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${paymentMethod === "pix" ? "bg-olx-green" : "border-2 border-muted-foreground"}`}>
                      {paymentMethod === "pix" && <Check size={12} className="text-primary-foreground" />}
                    </div>
                    <div className="w-8 h-8 bg-[#32BCAD] rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">PIX</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Pix</p>
                      <p className="text-xs text-muted-foreground">A confirmação do seu pagamento é mais rápida</p>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4 opacity-60 cursor-not-allowed">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-destructive">
                      <X size={12} className="text-primary-foreground" />
                    </div>
                    <div className="w-8 h-8 bg-[#820AD1] rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">NU</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">NuPay (Nubank)</p>
                      <p className="text-xs text-muted-foreground">Apenas para clientes Nubank</p>
                      <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded font-medium">Opção indisponível</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <a href="#" className="hover:underline">Termos de Uso</a>
                <a href="#" className="hover:underline">Política de Privacidade</a>
              </div>
            </section>
          </div>

          <div className="w-full lg:w-[380px] shrink-0 space-y-4">
            <div className="sticky top-6 space-y-4">
              <CheckoutSummary
                onConfirm={() => setShowCpfModal(true)}
                activeCoupon={appliedCoupon}
                hasAddress={!!address}
                product={product}
                seller={seller}
                checkout={checkout}
                total={total}
                discount={discount}
              />
            </div>
          </div>
        </div>
      </main>

      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Adicionar endereço</h3>
              <button onClick={() => setShowAddressModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">Adicione um endereço para confirmar o pagamento</p>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">CEP *</label>
                <div className="relative">
                  <input
                    value={addressForm.cep}
                    onChange={async (e) => {
                      const val = e.target.value;
                      setAddressForm({ ...addressForm, cep: val });
                      const digits = val.replace(/\D/g, "");
                      if (digits.length === 8) {
                        setCepLoading(true);
                        try {
                          const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
                          const data = await res.json();
                          if (!data.erro) {
                            setAddressForm(prev => ({
                              ...prev,
                              cep: data.cep || val,
                              rua: data.logradouro || prev.rua,
                              complemento: prev.complemento,
                            }));
                          }
                        } catch { /* ignore */ } finally {
                          setCepLoading(false);
                        }
                      }
                    }}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="00000-000"
                  />
                  {cepLoading && <Loader2 size={14} className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Rua *</label>
                <input value={addressForm.rua} onChange={(e) => setAddressForm({ ...addressForm, rua: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground">Número *</label>
                  <input value={addressForm.numero} onChange={(e) => setAddressForm({ ...addressForm, numero: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground">Complemento</label>
                  <input value={addressForm.complemento} onChange={(e) => setAddressForm({ ...addressForm, complemento: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Ponto de referência</label>
                <input value={addressForm.referencia} onChange={(e) => setAddressForm({ ...addressForm, referencia: e.target.value })} className="w-full border border-border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <button onClick={handleSaveAddress} className="w-full bg-accent text-accent-foreground font-bold py-3 rounded-lg text-sm hover:opacity-90 transition-opacity">
              Salvar endereço
            </button>
          </div>
        </div>
      )}

      {showCpfModal && !pixData && (
        <CpfModal
          onClose={() => setShowCpfModal(false)}
          totalAmount={total}
          onPixGenerated={(data) => setPixData(data)}
          product={product}
          seller={seller}
          checkout={checkout}
        />
      )}

      {pixData && (
        <PixModal pixData={pixData} totalAmount={total} onClose={() => { setPixData(null); setShowCpfModal(false); }} />
      )}
    </div>
  );
};

export default Checkout;
