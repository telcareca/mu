// Tipagens compartilhadas dos dados editáveis pelo painel admin
export interface ProductDetail {
  label: string;
  value: string;
}

export interface ProductSettings {
  id: number;
  title: string;
  description: string;
  price: number;
  installments_text: string;
  coupon_code: string;
  coupon_label: string;
  location_neighborhood: string;
  location_city: string;
  location_state: string;
  location_cep: string;
  photos: string[];
  details: ProductDetail[];
}

export interface SellerSettings {
  id: number;
  name: string;
  masked_name: string;
  masked_cpf: string;
  avatar_url: string;
  verified: boolean;
  last_seen_text: string;
  member_since_text: string;
  location_neighborhood: string;
  location_city: string;
  location_state: string;
  location_cep: string;
  profile_url: string;
  sales_completed: string;
  sales_cancelled: string;
  avg_dispatch_time: string;
}

export interface CouponItem {
  code: string;
  discount: number;
}

export interface CheckoutSettings {
  id: number;
  warranty_price: number;
  shipping_original: number;
  shipping_final: number;
  shipping_days: string;
  pickup_location: string;
  coupons: CouponItem[];
}

// Defaults usados como fallback enquanto carrega ou se a tabela falhar
export const DEFAULT_PRODUCT: ProductSettings = {
  id: 1,
  title: "Nintendo Switch V2 NOVO – Completo na Caixa",
  description: `Nintendo Switch V2 NOVO – Completo na Caixa

Foi presente de aniversário para o meu filho, está praticamente sem uso, novinho mesmo. Mas estou precisando levantar dinheiro urgente para pagar contas, então estou vendendo

✔️ Sem detalhes
✔️ Completo com todos acessórios
✔️ Pouquíssimo uso
✔️ Funcionando perfeitamente

🎮 Acompanha jogos: Mario, Zelda e Pokémon

💰 Valor: R$ 750,00`,
  price: 750,
  installments_text: "3x sem juros de R$ 250,00",
  coupon_code: "QUERO50",
  coupon_label: "R$ 50 OFF",
  location_neighborhood: "Vila Cruzeiro",
  location_city: "São Paulo",
  location_state: "SP",
  location_cep: "04726010",
  photos: [
    "/switch-main.jpg",
    "/switch-photo2.jpg",
    "/switch-photo3.jpg",
    "/switch-photo4.jpg",
    "/switch-photo5.jpg",
  ],
  details: [
    { label: "Categoria", value: "Consoles De Vídeo Game" },
    { label: "Marca do Console", value: "Nintendo" },
    { label: "Modelo", value: "Nintendo Switch" },
    { label: "Condição", value: "Novo" },
    { label: "Características", value: "Inclui Cabos, Inclui Caixa, Inclui Controles, Inclui Jogos" },
    { label: "Aceita trocas", value: "Não" },
  ],
};

export const DEFAULT_SELLER: SellerSettings = {
  id: 1,
  name: "Neuza",
  masked_name: "Neuza M*** S****",
  masked_cpf: "*** *** *** **",
  avatar_url: "/images/neuza.jpg",
  verified: true,
  last_seen_text: "Último acesso há 21 min",
  member_since_text: "Na OLX desde outubro de 2013",
  location_neighborhood: "Vila Cruzeiro",
  location_city: "São Paulo",
  location_state: "SP",
  location_cep: "04726010",
  profile_url: "https://conta.olx.com.br/acesso?action_type=FAVORITES&list_id=1494050970",
  sales_completed: "01",
  sales_cancelled: "00",
  avg_dispatch_time: "20 horas",
};

export const DEFAULT_CHECKOUT: CheckoutSettings = {
  id: 1,
  warranty_price: 196.99,
  shipping_original: 41.72,
  shipping_final: 13.82,
  shipping_days: "Até 5 dias úteis",
  pickup_location: "Vila Cruzeiro, São Paulo - SP",
  coupons: [
    { code: "QUERO50", discount: 50 },
    { code: "DESCONTO20", discount: 20 },
    { code: "AMO25", discount: 25 },
  ],
};
