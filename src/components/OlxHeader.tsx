import { Search, MessageCircle, Bell, User } from "lucide-react";

const OlxHeader = () => {
  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <img src="/olx-logo-new.svg" alt="OLX" className="h-6 md:h-8" />
            <div className="hidden md:flex items-center flex-1 max-w-md">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar no estado de São Paulo"
                  className="w-full pl-4 pr-10 py-2 bg-card border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Search className="text-muted-foreground" size={18} />
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href="#" className="hidden lg:block text-foreground hover:text-primary font-semibold">
              Plano Profissional
            </a>
            <a href="https://conta.olx.com.br/acesso?action_type=FAVORITES&list_id=1494050970" target="_blank" rel="noopener noreferrer" className="hidden lg:flex items-center gap-1 text-foreground hover:text-primary font-semibold">
              <MessageCircle size={16} /> Chat
            </a>
            <a href="#" className="hidden lg:block text-foreground hover:text-primary font-semibold">
              Meus Anúncios
            </a>
            <a href="#" className="hidden md:flex items-center gap-1 text-foreground hover:text-primary font-semibold">
              <Bell size={16} /> Notificações
            </a>
            <a href="https://conta.olx.com.br/acesso?action_type=FAVORITES&list_id=1494050970" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-foreground hover:text-primary font-semibold">
              <User size={16} /> <span className="hidden md:inline">Entrar</span>
            </a>
            <a href="https://conta.olx.com.br/acesso?action_type=FAVORITES&list_id=1494050970" target="_blank" rel="noopener noreferrer" className="bg-accent text-accent-foreground font-bold px-4 py-2 rounded-full text-sm hover:opacity-90 transition-opacity inline-block">
              Anunciar <span className="hidden md:inline">grátis</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default OlxHeader;
