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
2. **NÃO VAI NA 2.5, fica para a 2.6.** **Universal links e App Links**
   (pedido do dono em 12/09, ao pedir botão de e-mail que abre dentro do
   app). Precisa do SHA-256 do certificado de assinatura do Play, que só o
   dono tem, e de Associated Domains no iOS; entrar com isso pela metade
   seria uma versão a mais sem o link funcionar. O que era: hoje o link `mentorque.com.br/app?ir=`
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
10. **O registro de push relata por que não registrou** (12/09). O dono
    desligou e ligou os avisos no iPhone, nenhum token entrou no banco, e o
    aparelho nem chamou o servidor; `lib/app/push.ts` calava de propósito.
    Agora cada saída sem token vira linha em `app_erros` com origem `push`
    (sem sessão, permissão do sistema negada, Apple recusou o registro,
    `register()` lançou, servidor devolveu erro). `conferir:aviso` confere
    as cinco. Roteiro de aparelho: ligar avisos logado e ver o token em
    `push_tokens`; ligar deslogado e ver a linha "sem sessão" em `app_erros`.
11. **O push do iPhone NUNCA registrou token, e agora registra** (12/09, a
    causa do item 10). O `AppDelegate.swift` não repassava o token da Apple
    ao plugin: o plugin só escuta a notificação
    `capacitorDidRegisterForRemoteNotifications` e é o app que a publica
    (lido em `PushNotificationsPlugin.swift`). Sem isso, `register()`
    resolvia, a Apple entregava o token, e o plugin nunca disparava
    `registration`. Vale desde o primeiro build com push (28/08). Entraram
    os dois métodos no AppDelegate, e o `Package.swift` do iPhone foi
    regenerado (`npx cap update ios`): o commitado estava sem o push e sem a
    AppsFlyer, embora o Codemagic regenere no build. `conferir:aviso`
    confere os dois. **Este é o item que mais pede roteiro de aparelho**:
    iPhone com a 2.5, logado, ligar avisos no Perfil, e a linha `ios`
    aparecer em `push_tokens`. Depois, um push de teste pela rota manual.

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

## Roteiro de aparelho, e ele é obrigatório

Escrito antes do build (12/09). O que a bateria daqui alcança: as telas e
as regras puras, no Chromium. O que ela NÃO alcança e só o aparelho prova:
o token de push do iPhone, a saída para a App Store, os avisos das três
manhãs, e as duas variantes dos testes A/B no app das lojas. Sobre este
build, até um aparelho abrir: sem sinal ainda.

**No iPhone, primeiro, porque é o que nunca funcionou:**

1. **Token de push** (item 11): iPhone com a 2.5, entrar na conta, Perfil,
   ligar os avisos (se já estavam ligados, desligar e ligar). Em até um
   minuto, `select platform, updated_at from push_tokens` mostra uma linha
   `ios`. Se não mostrar, `select * from app_erros where origem = 'push'`
   diz o motivo (item 10). Depois, um push de teste pela rota manual
   `/api/push/enviar` chega com o app fechado, e o toque abre a tela pedida.
2. **Saída para a loja** (item 9): Perfil, "Avaliar o Mentorque". Abre o
   app da App Store na folha de avaliação, não uma aba branca. O banner de
   versão nova só aparece quando houver build acima do instalado; não dá
   para testar até a próxima.
3. **Três manhãs** (item 1): ligar avisos, responder o quiz de hoje, e ver
   nos Ajustes de notificação (ou esperando) que há aviso às 9h de amanhã e
   de depois de amanhã. Ao ligar, a tela diz "Avisos ligados. O próximo sai
   amanhã às 9h" (ou "hoje", antes das 9h). Não abrir o app por dois dias:
   o aviso das 9h chega nos dois.

**No Android (instalação limpa, ou apagar os dados do app):**

