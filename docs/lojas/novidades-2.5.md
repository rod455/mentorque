# Novidades da versão 2.5

Aberta em 12/09/2026, com a 2.4 aprovada na Play e em análise na Apple.
O roteiro de aparelho da 2.4 (14 passos) ainda não foi rodado; o que ele
achar entra aqui.

## Aprovado pelo dono, feito em 12/09 (entra no binário da 2.5)

1. **FEITO 12/09.** **O lembrete do quiz cobre três manhãs, não uma.** Aprovado em 12/09/2026,
   depois de o dono ficar dias sem aviso no iPhone. Hoje
   `lib/app/lembreteQuiz.ts` agenda UM aviso para as próximas 9h e só
   reagenda quando a pessoa abre o app ou responde: quem some recebe um e
   depois silêncio, que é o caso que mais precisava do lembrete. Passa a
   agendar os próximos três dias (três avisos, um por manhã, ids fixos),
   cancelados e refeitos a cada abertura ou resposta. Quem responde todo dia
   continua vendo um por dia; quem some recebe três manhãs e depois o
   silêncio. Três é o meio do caminho entre "um e acabou" e perseguir.
   `conferir:aviso` ganha o caso: sem resposta por três dias, três avisos;
   respondeu hoje, o de hoje sai da lista.
2. **Universal links e App Links** (pedido do dono em 12/09, ao pedir botão
   de e-mail que abre dentro do app): hoje o link `mentorque.com.br/app?ir=`
   abre a tela certa na web, mas no celular com o app instalado abre o
   navegador. Para abrir o app: `.well-known/apple-app-site-association` no
   site (Team ID GGM89XNN4S, bundle `mentorque.app`) e Associated Domains no
   iOS; `.well-known/assetlinks.json` (precisa do SHA-256 do certificado de
   assinatura do Play, que fica no Play Console) e intent-filter no Android;
   e o app, ao abrir por link, ler o `ir=` como a página da web lê
   (`lib/app/destinoDoLink.ts`). É binário nas duas lojas.
3. **FEITO 12/09.** **Ligar o interruptor de avisos responde na tela.** "Avisos ligados. O
   próximo sai amanhã às 9h." Hoje, com a permissão já dada, o toque não
   mostra nada, e o dono achou que não tinha funcionado (12/09).

4. **Convite de aviso ao terminar o onboarding** (12/09, revisão de retenção):
   o Início nasce com o convite, com o carro pelo nome. `lib/app/pedidoDeAviso.ts`.
5. **Eventos de valor consumado** (`viu_aula`, `consultou_sintoma`,
   `registrou_servico`), 12/09. Na web já saem; nas lojas, com a 2.5.
6. **O card de revisões do Início abre o calendário estimado** com km ou
   data de compra, em vez de mandar ao quiz (12/09).
7. **Teste A/B `cadastro-em-duas-etapas`** (12/09): metade dos aparelhos vê
   o formulário do carro só com marca, modelo e ano; a barra "Diagnóstico do
   carro: n de 5" na tela do carro pede o resto. Na web já roda; na loja,
   onde está a quebra (3 de 19), só com este binário.
8. **Teste A/B `onboarding-curto`** (12/09): metade dos aparelhos vê três
   páginas de onboarding em vez de cinco, sem a prova social. Ler as duas
   apostas em `docs/agentes/experimentos.md` duas semanas depois da 2.5 nas
   lojas.
9. **"Atualizar" e "Avaliar" no iPhone abrem o app da App Store** (12/09).
   O dono tocou em Atualizar e ficou numa tela branca com apps.apple.com
   carregando dentro do app: a saída ia pelo Safari embutido, que não vira
   a loja. Agora a ficha da Apple sai pelo esquema `itms-apps://`
   (`lib/app/saidaDoApp.ts`, conferido em `conferir:navegacao`). Só vale
   no binário da 2.5; na 2.4 o botão continua abrindo a página. Roteiro
   de aparelho: tocar em "Avaliar o Mentorque" no Perfil do iPhone e ver a
   App Store abrir, não uma aba branca.

## O que NÃO precisa de binário

- **O site não leva mais ao /app** (12/09): o link "use pelo navegador" saiu
  da home e nenhuma página aponta para o `/app`; a rota continua existindo
  para quem digita. Foi no deploy da Vercel; o app das lojas não muda
  (`scripts/verifica-caminho.ts`).
- **A jornada de recorrência por e-mail e push** (12/09): cron diário que
  decide, por conta, qual e-mail cabe hoje (cadência de 14 dias, gatilhos
  pelo estado do carro, sazonais) e manda push onde há token. Ligada por
  decisão do dono; `JORNADA_PAUSADA=sim` na Vercel é o freio. Manual em
  `docs/jornada.md`; conferida por `conferir:jornada`.

## Roteiro de aparelho

A escrever antes do build. Já se sabe um passo: ligar avisos, responder o
quiz, não abrir o app por dois dias, e ver o aviso das 9h nos dois dias.
