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

2. **Cadastrou o carro e sumiu: um aviso dois dias depois.** É onde a coorte
   morre (1 em 8 volta na primeira semana). O carro ganha a data do cadastro
   e, dois dias depois, às 9h, sai um aviso local com os pontos de atenção
   que a saúde já calcula, só se até lá não houver serviço nem quiz. Um, não
   uma série. E a permissão de aviso passa a ser pedida logo depois do
   cadastro, na garagem, para quem tem conta (o convidado recebe a folha de
   conta nesse instante). `conferir:aviso` cobre.
3. **Registrou um serviço com valor: quanto custa na região.** No topo do
   histórico, a faixa que esse serviço costuma custar na região da pessoa e
   onde o valor dela caiu. Faixa de referência, e o cartão diz isso; o valor
   pago vai, sem nome nem placa, para a tabela `precos_observados`, que vai
   virar a faixa real par a par (30 observações). `conferir:precos` cobre.
4. **Revisão vencida vira aviso.** O que a saúde do carro diz que venceu
   passa a avisar às 9h de amanhã, um item por vez, sem repetir o mesmo item
   em 30 dias. Não depende do calendário. `conferir:aviso` cobre.
5. **Trilha em ritmo: uma aula por dia.** Na tela da trilha, "Uma aula por
   dia": liga e às 9h chega "Aula 3 de 7: título", a próxima não vista. Uma
   trilha por vez; terminou, acaba. O toque abre a trilha. E a trilha
   "Mecânica de verdade" (14 aulas que já existem) para quem quer mais.
6. **Cuidados básicos.** Duas aulas em lista, "O check de 15 minutos a cada
   15 dias" e "Limpeza que protege o carro", e a trilha "Cuidados básicos"
   que junta as duas com pneus, fluidos, palhetas e calendário. Conteúdo
   novo: o dono revisa (ids `care-fortnight` e `care-cleaning`).

7. **No Android, o onboarding termina em "Cadastrar meu primeiro carro".**
   A página de plano sai do onboarding só no Android; o botão da última
   página abre direto o formulário do carro. Pedido do dono em 11/09, para
   ver se mais gente preenche (experimento
   `onboarding-termina-no-carro-android`). iPhone e web seguem iguais, e é a
   comparação entre eles que vai dizer. `conferir:funil` cobre a ligação.

8. **O aviso no Android tem a cara do Mentorque.** Foto do dono em 11/09: o
   aviso do quiz saía com o "i" genérico do sistema. Agora a barra mostra a
   silhueta da marca pintada de âmbar e o aviso aberto traz a marca âmbar
   sobre grafite à direita; o push do Firebase usa o mesmo ícone e cor.
   Drawables em `android/app/src/main/res/drawable-*/`. `conferir:aviso`
   cobra o nome no config, no agendamento e os arquivos nas cinco densidades.

## O que NÃO precisa de binário

- A tabela `precos_observados` já existe no Supabase e a rota `/api/precos`
  sobe com o deploy do site: o app 2.4 escreve nela desde o primeiro dia.
- As duas aulas e as duas trilhas novas viajam também pelo catálogo remoto,
  então o app 2.3 as recebe sem build; o que exige binário é o "uma aula por
  dia" e os avisos.

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
7. **Convite no cadastro**: logado, cadastrar um carro novo. Na garagem, o
   cartão "Quer que a gente avise?" com o nome do carro; "Quero" abre a caixa
   do sistema (ou os ajustes, se já negado antes).
8. **Aviso de 48h**: não dá para esperar dois dias no roteiro. Prova
   possível: com avisos ligados, cadastrar o carro e, nos ajustes de
   notificação do Android (ou num app de inspeção), ver que existe um aviso
   agendado para dois dias depois às 9h; registrar um serviço nesse carro e
   ver o aviso sumir.
9. **Comparação**: registrar um serviço de "Troca de óleo" com valor 300 e
   estado preenchido no Perfil. O histórico abre com o cartão "Troca de óleo
   na sua região", a faixa, e "dentro da faixa". Editar o mesmo serviço: sem
   cartão. Em `precos_observados` aparece uma linha sem nome nem placa.
10. **Revisão vencida**: num carro com troca de óleo registrada há mais de 12
    meses, com avisos ligados, abrir o app; existe um aviso agendado para
    amanhã às 9h com "Troca de óleo do {carro} venceu". Abrir de novo no
    mesmo dia não cria outro.
11. **Trilha em ritmo**: abrir "Cuidados básicos", tocar em "Quero". O cartão
    vira "Ligado nesta trilha"; existe um aviso para as próximas 9h com "Aula
    1 de 6". Ver a aula 1; o aviso passa a ser da aula 2. Tocar no aviso abre
    a trilha. Abrir outra trilha: o texto diz que ligar esta troca a outra.
12. As duas aulas novas abrem, os links dentro delas abrem, e a lista de
    passos aparece com o botão de concluir.
13. **Onboarding no Android** (instalação limpa, ou apagar os dados do app):
    depois da prova social vem "Cadastre o seu primeiro carro", sem página
    de plano; "Cadastrar meu primeiro carro" abre o formulário do carro, e
    voltar dele cai na Home. "Agora não" no topo cai na Home. No iPhone, a
    página de plano continua sendo a última.
14. **Ícone do aviso no Android**: o aviso do quiz (ou qualquer outro) sai
    com a marca do Mentorque na barra de status, em âmbar, e com a marca
    âmbar sobre grafite à direita quando a bandeja é aberta. Se sair o "i"
    genérico, o drawable não entrou no build.

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