4. **Onboarding**: a primeira tela é a mesma dos dois testes; a variante
   depende do aparelho. Ou são cinco páginas com a prova social, ou são
   três ("Carro dá prejuízo em silêncio", "Aqui o carro tem calendário e
   preço justo", "Cadastre o seu primeiro carro"). Para ver a outra
   variante: apagar os dados do app e abrir de novo (o sorteio é pelo id
   anônimo do aparelho, que nasce de novo). As duas terminam em "Cadastrar
   meu primeiro carro" e o botão abre o formulário.
5. **Convite de aviso ao terminar o onboarding** (item 4): ao cair no
   Início, o cartão "Quer que a gente avise?" está lá, antes do resto; com
   carro cadastrado, com o nome do carro. "Quero" abre a caixa do sistema.
6. **Cadastro em duas etapas** (item 7): o formulário do carro ou pede sete
   campos, ou pede só tipo, marca, modelo e ano com a frase "Km, motor e
   foto você completa depois, na tela do carro" e salva com os três. Na tela do carro, o cartão
   "Diagnóstico do Gol: n de 5" com os botões do que falta; cada botão abre
   a tela certa (km e motor: editar carro; compra: revisões; quiz: saúde;
   foto: a folha da foto). Preencher um dado sobe o n.
7. **O Início entrega** (item 6): carro com km e sem quiz. O cartão de
   revisões diz "Estimado pelo km" e o toque abre o calendário, não o quiz.
8. **Eventos de valor** (item 5): abrir uma aula, consultar um sintoma,
   registrar um serviço com valor. Em `funil_eventos` aparecem `viu_aula`,
   `consultou_sintoma` e `registrou_servico` com `origem com-valor`, com
   `plataforma android`.
9. **Regressões da 2.4**: login do Google entra; o aviso do quiz sai com a
   marca âmbar na barra; a folha "Levar para a sua conta?" continua.

## Notas para as lojas, PARA O DONO CONFERIR ANTES DE COLAR

Falam só do que a bateria alcança. O push do iPhone fica de fora até o
roteiro passar: contar um conserto que nenhum aparelho provou é a regra
três quebrada. Ganho, não defeito; verbo na ação da pessoa.

**Google Play** (limite: 500 caracteres; este tem 409)

```
Cadastrar o carro ficou mais rápido: marca, modelo e ano bastam. Km, motor
e foto você informa quando quiser, e o app mostra o que cada dado destrava.

Na tela do carro, "Diagnóstico do carro" diz o que falta para o calendário
ficar completo.

Sem a data da última troca, o app já estima as próximas revisões pelo km.

Ligou os avisos? A tela confirma na hora, e o lembrete do quiz cobre três
manhãs seguidas.
```

**App Store**

```
Cadastrar o carro ficou mais rápido: marca, modelo e ano bastam. Km, motor
e foto você informa quando quiser, e o app mostra o que cada dado destrava.

Na tela do carro, "Diagnóstico do carro" diz o que falta para o calendário
ficar completo.

Sem a data da última troca, o app já estima as próximas revisões pelo km.

Ligou os avisos? A tela confirma na hora, e o lembrete do quiz cobre três
manhãs seguidas. Avaliar o app abre a App Store direto.
```

Ressalva das notas: "marca, modelo e ano bastam" só é verdade para metade
dos aparelhos (teste A/B). Se o dono preferir não prometer na ficha o que
metade não vê, tirar o primeiro parágrafo e deixar os outros três.

## Antes de enviar

- Versão 2.5 nos três lugares: conferido em 12/09 (`conferir:versoes`
  diz "2.5, ainda não publicada").
- Ao publicar, acrescentar `"2.5"` à lista `JA_PUBLICADAS`, no mesmo dia.
- Na Apple, criar a versão 2.5 no App Store Connect e enviar para revisão;
  subir o build não basta. A 2.4 aprovada pode ainda não ter aparecido na
  loja quando a 2.5 subir; isso não impede o envio.
- `/api/app/latest` só depois da aprovação, com o número do log
  ("versionCode deste envio: N"), nunca com o "Index" da tela.
- Universal links (item 2) ficam para a 2.6; precisam do SHA-256 do Play.
