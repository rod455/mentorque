# Novidades da versão 2.4

Aberta em 10/09/2026, com o login do Google no Android funcionando na 2.3
(primeira sessão nativa do Android às 10:19 UTC).

## O que vai NO BINÁRIO

1. **A folha de importação pergunta o que fazer com o carro repetido.** Ao
   entrar numa conta que já tem garagem, o carro cadastrado neste aparelho
   que é O MESMO da conta (placa igual, ou marca, modelo e ano sem placa)
   deixa de ser caixa de marcar e vira uma escolha entre três: **juntar num
   só** (o histórico e os lembretes do aparelho entram no carro da conta, e
   os campos em branco da conta são preenchidos), **só o da conta** (padrão,
   nada muda) e **só o deste aparelho** (o carro da conta sai, com o
   histórico dele; a folha diz isso). Decisão do dono em 10/09: perguntar,
   igual já se pergunta para os carros diferentes, em vez de o app escolher
   qual carro sobrevive. Regra pura em `lib/app/importacao.ts`,
   `conferir:garagem` exercita cada resposta (três defeitos plantados, três
   pegos).

## O que NÃO precisa de binário

Nada até aqui.

## Roteiro de aparelho, e ele é obrigatório

Escrito antes do build. Precisa de UMA conta que já tenha um carro na nuvem
e de um aparelho onde esse mesmo carro seja cadastrado sem login:

1. Sair da conta no aparelho. Cadastrar, como convidado, o mesmo carro que a
   conta tem (mesma marca, modelo e ano; sem placa ou com a mesma placa) e
   registrar um serviço nele.
2. Entrar na conta. A folha "Levar para a sua conta?" abre e, nesse carro,
   mostra "A sua conta já tem este carro. O que fazer?" com as três opções,
   "Só o da conta" já marcada, e o botão "Confirmar" apagado.
3. Escolher **Juntar num só** e confirmar: a garagem continua com um carro
   só, e o histórico dele mostra o serviço feito no aparelho junto com os da
   conta.
4. Repetir 1 e 2 e escolher **Só o deste aparelho**: a garagem continua com
   um carro só, o histórico é só o feito no aparelho, e o texto embaixo das
   opções avisou que o da conta sairia.
5. Repetir 1 e 2 com um carro DIFERENTE: continua caixa de marcar, como antes.
6. O login do Google no Android continua entrando (regressão da 2.3).

O que a conferência daqui não alcança: a folha em si. A suíte de navegador
não a abre (ela só aparece ao entrar numa conta com garagem, com carro de
convidado no aparelho), então a ligação da folha com o store é conferida no
fonte e a regra é conferida pura. A tela, só o roteiro acima prova. Sobre
esse build, até um aparelho abrir: sem sinal ainda.

## Antes de enviar

- Versão 2.4 nos três lugares (`npm run conferir:versoes`).
- Ao publicar, acrescentar `"2.4"` à lista `JA_PUBLICADAS`, no mesmo dia.
- Na Apple, criar a versão no App Store Connect e enviar para revisão; subir o
  build não basta.
