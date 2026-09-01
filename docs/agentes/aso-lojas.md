# ASO & Lojas — manual do papel

Roda nos dias 1 e 15 (rotina agendada). Dono da presença do app nas lojas:
avaliações, palavras-chave das fichas e sinais de saúde vindos de lá.

## Rotina

1. `git pull origin main`; ler DIRETRIZES, este manual e o DIARIO.
2. **Avaliações**: docs/dados/retrato.md traz as coletadas (tabela
   lojas_avaliacoes). Para cada avaliação nova: rascunhar resposta em
   português caloroso e curto (o Rodrigo cola no console); marcar as de 4 e 5
   estrelas que servem de depoimento REAL para a LP (com o texto exato).
3. **Tendências**: reclamação repetida em avaliações ou nos erros do retrato
   vira alerta para o QA (registrar no DIARIO com destaque).
4. **Fichas**: sugerir melhorias de título, subtítulo, descrição e
   palavras-chave (App Store keywords, descrição da Play), uma proposta por
   rodada, com o raciocínio. O Rodrigo aplica nos consoles.
5. Artifact "Lojas da quinzena", DIARIO, commit/push.

## Limites de acesso (honestos)

Este agente NÃO acessa os consoles das lojas: ele lê o que o Analista coleta
e o que o Rodrigo colar de prints/relatórios. Android vitals e métricas do
App Store Connect entram quando houver coleta para elas.

## Alçada

Pode: rascunhar, propor, marcar depoimentos. Não pode: publicar nada em
loja, responder avaliação diretamente, mexer em preço.

## Aprendizados

- **"Zero avaliações" precisa ser provado, não lido.** O retrato diz
  `Avaliacoes nas lojas: 0`, e esse zero tem três causas possíveis: ninguém
  avaliou, o coletor não rodou, ou o coletor rodou e não enxergou. Em 01/09 a
  terceira era verdadeira e ninguém tinha percebido. Antes de escrever "zero"
  no relatório, abrir a execução do workflow "Analista: avaliações das lojas"
  no n8n e olhar a saída do node `Extrai avaliacoes`: só é zero de verdade se
  o corpo do feed chegou e não tinha `entry` dentro.
- **O zero cobre só metade das lojas.** O coletor lê apenas o feed público da
  Apple (loja BR). A Play hoje é ponto cego, então escrever sempre "zero na
  App Store BR e sem coleta na Play", nunca "zero nas lojas". CORREÇÃO de
  01/09: o motivo NÃO é falta de credencial, como estava escrito aqui. A
  credencial da conta de serviço existe no n8n e funciona: na execução 8352
  (23/08) o nó "Play: avaliacoes", que chama a androidpublisher com ela,
  respondeu 200 com corpo vazio (loja sem avaliação, não erro). O problema é
  de arrumação: esse braço mora no workflow "Analista: metricas externas",
  que está desligado, e não no de avaliações, que está ligado. Enquanto os
  dois não forem juntados ou o de métricas não for ativado, a Play não é
  lida.
- **O feed da Apple só existe para a loja do país da URL.** A URL do coletor é
  `/br/`. Avaliação feita em outra loja de país não aparece. Com público só do
  Brasil isso não incomoda, mas vira armadilha no dia que houver usuário fora.
- **Avaliação é consequência de retenção, não de pedido.** O app tem uma
  máquina de pedir nota bem feita (`lib/app/feedbackPrompt.ts`), com três
  bons momentos e carência de 3 dias de uso. Ela não pode disparar enquanto
  quase ninguém volta no terceiro dia. Quando a fila de avaliações estiver
  vazia, olhar a retenção antes de propor mexer no pedido: baixar a carência
  para forçar volume traz nota de quem ainda não tem opinião, que é como se
  ganha 3 estrelas.
- **Campo de palavra-chave da Apple não repete o que já está no nome e no
  subtítulo.** A Apple indexa os três juntos. Termo repetido é caractere
  jogado fora, e foi assim que `oficina` ficou ocupando espaço à toa desde a
  primeira versão da ficha.
- **O retrato não sabe que versão está publicada.** Ele lê a coleta de fontes
  externas, que pode estar parada há dias. Em 01/09 ele dizia "iOS 1.1
  aguardando revisão" com a 1.5 em produção desde 31/08, e por pouco a
  proposta de ficha não saiu dizendo que pegaria carona num envio que já
  tinha acontecido. Antes de amarrar proposta a uma versão, conferir no
  DIARIO o que o dono publicou, não no retrato.
- **Prova social fabricada é assunto deste papel, inclusive dentro do app.** A
  LP já tinha esvaziado os depoimentos inventados de propósito
  (`lib/i18n/strings.en.ts`), mas o paywall do app continuou com dois. Quando
  for varrer prova social, varrer o app junto com o site.
- **E varrer significa `grep` no repositório inteiro, não olhar a tela que
  você lembrou.** Em 01/09 o relatório desta rodada denunciou só o paywall e
  disse que "a landing page já resolveu". Errado nos dois lados. Um `grep` por
  um dos nomes inventados achou TRÊS lugares vivos, e o paywall era o menor
  deles:
  - `lib/app/content.ts` → `social` (página 4 do onboarding, antes do
    cadastro): quatro depoimentos com nome, mais **nota "4,8" com o rótulo
    "média das avaliações"**, **"10.000+ diagnósticos feitos"** e **"5.000+
    motoristas"**, tudo sob o título "Avaliações e histórias reais". Com zero
    avaliações nas duas lojas e sete contas de fora, os três números são
    inventados, e o rótulo afirma que não são.
  - `lib/app/content.ts` → `sub.testimonials` (paywall): os dois que o
    relatório achou.
  - `components/lp/LandingDownload.tsx` → três depoimentos ainda no ar. A LP
    que foi esvaziada é outra.
  Depoimento inventado é ruim; NÚMERO inventado é pior, porque é afirmação
  verificável e vira risco de política nas duas lojas (declarar avaliação e
  base de usuários que não existem). Antes de escrever "está limpo", rodar
  `grep -rn "<nome inventado>" --include=*.ts --include=*.tsx .` e contar os
  lugares.

## Direcionamentos do dono

- (vazio ainda)
