# Perguntas do quiz diário

Geradas a partir de `lib/app/quiz/perguntas.ts`. Este arquivo é SÓ para
revisão: o que vale no app é o código. Se corrigir algo aqui, me avise para
eu levar a correção para lá, senão as duas versões se separam.

**Como revisar:** o que mais importa não é o estilo, é se a resposta marcada
como correta está certa e se a explicação não promete demais. Marque o número
da pergunta e o que mudar.

Regras que valeram para escrever cada uma:

1. Nada que dependa do carro específico da pessoa (a pergunta é a mesma para
   todo mundo no mesmo dia, e é isso que permite dizer "62% acertaram hoje").
2. Mito antes de trivia: a boa é aquela em que a maioria erra achando que sabe.
3. Sem número inventado e sem promessa de economia.
4. Sem certeza mecânica absoluta ("costuma", "na maioria dos carros").
5. Toda pergunta aponta para uma aula que existe no app.
6. A explicação precisa fazer sentido sozinha, para quem não vai abrir a aula.

A ORDEM IMPORTA: é a ordem em que as perguntas saem, e a primeira é a que
aparece dentro do onboarding. As primeiras foram escolhidas por serem as que
mais gente erra acreditando que sabe.

Total: 65 perguntas.

---
### 1. De quanto em quanto tempo se troca o óleo do motor?

- [ ] A cada 5.000 km, sempre
- **[x] O que o manual do seu carro mandar**  ← correta
- [ ] A cada 6 meses, independente do km

**Por que:** Os 5.000 km viraram lenda no Brasil e vêm de motores e óleos de décadas atrás. Carro moderno com óleo sintético costuma pedir bem mais, e quem manda é o manual do seu modelo. Trocar antes não faz mal ao motor, faz ao seu bolso.

`id: oleo-intervalo` · aula: `vid-manual-habitos`

---

### 2. Deixar o carro esquentando parado antes de sair é bom para o motor?

- [ ] Sim, uns 5 minutos todo dia
- **[x] Não, é melhor sair devagar logo**  ← correta
- [ ] Só no verão

**Por que:** Em motor com injeção eletrônica, esquentar parado só gasta combustível e demora mais para aquecer do que dirigindo. O certo é sair logo e andar suave nos primeiros minutos, sem esticar marcha, até a temperatura normalizar.

`id: esquentar-parado` · aula: `vid-manual-suave`

---

### 3. Chiado agudo ao frear normalmente é sinal de quê?

- **[x] Pastilha chegando ao fim**  ← correta
- [ ] Freio novo assentando, sempre normal
- [ ] Problema no pneu

**Por que:** A maioria dos carros tem uma lâmina de metal na pastilha feita de propósito para chiar quando o material está acabando. É um aviso projetado, não um defeito. Pastilha nova também pode chiar por alguns dias, mas o chiado que insiste pede olhada.

`id: pastilha-chiado` · aula: `diag-noises`

---

### 4. Calibrar o pneu com nitrogênio em vez de ar é melhor no uso de rua?

- [ ] Sim, muda bastante
- **[x] Faz pouca diferença no dia a dia**  ← correta
- [ ] Sim, dispensa calibrar

**Por que:** O ar que você respira já é quase 80% nitrogênio. A diferença existe em competição e em avião, onde a variação de temperatura é extrema. Na rua, o que muda de verdade a vida do pneu é calibrar com frequência, com qualquer um dos dois.

`id: pneu-nitrogenio` · aula: `tire-calibragem`

---

### 5. A luz de injeção acendeu e está PISCANDO. O que fazer?

- [ ] Seguir viagem, é só um aviso
- **[x] Reduzir e procurar ajuda logo**  ← correta
- [ ] Desligar e ligar o carro para apagar

**Por que:** Luz acesa fixa costuma ser algo a investigar sem desespero. Piscando é outra conversa: em geral indica falha de combustão acontecendo agora, que manda combustível não queimado para o catalisador e pode danificá-lo. Reduza a marcha e resolva logo.

`id: luz-injecao-piscando` · aula: `vid-luz-injecao-acendeu`

---

### 6. A conta dos 70% entre etanol e gasolina serve para quê?

- **[x] Saber qual rende mais pelo preço**  ← correta
- [ ] Saber qual tem mais potência
- [ ] Saber qual suja menos o motor

**Por que:** O etanol tem menos energia por litro, então o carro anda menos com a mesma quantidade. A regra dos 70% compara preço com rendimento: se o litro do etanol custar até cerca de 70% do da gasolina, costuma valer. É estimativa, e varia com o carro e o jeito de dirigir.

`id: etanol-70` · aula: `vid-etanol-gasolina`

---

### 7. Pode completar o radiador com água da torneira?

