import { GuiaDeSintoma, metadataDoGuia } from "@/components/site/GuiaDeSintoma";
import { guia } from "@/lib/site/guias/bateria-do-carro-descarregando";

// O conteúdo mora em lib/site/guias/bateria-do-carro-descarregando.ts e a
// estrutura em components/site/GuiaDeSintoma.tsx. Ver o comentário de
// lib/site/guias/tipos.ts para o porquê da separação.
export const metadata = metadataDoGuia(guia);

export default function Page() {
  return <GuiaDeSintoma guia={guia} />;
}
