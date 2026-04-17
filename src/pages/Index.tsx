import { useNavigate } from "react-router-dom";
import { useState } from "react";
import OlxHeader from "@/components/OlxHeader";
import ProductGallery from "@/components/ProductGallery";
import ProductInfo from "@/components/ProductInfo";
import SellerCard from "@/components/SellerCard";
import PriceSection from "@/components/PriceSection";

const Index = () => {
  const navigate = useNavigate();
  const [mobileBuyAction, setMobileBuyAction] = useState<(() => void) | null>(null);

  const handleBuy = (cep?: string, shipping?: { original: string; final: string; days: string }) => {
    navigate("/checkout", { state: { cep, shipping } });
  };

  return (
    <div className="min-h-screen bg-background">
      <OlxHeader />
      <main className="max-w-[1200px] mx-auto px-4 py-4">

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0 space-y-6">
            <ProductGallery />
            <ProductInfo />
          </div>
          <div className="w-full lg:w-[340px] shrink-0 space-y-4">
            <PriceSection onBuy={handleBuy} onMobileBuy={(fn) => setMobileBuyAction(() => fn)} />
            <SellerCard />
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 lg:hidden flex gap-3 z-50">
        <button className="flex-1 border-2 border-accent text-accent font-bold py-3 rounded-full flex items-center justify-center gap-2 text-sm">
          Chat
        </button>
        <button
          onClick={() => mobileBuyAction && mobileBuyAction()}
          className="flex-1 bg-accent text-accent-foreground font-bold py-3 rounded-full flex items-center justify-center gap-2 text-sm"
        >
          Comprar
        </button>
      </div>
      <div className="h-20 lg:hidden" />
    </div>
  );
};

export default Index;
