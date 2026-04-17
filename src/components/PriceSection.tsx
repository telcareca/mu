import { useState, useEffect } from "react";
import { Copy, Check, ShoppingCart, MessageCircle, Shield, MapPin, Loader2 } from "lucide-react";
import { calcShippingPrice } from "@/lib/shipping";
import { useProductSettings } from "@/hooks/useSiteData";

interface ShippingData {
  original: string;
  final: string;
  days: string;
}

interface PriceSectionProps {
  onBuy: (cep?: string, shipping?: ShippingData) => void;
  onMobileBuy?: (fn: () => void) => void;
}

interface CepData {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface ShippingInfo {
  original: string;
  final: string;
  days: string;
  cepData: CepData;
}

const formatCep = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
};

const PriceSection = ({ onBuy, onMobileBuy }: PriceSectionProps) => {
  const { data: product } = useProductSettings();
  const [cep, setCep] = useState("");
  const [shipping, setShipping] = useState<ShippingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showCepWarning, setShowCepWarning] = useState(false);

  const handleCopyCoupon = () => {
    const text = product.coupon_code;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCalcFrete = async () => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length < 8) return;
    setLoading(true);
    setError("");
    setShipping(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data: CepData = await res.json();
      if (data.erro) {
        setError("CEP não encontrado. Verifique e tente novamente.");
        return;
      }
      const prices = calcShippingPrice(data.uf);
      setShipping({ ...prices, cepData: data });
    } catch {
      setError("Erro ao consultar o CEP. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyClick = () => {
    if (!shipping) {
      setShowCepWarning(true);
      const cepInput = document.getElementById("cep-input");
      if (cepInput) {
        cepInput.scrollIntoView({ behavior: "smooth", block: "center" });
        cepInput.focus();
      }
      return;
    }
    setShowCepWarning(false);
    onBuy(cep.replace(/\D/g, "") || undefined, { original: shipping.original, final: shipping.final, days: shipping.days });
  };

  useEffect(() => {
    if (onMobileBuy) {
      onMobileBuy(() => handleBuyClick());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onMobileBuy, shipping, cep]);

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <div>
          <p className="text-3xl font-bold text-foreground">R$ {Math.round(product.price)}</p>
          <p className="text-sm text-muted-foreground">{product.installments_text}</p>
          <button className="text-primary text-sm font-semibold mt-1 hover:underline">
            Mais opções de parcelamento
          </button>
        </div>

        <div className="bg-primary/15 rounded-lg p-3 flex items-center justify-between gap-3">
          <div className="flex-1">
            <p className="text-primary font-extrabold text-base">{product.coupon_label}</p>
            <p className="text-primary text-xs mt-0.5">
              Copie ou digite <strong className="text-primary">{product.coupon_code}</strong> na etapa de pagamento
            </p>
            <p className="text-primary text-[10px] mt-1">*Cupons limitados.</p>
          </div>
          <button
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 transition-colors shrink-0"
            onClick={handleCopyCoupon}
          >
            {copied ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar</>}
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-foreground text-sm">Calcule o frete</p>
            <a
              href="https://buscacepinter.correios.com.br/app/endereco/index.php"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-xs font-semibold hover:underline"
            >
              Não sei meu CEP
            </a>
          </div>
          <div className="relative">
            <input
              id="cep-input"
              type="text"
              value={cep}
              onChange={(e) => setCep(formatCep(e.target.value))}
              placeholder="Digite o CEP para ver o frete"
              maxLength={9}
              className="w-full border border-border rounded-full px-4 py-2.5 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 pr-24"
            />
            {cep.replace(/\D/g, "").length >= 8 && (
              <button
                onClick={handleCalcFrete}
                disabled={loading}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : "Calcular"}
              </button>
            )}
          </div>

          {error && <p className="text-xs text-destructive font-medium">{error}</p>}

          {shipping && (
            <div className="bg-muted rounded-lg p-3 space-y-3">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                <div className="text-xs text-foreground space-y-0.5">
                  {shipping.cepData.logradouro && <p className="font-medium">{shipping.cepData.logradouro}</p>}
                  <p>
                    {shipping.cepData.bairro && `${shipping.cepData.bairro}, `}
                    {shipping.cepData.localidade} - {shipping.cepData.uf}
                  </p>
                  <p className="text-muted-foreground">CEP: {shipping.cepData.cep}</p>
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Expressa</p>
                    <p className="text-xs text-muted-foreground">{shipping.days}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground line-through">{shipping.original}</p>
                    <p className="text-sm font-bold text-foreground">{shipping.final}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleBuyClick}
            className="w-full font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-opacity bg-accent text-accent-foreground hover:opacity-90"
          >
            <ShoppingCart size={18} /> Comprar
          </button>
          {showCepWarning && !shipping && (
            <p className="text-xs text-destructive font-medium text-center">
              Digite seu CEP acima e calcule o frete para prosseguir com a compra.
            </p>
          )}
          <button className="w-full border-2 border-accent text-accent font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-accent/5 transition-colors">
            <MessageCircle size={18} /> Chat
          </button>
        </div>

        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted rounded-lg p-3">
          <Shield size={16} className="text-olx-green mt-0.5 shrink-0" />
          <p>Pague online com garantia da OLX. Receba o que comprou ou a OLX devolve o seu dinheiro.</p>
        </div>
      </div>
    </>
  );
};

export default PriceSection;