- [ ] Pode sempre, é a mesma coisa
- **[x] Só em emergência, e trocando depois**  ← correta
- [ ] Nunca, em hipótese nenhuma

**Por que:** O fluido de arrefecimento não é só água: ele sobe o ponto de fervura, abaixa o de congelamento e protege contra corrosão. Água de torneira ainda traz minerais que incrustam. Em emergência, para não fundir o motor, completa e resolve depois na oficina.

`id: agua-radiador` · aula: `fund-fluids`

---

### 8. O carro ferveu. Dá para abrir a tampa do radiador na hora?

- [ ] Sim, para aliviar a pressão
- **[x] Não, o sistema está sob pressão e queima**  ← correta
- [ ] Só com um pano na mão

**Por que:** Sistema quente está pressurizado, e abrir faz o líquido ferver de uma vez e sair no seu rosto e nas suas mãos. É uma das queimaduras mais comuns em pane de estrada. Desligue, espere esfriar de verdade, e só então olhe o nível.

`id: superaquecimento-tampa` · aula: `diag-superaquecimento`

---

### 9. Qual a diferença prática entre correia dentada e corrente de comando?

- [ ] Nenhuma, é só o nome
- **[x] A correia tem prazo de troca; a corrente costuma durar mais**  ← correta
- [ ] A corrente precisa trocar todo ano

**Por que:** A correia é de borracha e tem prazo definido pelo fabricante. Estourar costuma destruir o motor em carros onde válvula e pistão dividem espaço. A corrente é de metal e em geral é feita para durar a vida do motor, mas também desgasta e dá sinal de barulho.

`id: correia-vs-corrente` · aula: `fund-systems`

---

### 10. Apagar o código com um leitor OBD2 resolve o problema?

- [ ] Sim, o carro volta ao normal
- **[x] Não, só apaga o aviso**  ← correta
- [ ] Sim, se apagar duas vezes

**Por que:** O código é o recado, não a doença. Apagar sem consertar faz a luz voltar assim que o carro rodar o ciclo de teste de novo. Pior: apagar antes de a oficina ler joga fora a pista que ajudaria no diagnóstico.

`id: obd2-apaga-luz` · aula: `read-obd2`

---

### 11. Onde está a pressão correta dos pneus do seu carro?

- [ ] Escrita na lateral do pneu
- **[x] Na etiqueta da porta ou no manual**  ← correta
- [ ] É sempre 32 libras

**Por que:** O número na lateral do pneu é a pressão MÁXIMA que ele suporta, não a recomendada para o seu carro. A correta vem do fabricante do veículo e costuma estar na etiqueta da coluna da porta do motorista, muitas vezes com valores diferentes para carro cheio.

`id: pneu-pressao-onde` · aula: `tire-calibragem`

---

### 12. Fumaça azulada saindo do escapamento costuma indicar o quê?

- **[x] Queima de óleo**  ← correta
- [ ] Água no motor
- [ ] Excesso de combustível

**Por que:** Azul é óleo passando para a câmara de combustão. Branca densa e com cheiro adocicado costuma ser líquido de arrefecimento, o que aponta para junta de cabeçote. Preta é mistura rica, combustível demais. A cor é a primeira pista.

`id: fumaca-azul` · aula: `diag-smells`

---

### 13. Poça transparente embaixo do carro depois de usar o ar-condicionado é problema?

- [ ] Sim, é vazamento
- **[x] Não, é a água que o ar condensa**  ← correta
- [ ] Sim, é fluido de freio

**Por que:** Ar-condicionado tira umidade do ar e essa água escorre por um dreno embaixo do carro. É normal e esperado. Preocupa o que tem cor e cheiro: marrom ou preto é óleo, vermelho é direção ou câmbio, verde ou laranja é arrefecimento.

`id: mancha-chao` · aula: `diag-leaks`

---

### 14. A oficina passou um orçamento alto. Qual a primeira coisa a fazer?

- [ ] Aceitar, eles entendem do assunto
- **[x] Pedir para detalhar peça e mão de obra**  ← correta
- [ ] Reclamar do preço na hora

**Por que:** Orçamento detalhado separa o que é peça do que é serviço e revela onde está o valor. Também facilita comparar com outra oficina no mesmo padrão. Pedir detalhe não é desconfiança, é o que qualquer oficina séria já faz sem você pedir.

`id: orcamento-perguntas` · aula: `money-quote`

---

### 15. Carro turbo precisa ficar ligado um tempo antes de desligar?

- [ ] Sempre, sem exceção
- **[x] Depende do uso: só depois de exigir muito**  ← correta
- [ ] Nunca precisa

