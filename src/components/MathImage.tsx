import { supabase } from "../lib/supabase";

interface MathImageProps {
  path: string | null;
  alt: string;
}

export default function MathImage({
  path,
  alt,
}: MathImageProps) {
  if (!path) return null;

  const { data } = supabase.storage
    .from("math-images")
    .getPublicUrl(path);

  return (
    <img
      src={data.publicUrl}
      alt={alt}
      loading="lazy"
      style={{
        maxWidth: "100%",
        height: "auto",
        display: "block",
        margin: "16px auto",
      }}
    />
  );
}