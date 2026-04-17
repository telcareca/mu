import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadAdminImage } from "@/lib/uploadImage";
import { toast } from "sonner";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  prefix?: string;
  preview?: "square" | "circle" | "wide";
}

const ImageUploadField = ({
  value,
  onChange,
  label,
  prefix = "img",
  preview = "square",
}: ImageUploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx 5MB).");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadAdminImage(file, prefix);
      onChange(url);
      toast.success("Imagem enviada!");
    } catch (err: any) {
      toast.error("Erro ao enviar imagem: " + (err?.message || err));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const previewClass =
    preview === "circle"
      ? "w-20 h-20 rounded-full"
      : preview === "wide"
      ? "w-32 h-20 rounded-md"
      : "w-20 h-20 rounded-md";

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-semibold text-foreground">{label}</label>}
      <div className="flex items-center gap-3">
        {value ? (
          <img src={value} alt="Preview" className={`${previewClass} object-cover border border-border`} />
        ) : (
          <div className={`${previewClass} bg-muted border border-border flex items-center justify-center text-xs text-muted-foreground`}>
            sem foto
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="URL da imagem ou faça upload"
            className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background"
          />
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Enviando…</>
              ) : (
                <><Upload className="w-4 h-4 mr-1" /> Enviar arquivo</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadField;