**Por que:** A prática vem dos turbos antigos, refrigerados só a óleo, que cozinhavam ao desligar quente. A maioria dos turbos modernos tem refrigeração a água e o carro cuida disso sozinho. Depois de andar forte ou subir serra, um minuto de marcha lenta ainda ajuda.

`id: turbo-desligar` · aula: `trait-turbo`

---

### 16. Entre dois usados iguais, um com 60 mil km e outro com 120 mil, qual é a melhor compra?

- [ ] Sempre o de menor km
- **[x] O que tem histórico de manutenção comprovado**  ← correta
- [ ] Tanto faz, o que importa é o ano

**Por que:** Quilometragem baixa com manutenção nenhuma esconde borracha ressecada, óleo velho e peça parada. Km alto de rodovia, com revisão em dia e nota fiscal, costuma castigar menos o carro do que km baixo de trânsito parado. Histórico vale mais que o número.

`id: km-alto-comprar` · aula: `trait-highkm`

---

### 17. O pedal de freio ficou mole e vai fundo. O que isso costuma indicar?

- [ ] Pastilha nova assentando
- **[x] Ar ou falta de fluido no sistema**  ← correta
- [ ] Normal em carro moderno

**Por que:** Freio funciona porque líquido não comprime. Pedal esponjoso quer dizer que tem ar no circuito ou fluido de menos, e nos dois casos a frenagem fica imprevisível. É item de segurança: não é para deixar para a semana que vem.

`id: freio-esponjoso` · aula: `fund-fluids`

---

### 18. Câmbio CVT que não 'troca marcha' e mantém a rotação subindo está com defeito?

- [ ] Sim, é sinal de problema
- **[x] Não, é assim que ele funciona**  ← correta
- [ ] Só se for carro novo

**Por que:** O CVT não tem marchas fixas: ele varia a relação de forma contínua para manter o motor na rotação mais eficiente. Essa sensação de 'motor gritando sem acelerar' incomoda quem vem de câmbio comum, mas é o projeto funcionando, não falha.

`id: cambio-cvt` · aula: `trait-cvt`

---

### 19. O carro não pegou e a bateria estava fraca. Trocar a bateria sempre resolve?

- [ ] Sim, é sempre a bateria
- **[x] Não, o alternador pode estar não carregando**  ← correta
- [ ] Sim, se for bateria de mais de 2 anos

**Por que:** Bateria fraca é sintoma, e a causa pode estar em quem deveria recarregá-la. Se o alternador não carrega, a bateria nova descarrega em poucos dias e você paga duas vezes. Antes de trocar, vale testar a carga e o alternador.

`id: bateria-descarregada` · aula: `fund-dashboard`

---

### 20. O volante treme só acima de 90 km/h e some abaixo disso. O suspeito mais comum é:

- **[x] Balanceamento das rodas**  ← correta
- [ ] Motor desregulado
- [ ] Freio gasto

**Por que:** Vibração que aparece numa faixa de velocidade e some depois tem cara de desbalanceamento. Se ela só existe com o pé no freio, aí sim o suspeito vira disco empenado. A velocidade em que ela aparece é a melhor pista do que procurar.

`id: vibracao-velocidade` · aula: `diag-vibracao`

---

### 21. Carro parado na garagem por meses sofre menos que carro rodando?

- [ ] Sim, parado não desgasta
- **[x] Não, parar traz problemas próprios**  ← correta
- [ ] Só se for carro velho

**Por que:** Parado, a bateria descarrega, o pneu deforma no ponto de apoio, a borracha resseca, o freio pode grudar no disco e o combustível envelhece. Um carro que roda de vez em quando costuma se manter melhor do que um que fica meses sem sair.

`id: carro-parado-tempo` · aula: `sit-overdue`

---

### 22. Gasolina aditivada ou premium melhora qualquer carro?

- [ ] Sim, sempre rende mais
- **[x] Depende do que o motor foi projetado para usar**  ← correta
- [ ] Só em carro importado

**Por que:** Combustível de octanagem mais alta resiste mais à detonação, e isso só vira ganho em motor que consegue aproveitar, geralmente turbo ou de compressão alta. Em motor comum, a diferença de desempenho tende a ser pequena perto da diferença de preço.

`id: premium-gasolina` · aula: `vid-gasolina-e30`

---

### 23. Existe uma régua simples para decidir entre consertar o carro ou trocar de carro?

- **[x] Comparar o conserto com o valor do carro**  ← correta
- [ ] Trocar sempre que passar de 100 mil km
- [ ] Nunca consertar carro com mais de 10 anos

**Por que:** Uma régua prática: se o conserto passa de mais ou menos metade do valor de mercado do carro, ou se você gasta em reparos mais do que gastaria numa parcela por mês, vale reavaliar. Some tudo do último ano antes de decidir no impulso.

