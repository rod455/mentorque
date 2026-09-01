# Novidades da versão 1.6

Versão de MEDIÇÃO. Diferente da 1.5, ela quase não muda o que o motorista vê:
o que ela muda é o que a gente consegue enxergar sobre a primeira sessão.

Isso importa para o texto das lojas: **não prometer ao usuário melhoria que
ele não vai sentir**. O que dá para contar é o conteúdo novo, que é de
verdade.

---

## Google Play

**Novidades desta versão** (limite: 500 caracteres)

```
Sete aulas de mão ganharam texto completo: quando fazer, como saber que
passou da hora, o que o atraso custa e quando vale levar na oficina.
Troca de óleo, pastilha de freio, bateria, filtro de ar, palhetas e
scanner OBD2 agora explicam antes de mandar fazer.

Melhorias internas de estabilidade.
```

---

## App Store

**Novidades desta versão**

```
Sete aulas de mão ganharam texto completo. Antes elas eram só o passo a
passo; agora explicam quando fazer, como reconhecer que já passou da
hora, o que o atraso costuma cobrar depois e quando vale levar na
oficina em vez de fazer sozinho.

Entre elas: troca de óleo, pastilha de freio, bateria, filtro de ar,
palhetas do limpador e uso do scanner OBD2. O passo a passo por nível
continua no mesmo lugar, embaixo do texto.

Melhorias internas de estabilidade.
```

---

## O que vai nesta versão, de verdade

**Visível ao usuário**
- As 7 aulas que prometiam vídeo e mostravam a arte de "vídeo ainda não
  publicado" viraram artigo completo. Já estavam no ar pelo catálogo remoto
  desde 01/09; a 1.6 leva também para quem abrir o app sem rede.
- Cinco travessões saíram de texto que a pessoa lê: a splash (que leitor de
  tela fala em voz alta), a resposta de reserva da Biela, os textos de
  compartilhar carro e serviço, e o tooltip dos selos das lojas.

**Invisível, e é o motivo da versão**
- **Três eventos novos na primeira sessão**: `comecou_onboarding`,
  `terminou_onboarding` e `abriu_cadastro_de_carro`. Entre abrir o app e
  cadastrar o carro não havia degrau nenhum, e quem ia embora sumia sem dizer
  de onde. Eles separam dois consertos OPOSTOS: ninguém acha o formulário, ou
  acha e desiste no meio.
- **`anon_id` na origem**: aparelho sem localStorage parou de gravar o mesmo
  texto fixo para todo mundo. Isso conserta de quebra o quiz, que tem índice
  único por (dia, anon_id) e deixava o primeiro aparelho sem armazenamento
  bloquear todos os outros no dia.

## Antes de enviar

- Os rótulos de privacidade das duas lojas continuam os mesmos. Os três
  eventos novos não coletam nada de novo sobre a pessoa: são o mesmo
  `anon_id` do aparelho que o funil já usava, sem campo novo. O que declarar
  está em `docs/atribuicao.md`.
- **Teste de aparelho desta versão**, no celular, depois de instalar:
  1. Instalar limpo (ou limpar os dados) e abrir. Passar o onboarding até o
     fim, sair por "Agora não". Depois abrir o cadastro de carro e SAIR sem
     salvar. Conferir no painel que aparecem `comecou_onboarding`,
     `terminou_onboarding` e `abriu_cadastro_de_carro`, e que NÃO aparece
     `cadastrou_carro`. É esse desenho que prova que o degrau novo separa
     "desistiu no formulário" de "nem chegou lá".
  2. Fechar e reabrir o app duas vezes. Os três eventos NÃO podem repetir:
     eles são um por aparelho, e repetir faria a etapa só crescer.
  3. Abrir uma das sete aulas (a da bateria serve) e conferir que aparece o
     texto e a capa quadrada, e não a arte de "vídeo ainda não publicado".
## Os números desta versão, confirmados no log

- **Android: versionCode 52** (linha `versionCode deste envio: 52` do passo
  "Compilar .aab"). É a única fonte que vale; o "Index" da tela do Codemagic
  não é o contador, e o número do gradle.properties é só o piso.
- **iOS: build 52 esperado.** O passo "Número da build (iOS, incremental)"
  usa o MESMO `PROJECT_BUILD_NUMBER + 1` do Android, então deve bater. Vale
  confirmar no TestFlight antes de escrever o número em qualquer lugar.
- Enviadas para análise nas duas lojas em 01/09/2026.

## Bumpar /api/app/latest: FEITO em 01/09/2026

Aprovada nas duas lojas no mesmo dia. `/api/app/latest` foi para 52/52, então
quem está na 1.5 passa a ver o banner de versão nova. O Android é fato (linha
do log); o iOS é dedução do mesmo contador, e está marcado como tal no
arquivo.

### A regra que continua valendo

`/api/app/latest` alimenta o banner "versão nova disponível" da tela inicial.
Ele tem que apontar para o que está em **PRODUÇÃO**, não para o que está em
análise. Bumpar agora acenderia o aviso para todo mundo na 1.5 com a 1.6
ainda impossível de baixar, que é pior que não avisar.

Nunca bumpar com versão em análise: o banner apontaria para algo que ainda
não dá para baixar, e isso é pior que não avisar.
