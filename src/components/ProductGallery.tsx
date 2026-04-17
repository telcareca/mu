import { useState } from "react";
import { useProductSettings } from "@/hooks/useSiteData";

const ProductGallery = () => {
  const { data: product } = useProductSettings();
  const photos = product.photos.length ? product.photos : ["/placeholder.svg"];
  const [selected, setSelected] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const visible = photos.slice(0, 5);
  const extraCount = photos.length - 5;

  return (
    <>
      {/* Desktop: OLX-style grid layout */}
      <div className="hidden md:grid grid-cols-[1.2fr_1fr_1fr] grid-rows-2 gap-1 rounded-lg overflow-hidden cursor-pointer" style={{ height: 420 }}>
        <div
          className="row-span-2 relative"
          onClick={() => { setSelected(0); setShowFullscreen(true); }}
        >
          <img src={visible[0]} alt={product.title} className="w-full h-full object-cover" />
        </div>
        {visible.slice(1, 5).map((src, i) => (
          <div
            key={i}
            className="relative"
            onClick={() => { setSelected(i + 1); setShowFullscreen(true); }}
          >
            <img src={src} alt={`Foto ${i + 2}`} className="w-full h-full object-cover" loading="lazy" />
            {i === 3 && extraCount > 0 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-2xl font-bold" style={{ color: "white" }}>+{extraCount}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        <div
          className="rounded-lg overflow-hidden bg-card border border-border cursor-pointer"
          onClick={() => setShowFullscreen(true)}
        >
          <img src={photos[selected] || photos[0]} alt={product.title} className="w-full aspect-[4/3] object-cover" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors shrink-0 ${
                selected === i ? "border-primary" : "border-border"
              }`}
            >
              <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      </div>

      {showFullscreen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center" onClick={() => setShowFullscreen(false)}>
          <button className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10" style={{ color: "white" }} onClick={() => setShowFullscreen(false)}>✕</button>
          <img
            src={photos[selected] || photos[0]}
            alt={product.title}
            className="max-w-full max-h-[80vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex gap-2 mt-4">
            {photos.map((src, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setSelected(i); }}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors shrink-0 ${
                  selected === i ? "border-primary" : "border-white/30"
                }`}
              >
                <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductGallery;