`id: consertar-ou-trocar` · aula: `money-repair-replace`

---

### 24. Queimou uma lâmpada do farol. Faz sentido trocar as duas?

- [ ] Não, só a que queimou
- **[x] Sim, elas têm vida parecida**  ← correta
- [ ] Tanto faz

**Por que:** As duas trabalharam o mesmo tempo, então a segunda costuma queimar pouco depois. Trocar em par também mantém a cor e a intensidade iguais dos dois lados, o que importa para enxergar bem e para não incomodar quem vem na frente.

`id: farol-queimado-par` · aula: `fund-dashboard`

---

### 25. Quando vale fazer alinhamento e balanceamento?

- [ ] Só quando o carro puxa para um lado
- **[x] Também depois de buraco forte ou troca de pneu**  ← correta
- [ ] Uma vez por ano, sempre

**Por que:** Puxar para o lado é o sintoma tardio: quando aparece, o pneu já desgastou torto. Buraco forte, troca de pneus e serviço na suspensão são os momentos naturais de conferir, antes de o estrago aparecer na borracha.

`id: alinhamento-quando` · aula: `tire-calibragem`

---

### 26. Na estrada, o que gasta mais combustível: ar-condicionado ligado ou janela aberta?

- [ ] Ar-condicionado, sempre
- **[x] Janela aberta, pela resistência do ar**  ← correta
- [ ] Os dois gastam igual

**Por que:** Em velocidade de estrada, janela aberta bagunça o ar em volta do carro e a resistência cresce mais do que o esforço do compressor. Na cidade, em velocidade baixa, a conta se inverte e a janela costuma sair na frente.

`id: ar-condicionado-consumo` · aula: `money-fuel`

---

### 27. Qual o melhor momento para conferir o nível de óleo do motor?

- [ ] Com o motor quente, recém-desligado
- **[x] Com o carro no plano e o motor frio ou parado uns minutos**  ← correta
- [ ] Com o motor ligado

**Por que:** O óleo precisa ter escorrido de volta para o cárter, senão a vareta mostra menos do que existe. Carro no plano importa pelo mesmo motivo. Conferir logo depois de desligar quente costuma dar leitura baixa e assustar à toa.

`id: oleo-nivel-quando` · aula: `fund-fluids`

---

### 28. Descer a serra em ponto morto economiza combustível?

- [ ] Sim, o motor gasta menos
- **[x] Não, e ainda tira o freio motor**  ← correta
- [ ] Sim, mas só em carro manual

**Por que:** Em carro com injeção, descer engrenado com o pé fora do acelerador costuma cortar o combustível quase por completo, enquanto em ponto morto o motor precisa de combustível para não morrer. E sem freio motor a descida vira responsabilidade só do freio, que esquenta e perde eficiência.

`id: ponto-morto-descida` · aula: `vid-manual-suave`

---

### 29. Com que frequência vale checar a pressão do estepe?

- [ ] Nunca, ele fica guardado
- **[x] Junto com os outros, de vez em quando**  ← correta
- [ ] Só quando furar um pneu

**Por que:** Pneu perde pressão parado, e o estepe é justamente o que ninguém olha. Descobrir que ele está vazio na beira da estrada, à noite, é o pior momento possível. Checar junto com os outros custa um minuto.

`id: estepe-pressao` · aula: `tire-calibragem`

---

### 30. Na compra de um usado, qual documento diz mais sobre o cuidado que o carro teve?

- [ ] O manual em branco
- **[x] Notas fiscais das manutenções**  ← correta
- [ ] A tabela de preço do modelo

**Por que:** Nota fiscal mostra o que foi feito, quando e com qual peça. É a única prova difícil de fabricar. Manual carimbado ajuda, mas carimbo sem nota diz pouco. Carro sem histórico nenhum não é necessariamente ruim, só é uma aposta maior.

`id: carro-usado-historico` · aula: `vid-comprar-usado`

---

### 31. Cheiro forte de queimado depois de uma descida longa pede o quê?

- [ ] Seguir, passa sozinho
- **[x] Parar em lugar seguro e deixar o freio esfriar**  ← correta
- [ ] Acelerar para ventilar o freio

**Por que:** Freio superaquecido perde eficiência justamente quando você mais precisa dele, e o cheiro é o aviso antes disso. Parar e esperar esfriar é o certo. Jogar água no disco quente, não: o choque térmico pode empenar.

`id: cheiro-queimado-freio` · aula: `diag-smells`

---

### 32. Pneu com pouco uso mas vários anos de fabricação ainda é seguro?

- [ ] Sim, o que vale é a profundidade do sulco
- **[x] A borracha envelhece mesmo parada**  ← correta
- [ ] Só importa se for pneu de estrada

