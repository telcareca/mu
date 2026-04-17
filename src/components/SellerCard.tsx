import { ShieldCheck, Clock, Calendar, Mail, Phone, UserCheck, CreditCard, Shield, Truck } from "lucide-react";
import { useSellerSettings } from "@/hooks/useSiteData";

const SellerCard = () => {
  const { data: seller } = useSellerSettings();

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            <img
              src={seller.avatar_url}
              alt={seller.name}
              width={48}
              height={48}
              className="rounded-full object-cover w-full h-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect fill='%23e0e0e0' width='48' height='48'/%3E%3Ccircle cx='24' cy='16' r='8' fill='%23999'/%3E%3Cpath d='M 24 24 Q 16 24 16 32 L 32 32 Q 32 24 24 24' fill='%23999'/%3E%3C/svg%3E";
              }}
            />
          </div>
          <div>
            <h3 className="font-bold text-foreground">{seller.name}</h3>
            {seller.verified && (
              <span className="text-xs text-olx-green font-semibold flex items-center gap-1">
                <ShieldCheck size={14} /> Conta verificada
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2"><Clock size={14} /> {seller.last_seen_text}</p>
          <p className="flex items-center gap-2"><Calendar size={14} /> {seller.member_since_text}</p>
        </div>

        <div className="space-y-1">
          <p className="font-semibold text-foreground text-sm">Localização</p>
          <p className="text-sm text-muted-foreground">{seller.location_neighborhood}</p>
          <p className="text-sm text-muted-foreground">{seller.location_city}, {seller.location_state}, {seller.location_cep}</p>
        </div>

        <a href={seller.profile_url} target="_blank" rel="noopener noreferrer" className="w-full border border-primary text-primary font-bold py-2.5 rounded-lg text-sm hover:bg-primary/5 transition-colors inline-block text-center">
          Acessar perfil do anunciante
        </a>

        <div className="border-t border-border pt-4 space-y-2 text-sm">
          <h4 className="font-bold text-foreground">Histórico de vendas</h4>
          <div className="space-y-1 text-muted-foreground">
            <p><strong className="text-foreground">{seller.sales_completed}</strong> Vendas concluídas</p>
            <p><strong className="text-foreground">{seller.sales_cancelled}</strong> Vendas canceladas</p>
            <p><strong className="text-foreground">{seller.avg_dispatch_time}</strong> Tempo médio de despacho</p>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-2">
          <h4 className="font-bold text-foreground text-sm">Informações verificadas</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Mail size={14} className="text-olx-green" /> E-mail</span>
            <span className="flex items-center gap-1.5"><Phone size={14} className="text-olx-green" /> Telefone</span>
            <span className="flex items-center gap-1.5"><UserCheck size={14} className="text-olx-green" /> Identidade</span>
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-olx-green" /> Facebook</span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-5 space-y-3">
        <h4 className="font-bold text-foreground text-sm">Este anúncio oferece</h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2"><Shield size={14} className="text-primary" /> Garantia da OLX</p>
          <p className="flex items-center gap-2"><CreditCard size={14} className="text-primary" /> Parcelamento sem juros</p>
          <p className="flex items-center gap-2"><Truck size={14} className="text-primary" /> Entrega fácil</p>
        </div>
      </div>
    </div>
  );
};

export default SellerCard;
