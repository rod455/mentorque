-- Duas etiquetas por pergunta ao Biela: de onde veio e sobre o que era.
--
-- JÁ APLICADO no projeto em 29/09/2026 (migração `biela_perguntas_origem_e_tema`).
-- Fica aqui porque o banco desta casa mora no repositório em forma de arquivo:
-- quem precisar recriar o ambiente roda isto.
--
-- POR QUE EXISTE, e a frase é do dono: "vamos começar a usar as perguntas,
-- relevante para conseguirmos entender melhor nossos usuários". A tabela
-- CONTAVA as perguntas e não guardava nada sobre elas. Em 12 dias foram 46
-- perguntas reais e tudo que dava para dizer era "46".
--
-- O QUE NÃO ESTÁ AQUI: o texto da pergunta. A política de privacidade promete
-- que o texto só fica guardado quando a pessoa toca em 👍 ou 👎, e mudar essa
-- promessa é decisão do dono, não efeito colateral de uma melhoria de medição.
-- Estas duas colunas são DERIVADAS pela régua de `lib/biela/perguntaLida.ts`.
--
-- POR QUE `origem` ANDA SEMPRE COM `tema`: dos 24 textos que a casa tem, OITO
-- são o primeiro atalho da tela do Biela ("Que barulho pode ser esse ao
-- frear?"). Somados às perguntas digitadas, fariam "freios" parecer o assunto
-- que mais aflige o motorista, quando o que o número mede é a ordem dos botões
-- que nós mesmos pusemos na tela. Alarme e métrica que medem a própria
-- instrumentação já custaram caro duas vezes neste mês
-- (ver docs/dados/auditoria-das-medidas.md).

alter table public.biela_perguntas
  add column if not exists origem text,
  add column if not exists tema text;

comment on column public.biela_perguntas.origem is
  'De onde veio: sugerida (atalho da tela), sintoma (molde "Meu carro esta com:"), livre (digitada) ou continuacao (turno curto de conversa). So livre e sintoma medem demanda (29/09/2026).';
comment on column public.biela_perguntas.tema is
  'Sistema do carro derivado das palavras da PESSOA (freios, eletrica, arrefecimento...). Derivado, nunca o texto. Regra em lib/biela/perguntaLida.ts.';

create index if not exists biela_perguntas_tema_idx
  on public.biela_perguntas (criado_em desc, tema);