**Por que:** A borracha resseca e perde aderência com o tempo, mesmo sem rodar, e começa a trincar entre os sulcos. Todo pneu traz a semana e o ano de fabricação marcados na lateral. Sulco fundo em pneu muito velho pode enganar.

`id: pneu-idade` · aula: `vid-pneu-indices`

---

### 33. Fazer revisão fora da concessionária cancela a garantia de fábrica?

- [ ] Sim, sempre cancela
- **[x] Não, desde que siga o plano e guarde as notas**  ← correta
- [ ] Só cancela em carro importado

**Por que:** No Brasil o consumidor pode escolher onde fazer a manutenção, desde que sejam respeitados os itens, os prazos e as especificações do fabricante, com comprovação. O que gera problema é revisão fora do plano, peça fora de especificação ou falta de nota.

`id: revisao-concessionaria` · aula: `sit-just-bought`

---

### 34. Dirigir com o pé apoiado na embreagem faz mal?

- [ ] Não, o pedal aguenta
- **[x] Sim, desgasta o disco antes da hora**  ← correta
- [ ] Só em subida

**Por que:** Peso leve no pedal já basta para o disco patinar de leve o tempo todo, e patinar é exatamente o que o desgasta. O mesmo vale para segurar o carro na subida com a embreagem em vez do freio: é o jeito mais rápido de queimar o conjunto.

`id: embreagem-pe` · aula: `vid-manual-habitos`

---

### 35. A luz vermelha de óleo acendeu andando. O que fazer?

- [ ] Completar o óleo no próximo posto
- **[x] Parar assim que for seguro e desligar**  ← correta
- [ ] Seguir devagar até em casa

**Por que:** Essa luz não fala de nível, fala de PRESSÃO. Sem pressão, as partes internas do motor trabalham sem filme de óleo, e o estrago acontece em segundos, não em quilômetros. Parar e chamar reboque é mais barato que um motor.

`id: luz-oleo-vermelha` · aula: `fund-dashboard`

---

### 36. Comprei um usado sem histórico. Qual a primeira manutenção a fazer?

- [ ] Esperar dar problema
- **[x] Trocar os fluidos e conferir os itens de segurança**  ← correta
- [ ] Trocar o motor por precaução

**Por que:** Sem histórico, você não sabe o que foi feito, então o ponto de partida é zerar o que é barato e crítico: óleo e filtros, fluido de freio, arrefecimento, e uma olhada em pneu, pastilha e correia. Sai bem mais barato que descobrir na estrada.

`id: ipva-multa-revisao` · aula: `sit-no-history`

---

### 37. Estalo ritmado ao fazer curva fechada, principalmente com o volante no fim, aponta para:

- **[x] Junta homocinética**  ← correta
- [ ] Amortecedor
- [ ] Escapamento

**Por que:** A homocinética é a peça que transmite força para a roda enquanto ela esterça, e desgastada ela estala nesse movimento. Se em vez de estalo for um ronco contínuo que muda ao curvar para um lado, o suspeito passa a ser rolamento de roda.

`id: estalo-esterco` · aula: `diag-noises`

---

### 38. Rodar sempre na reserva faz mal ao carro?

- [ ] Não, tanque é tanque
- **[x] Pode prejudicar a bomba de combustível**  ← correta
- [ ] Só em carro a diesel

**Por que:** Na maioria dos carros a bomba fica dentro do tanque e usa o próprio combustível para se refrigerar. Andar sempre no fundo deixa ela mais exposta ao calor e mais perto da sujeira que decanta. Não quebra de um dia para o outro, mas encurta a vida.

`id: combustivel-reserva` · aula: `money-fuel`

---

### 39. Cortar o escapamento para o carro 'roncar' aumenta a potência?

- [ ] Sim, sempre libera o motor
- **[x] Não necessariamente, e pode piorar**  ← correta
- [ ] Só em motor aspirado

**Por que:** O escapamento de fábrica é projetado junto com o motor, e parte dele existe para aproveitar as ondas de pressão em favor do enchimento do cilindro. Cortar sem projeto costuma trocar torque embaixo por barulho, e ainda pode acender luz no painel.

`id: escapamento-barulho` · aula: `vid-ressonador`

---

### 40. Todo carro híbrido precisa ser ligado na tomada?

- [ ] Sim, sempre
- **[x] Não, o híbrido comum se recarrega sozinho**  ← correta
- [ ] Só os importados

**Por que:** O híbrido comum gera a própria energia com o motor a combustão e com a frenagem regenerativa, sem tomada nenhuma. Quem precisa de tomada é o híbrido plug-in, que tem bateria maior e roda um bom trecho só no elétrico.

`id: hibrido-tomada` · aula: `cult-hybrid`

