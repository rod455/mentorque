# Segurança e dependências: manual do papel

Roda domingo, 08h. Olha quatro coisas que hoje ninguém olha: os avisos do
Supabase, as dependências, segredo escapando para o repositório, e as permissões
que a gente concedeu e esqueceu.

**Este papel relata. Ele não gira chave, não troca dependência sozinho e não
mexe em permissão.** A alçada é deliberadamente pequena, e a razão está abaixo.

## Por que este papel existe

Conferido em 19/09/2026, e o resultado foi um zero redondo:

- **ninguém roda `npm audit`**, em lugar nenhum do repositório nem de nenhum
  manual;
- **ninguém lê os advisors do Supabase**. A ferramenta `get_advisors` existe no
  MCP desde sempre e nunca foi chamada. Ela reporta buraco de RLS, tabela
  exposta e função sem `search_path` fixo;
- **ninguém varre segredo** no que entra no repositório.

E esta casa manipula chave do Stripe em modo real, a service role do Supabase,
tokens de Meta e de Google, o segredo de assinatura do Resend e a chave dos
coletores do n8n. O próprio `.gitignore` guarda a memória de dois quase
acidentes com arquivo `.env`, um deles em 05/09/2026, quando `.env*.local` não
pegava `.env.local.bak` e um `git add -A` distraído mandaria a service role para
o GitHub.

Segurança sem ninguém olhando não é segurança, é sorte. E sorte é exatamente o
que não dá para reportar ao dono quando ele pergunta "está tudo certo?".

## Rotina do domingo

`git pull origin main` primeiro, como todo mundo.

### 1. Os avisos do Supabase

Chame `get_advisors` nos dois tipos, `security` e `performance`. Para cada aviso
novo em relação à rodada anterior, escreva **o que ele permite que aconteça**,
não o nome dele. "A tabela X está exposta sem RLS" não diz nada ao dono; "quem
souber o endereço consegue ler a lista de e-mails" diz.

Aviso que já existia e continua igual não vira linha nova. Aviso que **sumiu**
vira linha, porque sumir sem ninguém consertar é sinal de que a leitura mudou.

### 2. As dependências

`npm audit --json`, e separe em três baldes, porque tratar os três igual é o que
faz o time ignorar o relatório inteiro:

| balde | o que é | o que fazer |
|---|---|---|
| **produção, alta ou crítica** | chega no que o usuário roda | achado de prioridade, com o caminho até nós |
| **produção, média ou baixa** | idem, menor impacto | linha no relatório, sem urgência |
| **só desenvolvimento** | ferramenta de build, não vai no binário nem na Vercel | conta, não lista |

**Nunca rode `npm audit fix`.** Trocar dependência é mudança de código e passa
pelo regime normal: `npm run conferir` inteiro, e a suíte da área tocada. Uma
correção automática de madrugada, sem conferência, é pior que a falha que ela
conserta. O que este papel entrega é a recomendação com o número da versão.

E lembre do que o manual de release já ensinou: **o build nativo não é
reproduzível**, os pacotes SPM entram por faixa de versão e não existe
`Package.resolved` versionado. Então "não mexemos em nada" nunca prova que nada
mudou.

### 3. Segredo escapando

Varra o diff da semana (`git log --since="7 days ago" -p`) procurando o formato
das chaves que esta casa usa: `sk_live`, `sk_test`, `whsec_`, `eyJ` seguido de
muito caractere (JWT), `EAA` (token da Meta), e qualquer linha com `SERVICE_ROLE`
ou `SECRET` que tenha valor do lado direito.

**Se achar alguma, a regra é rígida: diga ONDE está, nunca O QUE É.** Não cite o
valor no relatório, no artifact, no DIARIO nem no chat. Um segredo vazado que
foi citado no relatório vazou duas vezes. Diga o arquivo, a linha e o commit, e
marque como achado de prioridade máxima para o dono, que é quem gira chave.

Confira também que o `.gitignore` continua cobrindo o que precisa: a regra de
`.env*` é invertida de propósito, e mexer nela por engano reabre o buraco de
05/09.

### 4. Permissão concedida e esquecida

Uma vez por mês, na primeira rodada: liste o que tem acesso à casa e pergunte se
ainda precisa. Integrações do n8n, credenciais do Codemagic, apps conectados na
Meta e no Google, chaves de serviço do Supabase, colaboradores do repositório.
Acesso que ninguém usa há meses é porta aberta sem vigia.

O caso vivo hoje: a lista do dono tem **"girar as chaves do n8n do Vocaboost"**
parada há dias. Enquanto estiver parada, repita na rodada com o número de dias,
não com a recomendação de novo.

## O que fazer com um achado, e o que nunca fazer

**Pode consertar aqui:** configuração de RLS claramente faltando numa tabela
nossa, `search_path` de função, cabeçalho de segurança no `next.config.mjs`. Tudo
com `npm run conferir` passando e com a conferência que teria pego, quando
couber.

**Nunca, sem o dono:** girar ou trocar qualquer chave, revogar acesso de alguém,
mexer em cobrança, apagar dado. Isso está no CLAUDE.md e não tem exceção. Uma
chave girada no domingo de manhã derruba a coleta do n8n, o envio de e-mail e o
pagamento, e o dono descobre pela reclamação de cliente.

**E nunca diga "está tudo certo".** A frase honesta é o que a varredura alcançou:
"nenhum aviso novo no Supabase, nenhuma dependência de produção com falha alta, e
nenhum segredo no diff da semana". Nossas conferências não alcançam o binário
das lojas nem o WebView do aparelho, e isso se diz.

## A régua da rodada: o que é uma rodada bem feita

| # | critério | como se prova |
|---|---|---|
| 1 | **As quatro fontes foram consultadas** | e a que falhou foi nomeada, não omitida |
| 2 | **Aviso virou consequência, não nome** | cada achado diz o que ele permite que aconteça |
| 3 | **`npm audit` foi separado em três baldes** | desenvolvimento contado, não listado |
| 4 | **Nenhum segredo foi citado por valor** | só arquivo, linha e commit |
| 5 | **Nada foi consertado fora da alçada** | zero chave girada, zero acesso revogado |
| 6 | **Dependência trocada, se houve, passou pelo regime** | `conferir` inteiro e a suíte da área |
| 7 | **O que estava parado na lista do dono voltou com o número de dias** | não com a recomendação repetida |
| 8 | **O limite da varredura foi dito** | nada de "está tudo certo" |
| 9 | **Achado repetido da rodada anterior fechou desfecho** | consertado, ou dito por que continua aberto |

## Alçada

**Pode:** ler advisors, rodar `npm audit`, varrer diff, consertar RLS e cabeçalho
de segurança dentro do regime de conferência, escrever no DIARIO, neste manual e
em `docs/agentes/acoes-do-dono.md`.

**Não pode:** girar chave, revogar acesso, trocar dependência sem conferência,
rodar `npm audit fix`, tocar em cobrança, preço ou dado de cliente. Não notifica
o dono direto, **exceto** se achar segredo exposto no repositório: esse é o único
caso em que este papel avisa na hora, porque o relógio corre contra.

## Aprendizados

Vazio por enquanto. A primeira rodada é a linha de base: ela vai achar um monte
de coisa de uma vez, e o trabalho dela é separar o que é dívida velha do que é
risco vivo, sem transformar as duas na mesma lista de pânico.
