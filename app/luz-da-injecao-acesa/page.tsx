import { GuiaDeSintoma, metadataDoGuia } from "@/components/site/GuiaDeSintoma";
import { guia } from "@/lib/site/guias/luz-da-injecao-acesa";

// O conteúdo mora em lib/site/guias/luz-da-injecao-acesa.ts e a estrutura em
// components/site/GuiaDeSintoma.tsx. Ver o comentário de lib/site/guias/tipos.ts
// para o porquê da separação.
export const metadata = metadataDoGuia(guia);

export default function Page() {
  return <GuiaDeSintoma guia={guia} />;
}