---

### 41. Carro elétrico não tem manutenção nenhuma?

- [ ] Isso mesmo, zero manutenção
- **[x] Tem menos itens, mas tem**  ← correta
- [ ] Tem mais manutenção que o comum

**Por que:** Sem óleo de motor, vela e escapamento, a lista encolhe bastante. Mas continuam existindo pneu, freio, suspensão, filtro de ar da cabine, fluido de arrefecimento da bateria e alinhamento. E, pelo peso maior, pneu costuma gastar mais rápido.

`id: eletrico-manutencao` · aula: `cult-ev`

---

### 42. Em elétrico e híbrido, por que a pastilha de freio costuma durar mais?

- [ ] A pastilha é de material melhor
- **[x] O motor elétrico freia o carro boa parte do tempo**  ← correta
- [ ] O carro é mais leve

**Por que:** Na frenagem regenerativa, o motor elétrico vira gerador e o esforço de frear vira energia de volta para a bateria. O freio de atrito entra menos, então a pastilha dura mais. O efeito colateral é o disco criar ferrugem por pouco uso.

`id: freio-regenerativo` · aula: `cult-ev`

---

### 43. Parou no semáforo com câmbio automático. Precisa colocar em neutro?

- [ ] Sim, sempre, para poupar o câmbio
- **[x] Em parada curta não precisa**  ← correta
- [ ] Precisa colocar em P

**Por que:** Em parada de semáforo, deixar em D com o pé no freio é o uso normal e previsto do câmbio. Em parada longa, tipo trânsito travado ou cancela, o neutro alivia um pouco. Colocar em P a cada parada só desgasta o mecanismo à toa.

`id: cambio-automatico-neutro` · aula: `gearbox-tipos`

---

### 44. Fluido de câmbio automático é 'para a vida toda' e nunca se troca?

- [ ] Sim, é selado de fábrica
- **[x] Depende do carro e do uso**  ← correta
- [ ] Troca todo ano, sempre

**Por que:** Alguns fabricantes anunciam o fluido como vitalício, mas 'vida' ali costuma significar um número de quilômetros, não para sempre. Uso pesado, trânsito e reboque aquecem o fluido e envelhecem antes. Câmbio é caro: na dúvida, o manual e a oficina de confiança decidem.

`id: cambio-fluido` · aula: `gearbox-fluido`

---

### 45. Câmbio automático começou a dar trancos na troca. É para esperar piorar?

- [ ] Sim, alguns trancos são normais
- **[x] Não, é sinal de olhar cedo**  ← correta
- [ ] Só se acender luz no painel

**Por que:** Tranco novo em câmbio que era macio é mudança de comportamento, e mudança de comportamento é o primeiro aviso. Diagnóstico cedo às vezes se resolve com fluido e ajuste; deixar rodar meses costuma transformar em conserto grande.

`id: cambio-solavanco` · aula: `gearbox-sintomas`

---

### 46. Colocar roda de aro maior melhora o desempenho de um carro popular?

- [ ] Sim, sempre melhora
- **[x] Costuma piorar aceleração e conforto**  ← correta
- [ ] Não muda nada

**Por que:** Roda maior costuma ser mais pesada, e peso que gira exige mais do motor para acelerar. O pneu mais baixo perde absorção, então buraco chega mais no corpo e na suspensão. Ganha em visual e, às vezes, em estabilidade em curva.

`id: aro-grande` · aula: `vid-roda-grande-1000`

---

### 47. Motor diesel gasta menos por natureza?

- [ ] Sim, e por isso é sempre mais barato rodar
- **[x] Rende mais por litro, mas a conta tem outros itens**  ← correta
- [ ] Não, gasta mais

**Por que:** O diesel tem mais energia por litro e o motor trabalha com compressão mais alta, então rende mais. Só que a manutenção costuma custar mais, a peça é mais cara e o preço do combustível varia. Rodar muito por ano é o que costuma fechar a conta.

`id: diesel-carro-passeio` · aula: `trait-diesel`

---

### 48. Rodar como motorista de aplicativo desgasta o carro de forma diferente?

- [ ] Não, quilômetro é quilômetro
- **[x] Sim, muita parada e arrancada castigam mais**  ← correta
- [ ] Só o pneu sofre mais

**Por que:** Trânsito de aplicativo é ciclo curto: acelera, freia, para, fica em marcha lenta. Isso castiga freio, embreagem, câmbio e arrefecimento bem mais que a mesma quilometragem em estrada. Por isso vale antecipar revisão em vez de seguir só o número do manual.

`id: app-motorista-desgaste` · aula: `trait-appuse`

---

### 49. Usar o carro só para trajetos curtos na cidade é o uso mais leve possível?

