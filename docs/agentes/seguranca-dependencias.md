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

## Direcionamentos do dono

- **NÃO girar as chaves em texto puro do n8n** (22/09/2026). Ele decidiu manter
  as chaves atuais. O motivo dele: Vocaboost e Dermato foram desligados como
  produto, só o Mentorque está de pé, e sem outra operação viva não há de quem
  confundir. Perguntado com o tamanho do estrago na mão (a `DADOS_CHAVE` abre
  dez portas, três delas de MENSAGEM A CLIENTE), ele manteve a decisão.
  **Não reabrir com o mesmo argumento.** O que reabre é FATO NOVO: chave usada
  por quem não devia, cobrança estranha numa das contas de IA, ou mais alguém
  com acesso ao n8n.
- **O item sai da lista do dono** e esta linha passa a ser a resposta quando
  a varredura semanal encontrar as chaves de novo. Encontrar não é achado:
  achado é mudança.

**Proteção contra senha vazada: DECIDIDO, não trazer de novo (20/09/2026).** O
advisor `auth_leaked_password_protection` do Supabase vai aparecer como WARN em
toda rodada, porque a checagem contra o HaveIBeenPwned está desligada. O dono
olhou e decidiu não ligar. A razão de registrar aqui é simples: achado que já
foi decidido e volta toda semana treina o leitor a ignorar o relatório inteiro,
e aí o achado que importa passa batido junto.

Se um dia isso mudar (por exemplo, se aparecer conta invadida), o assunto
reabre com o caso do lado, não com o aviso repetido.

## Aprendizados

### Quatro regras da rodada 1 (20/09/2026)

**1. "Produção" no `npm audit` é a árvore, não o caminho.** O `--omit=dev`
separa por QUEM PEDIU o pacote, e isso não é a mesma pergunta que "quem alimenta
a entrada dele". Na rodada 1, três das quatro falhas ditas de produção
desmontaram ao perguntar isso: o `postcss` vem preso dentro do `next` e roda no
BUILD, sobre o nosso css; o `nanoid` vem dentro desse mesmo `postcss`; e o `qs`
vem dentro do SDK do `stripe`, que o usa para MONTAR o que a gente manda, sendo
que os avisos dele são sobre INTERPRETAR entrada de atacante. Antes de chamar
uma falha de produção de achado, siga o caminho até uma entrada que um
desconhecido controla. Se não existir esse caminho, diga isso, que é informação
melhor que o número da gravidade.

**2. Atualizar não é fechar: confira a FAIXA de cada aviso contra a versão que
você recomenda.** O `fixAvailable` do `npm audit` propõe a maior correção sem
virar versão maior, e isso pode deixar crítica aberta. Em 20/09 o `next` 14.2.5
tinha três críticas e o remendo oferecido (14.2.35) fechava UMA: as outras duas
só têm conserto na linha 15.x. Recomendar a subida está certo; dizer "resolvido"
depois dela estaria errado. A frase honesta nomeia o que ficou aberto e por quê.

**3. `search_path` fixo sem `pg_temp` ainda deixa `pg_temp` na frente.** É a
pegadinha irmã da de 19/09 (mitigação escrita que não mordia). No Postgres,
quando `pg_temp` não é nomeado na lista, ele é pesquisado PRIMEIRO, então uma
função `SECURITY DEFINER` com `search_path=public, auth` continua sequestrável
por nome. Toda rodada, olhe o `proconfig` das funções `SECURITY DEFINER` e
confira se `pg_temp` está lá, no FIM. Achado em `cadastros_do_dia` e
`cadastros_no_periodo`; o `contas_criadas_desde` já nasceu certo.

**4. O n8n não é só nosso, e é aí que mora a permissão esquecida.** São 65
fluxos na mesma instância, a maioria de outro produto (Vocaboost) e de um
cliente (Dermato), com fluxos ATIVOS que não têm nada a ver com o Mentorque,
inclusive um com "TEMP" no nome ativo desde julho. Credencial a gente lista e
conta; fluxo ativo de terceiro é o que realmente mantém porta aberta. Na rodada
mensal de permissão, liste os fluxos ATIVOS, não só as credenciais, e leve a
pergunta ao dono sem desligar nada: fluxo de cliente é consultório de alguém.

### O que esta sessão não alcança pela rede (20/09/2026)

O proxy de saída do ambiente remoto recusa `mentorque.com.br`. Então achado que
dependa de bater no nosso próprio site (conferir se `/_next/image` responde, por
exemplo) sai como LEITURA DE CONFIGURAÇÃO, e tem que estar escrito assim.
Não gaste a rodada tentando de novo, e não deixe a leitura de config passar por
medição.

### A primeira varredura achou e-mail de cliente exposto (19/09/2026)

Aconteceu antes da primeira rodada do papel, quando o dono perguntou se o agente
já tinha olhado o projeto todo e a resposta foi não. Os advisors do Supabase
foram chamados à mão, ali mesmo, e acharam.

**O que estava aberto.** As funções `cadastros_do_dia(date)` e
`cadastros_no_periodo(date, date)` são `SECURITY DEFINER`, leem `auth.users` e
devolvem **e-mail e nome de todo cadastrado**. As duas estavam executáveis pelo
papel `anon`, que é a chave PÚBLICA, a que vai dentro do app e do site. Qualquer
pessoa que a extraísse (é trivial) podia chamar
`/rest/v1/rpc/cadastros_no_periodo` com um intervalo largo e receber a lista
inteira.

**A parte que ensina mais que o buraco.** O arquivo `supabase/cadastros_do_dia.sql`
JÁ TINHA, desde que as funções nasceram, as linhas:

```sql
revoke all on function public.cadastros_do_dia(date) from anon, authenticated;
```

E elas nunca fizeram nada. No Postgres, toda função nasce com `EXECUTE`
concedido ao pseudo-papel **`PUBLIC`**, e `anon` herda por ali. Revogar de `anon`
sem revogar de `PUBLIC` não revoga coisa alguma. **A mitigação estava escrita,
parecia certa, passava em qualquer leitura de código, e era decorativa.**

É o mesmo padrão do travessão achado no mesmo dia: a defesa existia, ninguém
tinha testado se ela mordia.

**Três regras que saem daí, e valem para toda rodada:**

1. **Permissão se confere no estado, não no comando.** "Rodou sem erro" não prova
   nada. O que prova:
   ```sql
   select proname, array_to_string(proacl, ' | ') from pg_proc ...
   ```
   Enquanto aparecer `=X/postgres` com o lado esquerdo VAZIO, `PUBLIC` executa.
   Ou, mais direto: `has_function_privilege('anon', oid, 'EXECUTE')`.
2. **`SECURITY DEFINER` que lê `auth.users` é a combinação mais perigosa da
   casa.** Toda rodada, liste as funções que o `anon` consegue executar e
   confira quais são `SECURITY DEFINER`. As nossas em `SECURITY INVOKER` estão
   protegidas pelo RLS, mas as `DEFINER` passam por cima de tudo.
3. **O aviso "RLS ligado e sem política" NÃO é buraco, é o contrário.** Ele sai
   como INFO em 16 tabelas nossas e significa que ninguém lê nada por ali.
   Reportar aquilo como "16 tabelas expostas" seria a lista de pânico que este
   manual manda evitar, e ainda esconderia o achado de verdade no meio.

**O que ficou sem resposta:** não deu para saber se alguém chegou a chamar as
funções. Os registros de requisição não foram alcançáveis pela ferramenta usada,
e a retenção do painel é curta. A frase honesta é "não sei", não "ninguém usou".