- [ ] Sim, roda pouco e devagar
- **[x] Não, o motor nem chega à temperatura ideal**  ← correta
- [ ] Depende do modelo

**Por que:** Trajeto curto não deixa o motor aquecer o suficiente para evaporar a água e o combustível que se acumulam no óleo, e o óleo envelhece mais rápido. Também castiga bateria, que não recarrega direito. É um uso mais severo do que parece.

`id: urbano-curto` · aula: `trait-urban`

---

### 50. Carro com frenagem automática de emergência dispensa atenção do motorista?

- [ ] Sim, ele freia sozinho
- **[x] Não, é apoio, não substituto**  ← correta
- [ ] Só em rodovia

**Por que:** Esses sistemas reduzem a gravidade de muitas batidas e evitam algumas, mas dependem de câmera e radar, que sofrem com chuva, sujeira, contraluz e situações fora do previsto. Foram feitos para ajudar quem está prestando atenção, não para render o motorista.

`id: adas-confianca` · aula: `cult-adas`

---

### 51. Dá para colocar um pneu de medida diferente da original?

- [ ] Sim, qualquer um que caiba na roda
- **[x] Só respeitando carga, velocidade e diâmetro**  ← correta
- [ ] Nunca, tem que ser idêntico

**Por que:** Existe margem, mas ela tem regra. Índices de carga e velocidade abaixo do especificado são risco direto. E mudar o diâmetro total desregula velocímetro, hodômetro e o comportamento dos sistemas de estabilidade, que contam voltas de roda.

`id: pneu-medida-trocar` · aula: `vid-pneu-medidas`

---

### 52. Aquele barulho de 'pomba' ao tirar o pé em carro turbo é sinal de quê?

- [ ] Turbo forte e bem regulado
- **[x] Ar voltando pelo compressor, e não é bom sinal**  ← correta
- [ ] Motor pedindo troca de óleo

**Por que:** O som acontece quando o ar comprimido não tem para onde ir e volta pelo compressor. Muita gente busca esse barulho de propósito, mas ele castiga o eixo e as pás do turbo. Válvula de alívio funcionando existe justamente para evitar isso.

`id: flutter-turbo` · aula: `vid-flutter`

---

### 53. Motor 3 cilindros tremer mais que um 4 cilindros é defeito?

- [ ] Sim, é falta de manutenção
- **[x] Não, é característica do desenho**  ← correta
- [ ] Só treme se for turbo

**Por que:** Com três cilindros, as forças dentro do motor não se anulam tão bem quanto com quatro, e sobra vibração. Os fabricantes compensam com eixo balanceador e coxins, mas um resto costuma chegar ao volante e ao banco, principalmente na marcha lenta.

`id: tres-cilindros` · aula: `vid-tres-cilindros`

---

### 54. Por que carro aspirado perde força em cidade de altitude alta?

- [ ] O combustível queima pior no frio
- **[x] O ar é mais rarefeito, entra menos oxigênio**  ← correta
- [ ] A gravidade muda

**Por que:** Potência depende de quanto oxigênio entra no cilindro. Em altitude o ar é menos denso, então cabe menos oxigênio e sobra menos força. É também por isso que motores turbo sofrem menos lá: o turbo comprime o ar antes de mandar para dentro.

`id: altitude-potencia` · aula: `vid-altitude`

---

### 55. A principal diferença prática entre um sedã e o hatch do mesmo modelo é:

- [ ] O motor é mais potente no sedã
- **[x] O porta-malas fechado e separado da cabine**  ← correta
- [ ] O sedã gasta menos

**Por que:** Em geral é a mesma mecânica com carroceria diferente. O sedã ganha porta-malas maior, fechado e isolado da cabine, o que ajuda em ruído e em segurança da bagagem. O hatch ganha em versatilidade de espaço e em facilidade para manobrar.

`id: sedan-porta-malas` · aula: `vid-sedan`

---

### 56. Câmbio de dupla embreagem em trânsito parado exige algum cuidado?

- [ ] Não, é igual ao automático comum
- **[x] Sim, esquenta mais em rastejamento**  ← correta
- [ ] Só em subida

**Por que:** O dupla embreagem é eficiente em movimento, mas no anda e para ele passa muito tempo com a embreagem patinando para o carro rastejar, e isso gera calor. Segurar no freio em vez de deixar rastejar por muito tempo ajuda a vida do conjunto.

`id: dct-transito` · aula: `trait-dct`

---

### 57. Motor 1.0 turbo entrega força parecida com um 1.6 aspirado como?

- [ ] Girando muito mais alto
- **[x] Empurrando mais ar para dentro do cilindro**  ← correta
- [ ] Usando combustível diferente

**Por que:** O turbo comprime o ar antes da admissão, então cabe mais oxigênio no mesmo cilindro pequeno e mais combustível pode ser queimado. É assim que um motor menor entrega força de um maior, com a vantagem de gastar menos quando você anda leve.

`id: tsi-downsizing` · aula: `vid-tsi`

---

### 58. Cilindrada maior significa sempre mais potência?

- [ ] Sim, é proporcional
- **[x] Não, depende de como o motor respira**  ← correta
- [ ] Só em motor a diesel

**Por que:** Cilindrada é o volume que o motor desloca, e é só um dos fatores. Turbo, comando, injeção e formato dos dutos mudam quanto de ar entra e sai. É por isso que um 1.0 turbo moderno passa fácil de um 1.6 antigo aspirado.

`id: cilindrada-potencia` · aula: `vid-cilindrada`

---

### 59. Por que motores em linha de 6 cilindros são famosos por serem suaves?

- [ ] Porque são maiores
- **[x] Porque as forças internas se cancelam naturalmente**  ← correta
- [ ] Porque giram menos

**Por que:** No seis em linha, os movimentos dos pistões se compensam de um jeito que anula as principais vibrações, sem precisar de eixo balanceador. É um caso raro de solução que sai suave de graça, pela geometria, e é por isso que ele tem tanta fama.

`id: balanceamento-motor` · aula: `vid-balanceamento-motor`

---

### 60. Aerofólio em carro de rua melhora a estabilidade no dia a dia?

- [ ] Sim, sempre gruda o carro no chão
- **[x] Em velocidade normal, quase nada**  ← correta
- [ ] Sim, e melhora o consumo

**Por que:** Força aerodinâmica cresce com o quadrado da velocidade, então o efeito útil aparece em velocidades bem acima das de rua. Abaixo disso, o que sobra costuma ser peso e um pouco mais de resistência ao ar. Em pista, com projeto, a história é outra.

`id: aerodinamica-asa` · aula: `sport-aero`

---

### 61. Qual a vantagem prática da tração dianteira num carro de rua?

- [ ] É sempre mais rápida
- **[x] Custa menos, ocupa menos espaço e é previsível**  ← correta
- [ ] Aguenta mais potência

**Por que:** Com motor e tração na frente, some o túnel central e a mecânica fica concentrada, o que barateia e libera espaço interno. O comportamento no limite também tende a ser mais previsível para quem não é piloto. A traseira leva vantagem em equilíbrio e em aguentar potência.

`id: tracao-traseira` · aula: `sport-drivetrain`

---

### 62. O 'nitro' dos filmes é o quê, de verdade?

- [ ] Um combustível especial
- **[x] Óxido nitroso, que leva mais oxigênio ao motor**  ← correta
- [ ] Um botão de turbo

**Por que:** O óxido nitroso não queima sozinho: ele carrega oxigênio extra, e é isso que permite queimar mais combustível de uma vez. O ganho é real e imediato, e o risco também: sem preparo do motor, é uma das formas mais rápidas de quebrar peça interna.

`id: nitro-filme` · aula: `vid-nitro`

---

### 63. Por que tantas peças de reposição são baratas em modelos populares?

- [ ] Porque são de qualidade inferior
- **[x] Porque a escala de produção derruba o preço**  ← correta
- [ ] Porque o governo subsidia

**Por que:** Modelo com muita unidade rodando tem muita peça sendo fabricada, muita oficina que já conhece o serviço e muita opção de fornecedor. Isso derruba preço e tempo de conserto. É um dos motivos práticos para considerar popularidade na hora de comprar.

`id: marca-fiat-brasil` · aula: `brand-fiat`

---

### 64. Existe 'ar no cardan' para tirar em oficina?

- [ ] Sim, é manutenção comum
- **[x] Não, é a piada mais antiga do ramo**  ← correta
- [ ] Só em caminhão

**Por que:** Cardan é um eixo maciço que transmite giro: não tem líquido nem circuito de ar para sangrar. A brincadeira existe justamente para pegar quem não conhece, e é um bom lembrete de por que vale entender o básico antes de autorizar serviço.

`id: ar-cardan` · aula: `vid-ar-cardan`

---

### 65. A revisão passou do prazo por alguns meses. O que fazer?

- [ ] Esperar o próximo prazo cheio
- **[x] Fazer assim que der e retomar o ciclo**  ← correta
- [ ] Pular, já que passou mesmo

**Por que:** Atraso não se compensa esperando mais. Óleo velho perde propriedade com o tempo, não só com o quilômetro, e filtro saturado deixa de filtrar. Fazer agora e retomar o ciclo a partir daí é mais barato do que esperar o próximo prazo.

`id: revisao-antecipar` · aula: `sit-overdue`

---
