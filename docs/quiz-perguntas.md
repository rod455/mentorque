# Perguntas do quiz diário

Gerado por `npm run quiz:pdf` a partir de `lib/app/quiz/perguntas.ts`.
**Não edite este arquivo**: o que vale é o código, e a próxima geração
apaga qualquer correção feita aqui.

**Como revisar:** o que mais importa não é o estilo, é se a resposta
marcada como correta está certa e se a explicação não promete demais.
Cite o `id` da pergunta, e não o número: o número muda quando alguma é
removida, o id não.

## Português (63)

### 1. De quanto em quanto tempo se troca o óleo do motor?

- A) A cada 5.000 km, sempre
- **✓** O que o manual do seu carro mandar
- C) A cada 6 meses, independente do km

**Por que:** O que manda na troca de óleo é o tipo de uso do seu carro. No manual do veículo você encontra a especificação certa, baseada no seu uso. Trocar o óleo antes não faz mal, mas afeta o seu bolso.

<sub>id `oleo-intervalo` · aula `vid-manual-habitos`</sub>

### 2. Deixar o carro esquentando parado antes de sair é bom para o motor?

- A) Sim, uns 5 minutos todo dia
- **✓** Não, é melhor sair devagar logo
- C) Só no verão

**Por que:** Aguarde de 10 a 30 segundos para a rotação do motor normalizar. Em motor com injeção eletrônica, esquentar parado só gasta combustível e demora mais para aquecer do que dirigindo. O certo é sair logo e andar suave nos primeiros minutos, sem esticar a marcha, até a temperatura normalizar.

<sub>id `esquentar-parado` · aula `vid-manual-suave`</sub>

### 3. Chiado agudo ao frear normalmente é sinal de quê?

- **✓** Pastilha chegando ao fim
- B) Freio novo assentando, sempre normal
- C) Problema no pneu

**Por que:** A maioria dos carros tem uma lâmina de metal na pastilha feita de propósito para chiar quando o material está acabando. É um aviso projetado, não um defeito. Pastilha nova também pode chiar por alguns dias, mas o chiado que insiste pede olhada.

<sub>id `pastilha-chiado` · aula `diag-noises`</sub>

### 4. Calibrar o pneu com nitrogênio em vez de ar é melhor no uso de rua?

- A) Sim, muda bastante
- **✓** Faz pouca diferença no dia a dia
- C) Sim, dispensa calibrar

**Por que:** O ar que você respira já é quase 80% nitrogênio. A diferença existe em competição e em avião, onde a variação de temperatura é extrema. Na rua, o que muda de verdade a vida do pneu é calibrar com frequência, com qualquer um dos dois.

<sub>id `pneu-nitrogenio` · aula `tire-calibragem`</sub>

### 5. A luz de injeção acendeu e está PISCANDO. O que fazer?

- A) Seguir viagem, é só um aviso
- **✓** Reduzir e procurar ajuda logo
- C) Desligar e ligar o carro para apagar

**Por que:** Luz acesa fixa costuma ser algo a investigar sem desespero. Piscando é outra conversa: em geral indica falha de combustão acontecendo agora, que manda combustível não queimado para o catalisador e pode danificá-lo. Reduza a marcha e resolva logo.

<sub>id `luz-injecao-piscando` · aula `vid-luz-injecao-acendeu`</sub>

### 6. A conta dos 70% entre etanol e gasolina serve para quê?

- **✓** Saber qual rende mais pelo preço
- B) Saber qual tem mais potência
- C) Saber qual suja menos o motor

**Por que:** A regra compara preço com rendimento: o etanol tem menos energia por litro, então rende menos, e a conta diz a partir de que preço ele compensa. Só que ela ficou menos precisa, porque a gasolina vendida hoje já vem com etanol na mistura. Serve como ponto de partida, mas a análise certa é feita carro a carro, medindo o consumo com cada combustível.

<sub>id `etanol-70` · aula `vid-etanol-gasolina`</sub>

### 7. Pode completar o radiador com água da torneira?

- A) Pode sempre, é a mesma coisa
- **✓** Só em emergência, e trocando depois
- C) Nunca, em hipótese nenhuma

**Por que:** O fluido de arrefecimento não é só água: ele sobe o ponto de fervura, abaixa o de congelamento e protege contra corrosão. Água de torneira ainda traz minerais que incrustam. Em emergência, para não fundir o motor, completa e resolve depois na oficina.

<sub>id `agua-radiador` · aula `fund-fluids`</sub>

### 8. O carro ferveu. Dá para abrir a tampa do radiador na hora?

- A) Sim, para aliviar a pressão
- **✓** Não, o sistema está sob pressão e queima
- C) Só com um pano na mão

**Por que:** Sistema quente está pressurizado, e abrir faz o líquido ferver de uma vez e sair no seu rosto e nas suas mãos. É uma das queimaduras mais comuns em pane de estrada. Desligue, espere esfriar de verdade, e só então olhe o nível.

<sub>id `superaquecimento-tampa` · aula `diag-superaquecimento`</sub>

### 9. Qual a diferença prática entre correia dentada e corrente de comando?

- A) Nenhuma, é só o nome
- **✓** A correia tem prazo de troca; a corrente costuma durar mais
- C) A corrente precisa trocar todo ano

**Por que:** A correia é de borracha e tem prazo definido pelo fabricante. Estourar costuma destruir o motor em carros onde válvula e pistão dividem espaço. A corrente é de metal e em geral é feita para durar a vida do motor, mas também desgasta e dá sinal de barulho.

<sub>id `correia-vs-corrente` · aula `fund-systems`</sub>

### 10. Apagar o código com um leitor OBD2 resolve o problema?

- A) Sim, o carro volta ao normal
- **✓** Não, só apaga o aviso
- C) Sim, se apagar duas vezes

**Por que:** O código é o recado, não a doença. Apagar sem consertar faz a luz voltar assim que o carro rodar o ciclo de teste de novo. Pior: apagar antes de a oficina ler joga fora a pista que ajudaria no diagnóstico.

<sub>id `obd2-apaga-luz` · aula `read-obd2`</sub>

### 11. Onde está a pressão correta dos pneus do seu carro?

- A) Escrita na lateral do pneu
- **✓** Na etiqueta da porta ou no manual
- C) É sempre 32 libras

**Por que:** O número na lateral do pneu é a pressão MÁXIMA que ele suporta, não a recomendada para o seu carro. A correta vem do fabricante do veículo e costuma estar na etiqueta da coluna da porta do motorista, muitas vezes com valores diferentes para carro cheio.

<sub>id `pneu-pressao-onde` · aula `tire-calibragem`</sub>

### 12. Fumaça azulada saindo do escapamento costuma indicar o quê?

- **✓** Queima de óleo
- B) Água no motor
- C) Excesso de combustível

**Por que:** Azul é óleo passando para a câmara de combustão. Branca densa e com cheiro adocicado costuma ser líquido de arrefecimento, o que aponta para junta de cabeçote. Preta é mistura rica, combustível demais. A cor é a primeira pista.

<sub>id `fumaca-azul` · aula `diag-smells`</sub>

### 13. Poça transparente embaixo do carro depois de usar o ar-condicionado é problema?

- A) Sim, é vazamento
- **✓** Não, é a água que o ar condensa
- C) Sim, é fluido de freio

**Por que:** Ar-condicionado tira umidade do ar e essa água escorre por um dreno embaixo do carro. É normal e esperado. Preocupa o que tem cor e cheiro: marrom ou preto é óleo, vermelho é direção ou câmbio, verde ou laranja é arrefecimento.

<sub>id `mancha-chao` · aula `diag-leaks`</sub>

### 14. A oficina passou um orçamento alto. Qual a primeira coisa a fazer?

- A) Aceitar, eles entendem do assunto
- **✓** Pedir para detalhar peça e mão de obra
- C) Reclamar do preço na hora

**Por que:** Orçamento detalhado separa o que é peça do que é serviço e revela onde está o valor. Também facilita comparar com outra oficina no mesmo padrão. Pedir detalhe não é desconfiança, é o que qualquer oficina séria já faz sem você pedir.

<sub>id `orcamento-perguntas` · aula `money-quote`</sub>

### 15. Carro turbo precisa ficar ligado um tempo antes de desligar?

- A) Sempre, sem exceção
- **✓** Depende do uso: só depois de exigir muito
- C) Nunca precisa

**Por que:** Após um uso muito severo, o adequado é andar com o veículo em rotação baixa, permitindo que o ar atmosférico resfrie o motor e o turbo. Um pequeno trecho de 2 a 3 minutos nessa condição já é suficiente.

<sub>id `turbo-desligar` · aula `trait-turbo`</sub>

### 16. Entre dois usados iguais, um com 60 mil km e outro com 120 mil, qual é a melhor compra?

- A) Sempre o de menor km
- **✓** O que tem histórico de manutenção comprovado
- C) Tanto faz, o que importa é o ano

**Por que:** Quilometragem baixa com manutenção nenhuma esconde borracha ressecada, óleo velho e peça parada. Km alto de rodovia, com revisão em dia e nota fiscal, costuma castigar menos o carro do que km baixo de trânsito parado. Histórico vale mais que o número.

<sub>id `km-alto-comprar` · aula `trait-highkm`</sub>

### 17. O pedal de freio ficou mole e vai fundo. O que isso costuma indicar?

- A) Pastilha nova assentando
- **✓** Ar ou falta de fluido no sistema
- C) Normal em carro moderno

**Por que:** Freio funciona porque líquido não comprime. Pedal esponjoso quer dizer que tem ar no circuito ou fluido de menos, e nos dois casos a frenagem fica imprevisível. É item de segurança: não é para deixar para a semana que vem.

<sub>id `freio-esponjoso` · aula `fund-fluids`</sub>

### 18. Câmbio CVT que não 'troca marcha' e mantém a rotação subindo está com defeito?

- A) Sim, é sinal de problema
- **✓** Não, é assim que ele funciona
- C) Só se for carro novo

**Por que:** O CVT não tem marchas fixas: ele varia a relação de forma contínua para manter o motor na rotação mais eficiente. Essa sensação de 'motor gritando sem acelerar' incomoda quem vem de câmbio comum, mas é o projeto funcionando, não falha.

<sub>id `cambio-cvt` · aula `trait-cvt`</sub>

### 19. O carro não pegou e a bateria estava fraca. Trocar a bateria sempre resolve?

- A) Sim, é sempre a bateria
- **✓** Não necessariamente, o problema pode ser no alternador também
- C) Sim, se for bateria de mais de 2 anos

**Por que:** Bateria fraca é sintoma, e a causa pode estar em quem deveria recarregá-la. Se o alternador não carrega, a bateria nova descarrega em poucos dias e você paga duas vezes. Antes de trocar, vale testar a carga e o alternador.

<sub>id `bateria-descarregada` · aula `fund-dashboard`</sub>

### 20. O volante treme só acima de 90 km/h e some abaixo disso. O suspeito mais comum é:

- **✓** Balanceamento das rodas
- B) Motor desregulado
- C) Freio gasto

**Por que:** Vibração que aparece numa faixa de velocidade e some depois tem cara de desbalanceamento. Se ela só existe com o pé no freio, aí sim o suspeito vira disco empenado. A velocidade em que ela aparece é a melhor pista do que procurar.

<sub>id `vibracao-velocidade` · aula `diag-vibracao`</sub>

### 21. Carro parado na garagem por meses sofre menos que carro rodando?

- A) Sim, parado não desgasta
- **✓** Não, parar traz problemas próprios
- C) Só se for carro velho

**Por que:** Parado, a bateria descarrega, o pneu deforma no ponto de apoio, a borracha resseca, o freio pode grudar no disco e o combustível envelhece. Um carro que roda de vez em quando costuma se manter melhor do que um que fica meses sem sair.

<sub>id `carro-parado-tempo` · aula `sit-overdue`</sub>

### 22. Gasolina premium melhora qualquer carro?

- A) Sim, sempre rende mais
- **✓** Depende do que o motor foi projetado para usar
- C) Só em carro importado

**Por que:** Isso só vira ganho em um motor cuja calibração consegue aproveitar a maior octanagem da gasolina. Caso contrário, é apenas dinheiro jogado no lixo.

<sub>id `premium-gasolina` · aula `vid-gasolina-e30`</sub>

### 23. Existe uma régua simples para decidir entre consertar o carro ou trocar de carro?

- **✓** Comparar o conserto com o valor do carro
- B) Trocar sempre que passar de 100 mil km
- C) Nunca consertar carro com mais de 10 anos

**Por que:** Uma régua prática: se o conserto passa de mais ou menos metade do valor de mercado do carro, ou se você gasta em reparos mais do que gastaria numa parcela por mês, vale reavaliar. Some tudo do último ano antes de decidir no impulso.

<sub>id `consertar-ou-trocar` · aula `money-repair-replace`</sub>

### 24. Queimou uma lâmpada do farol. Faz sentido trocar as duas?

- A) Não, só a que queimou
- **✓** Sim, elas têm vida parecida
- C) Tanto faz

**Por que:** As duas trabalharam o mesmo tempo, então a segunda costuma queimar pouco depois. Trocar em par também mantém a cor e a intensidade iguais dos dois lados, o que importa para enxergar bem e para não incomodar quem vem na frente.

<sub>id `farol-queimado-par` · aula `fund-dashboard`</sub>

### 25. Quando vale fazer alinhamento e balanceamento?

- A) Só quando o carro puxa para um lado
- **✓** Também depois de buraco forte ou troca de pneu
- C) Uma vez por ano, sempre

**Por que:** Puxar para o lado é o sintoma tardio: quando aparece, o pneu já desgastou torto. Buraco forte, troca de pneus e serviço na suspensão são os momentos naturais de conferir, antes de o estrago aparecer na borracha.

<sub>id `alinhamento-quando` · aula `tire-calibragem`</sub>

### 26. Na estrada, o que gasta mais combustível: ar-condicionado ligado ou janela aberta?

- A) Ar-condicionado, sempre
- **✓** Janela aberta, na maioria dos casos
- C) Os dois gastam igual

**Por que:** Em velocidade de estrada, a janela aberta bagunça o ar em volta do carro, e a resistência pode crescer mais do que o esforço do compressor. Isso depende do tipo de veículo, da velocidade e de outros fatores. Na cidade, em velocidade baixa, a conta se inverte, e a janela costuma sair na frente.

<sub>id `ar-condicionado-consumo` · aula `money-fuel`</sub>

### 27. Qual o melhor momento para conferir o nível de óleo do motor?

- A) Com o motor quente, recém-desligado
- **✓** Com o carro no plano e o motor frio ou parado uns minutos
- C) Com o motor ligado

**Por que:** O óleo precisa ter escorrido de volta para o cárter, senão a vareta mostra menos do que existe. Carro no plano importa pelo mesmo motivo. Conferir logo depois de desligar quente costuma dar leitura baixa e assustar à toa.

<sub>id `oleo-nivel-quando` · aula `fund-fluids`</sub>

### 28. Descer a serra em ponto morto economiza combustível?

- A) Sim, o motor gasta menos
- **✓** Não, exceto em raras exceções
- C) Sim, mas só em carro manual

**Por que:** Em carro com injeção eletrônica, descer engrenado com o pé fora do acelerador corta o combustível, enquanto em ponto morto o motor precisa de combustível para se manter em marcha lenta. Entretanto, se a energia consumida pelo freio motor for maior do que a necessária para reacelerar o carro, temos o cenário de exceção. Por fim, sempre desça engrenado, pois, sem freio motor, a descida vira responsabilidade só do freio, que esquenta e perde eficiência.

<sub>id `ponto-morto-descida` · aula `vid-manual-suave`</sub>

### 29. Com que frequência vale checar a pressão do estepe?

- A) Nunca, ele fica guardado
- **✓** Junto com os outros, de vez em quando
- C) Só quando furar um pneu

**Por que:** Pneu perde pressão parado, e o estepe é justamente o que ninguém olha. Descobrir que ele está vazio na beira da estrada, à noite, é o pior momento possível. Checar junto com os outros custa um minuto.

<sub>id `estepe-pressao` · aula `tire-calibragem`</sub>

### 30. Na compra de um usado, qual documento diz mais sobre o cuidado que o carro teve?

- A) O manual em branco
- **✓** Notas fiscais das manutenções
- C) A tabela de preço do modelo

**Por que:** Nota fiscal mostra o que foi feito, quando e com qual peça. É a única prova difícil de fabricar. Manual carimbado ajuda, mas carimbo sem nota diz pouco. Carro sem histórico nenhum não é necessariamente ruim, só é uma aposta maior.

<sub>id `carro-usado-historico` · aula `vid-comprar-usado`</sub>

### 31. Cheiro forte de queimado depois de uma descida longa pede o quê?

- A) Seguir, passa sozinho
- **✓** Parar em lugar seguro e deixar o freio esfriar
- C) Acelerar para ventilar o freio

**Por que:** Freio superaquecido perde eficiência justamente quando você mais precisa dele, e o cheiro é o aviso antes disso. Parar e esperar esfriar é o certo. Jogar água no disco quente, não: o choque térmico pode empenar.

<sub>id `cheiro-queimado-freio` · aula `diag-smells`</sub>

### 32. Pneu com pouco uso mas vários anos de fabricação ainda é seguro?

- A) Sim, o que vale é a profundidade do sulco
- **✓** A borracha envelhece mesmo parada
- C) Só importa se for pneu de estrada

**Por que:** A borracha resseca e perde aderência com o tempo, mesmo sem rodar, e começa a trincar entre os sulcos. Todo pneu traz a semana e o ano de fabricação marcados na lateral. Sulco fundo em pneu muito velho pode enganar.

<sub>id `pneu-idade` · aula `vid-pneu-indices`</sub>

### 33. Fazer revisão fora da concessionária cancela a garantia de fábrica?

- A) Sim, sempre cancela
- **✓** Não, desde que siga o plano e guarde as notas
- C) Só cancela em carro importado

**Por que:** No Brasil o consumidor pode escolher onde fazer a manutenção, desde que sejam respeitados os itens, os prazos e as especificações do fabricante, com comprovação. O que gera problema é revisão fora do plano, peça fora de especificação ou falta de nota.

<sub>id `revisao-concessionaria` · aula `sit-just-bought`</sub>

### 34. Dirigir com o pé apoiado na embreagem faz mal?

- A) Não, o pedal aguenta
- **✓** Sim, desgasta o disco antes da hora
- C) Só em subida

**Por que:** Peso leve no pedal já basta para o disco patinar de leve o tempo todo, e patinar é exatamente o que o desgasta. O mesmo vale para segurar o carro na subida com a embreagem em vez do freio: é o jeito mais rápido de queimar o conjunto.

<sub>id `embreagem-pe` · aula `vid-manual-habitos`</sub>

### 35. A luz vermelha de óleo acendeu andando. O que fazer?

- A) Completar o óleo no próximo posto
- **✓** Parar assim que for seguro e desligar
- C) Seguir devagar até em casa

**Por que:** Essa luz não fala de nível, fala de PRESSÃO. Sem pressão, as partes internas do motor trabalham sem filme de óleo, e o estrago acontece em segundos, não em quilômetros. Parar e chamar reboque é mais barato que um motor.

<sub>id `luz-oleo-vermelha` · aula `fund-dashboard`</sub>

### 36. Comprei um usado sem histórico. Qual a primeira manutenção a fazer?

- A) Esperar dar problema
- **✓** Trocar os fluidos e conferir os itens de segurança
- C) Trocar o motor por precaução

**Por que:** Sem histórico, você não sabe o que foi feito, então o ponto de partida é zerar o que é barato e crítico: óleo e filtros, fluido de freio, arrefecimento, e uma olhada em pneu, pastilha e correia. Sai bem mais barato que descobrir na estrada.

<sub>id `ipva-multa-revisao` · aula `sit-no-history`</sub>

### 37. Estalo ritmado ao fazer curva fechada, principalmente com o volante no fim, aponta para:

- **✓** Junta homocinética
- B) Amortecedor
- C) Escapamento

**Por que:** A homocinética é a peça que transmite força para a roda enquanto ela esterça, e desgastada ela estala nesse movimento. Se em vez de estalo for um ronco contínuo que muda ao curvar para um lado, o suspeito passa a ser rolamento de roda.

<sub>id `estalo-esterco` · aula `diag-noises`</sub>

### 38. Rodar sempre na reserva faz mal ao carro?

- A) Não, tanque é tanque
- **✓** Pode prejudicar a bomba de combustível
- C) Só em carro a diesel

**Por que:** Na maioria dos carros a bomba fica dentro do tanque e usa o próprio combustível para se refrigerar. Andar sempre no fundo deixa ela mais exposta ao calor e mais perto da sujeira que decanta. Não quebra de um dia para o outro, mas encurta a vida.

<sub>id `combustivel-reserva` · aula `money-fuel`</sub>

### 39. Cortar o escapamento para o carro 'roncar' aumenta a potência?

- A) Sim, sempre libera o motor
- **✓** Não necessariamente, e pode piorar
- C) Só em motor aspirado

**Por que:** O escapamento de fábrica é projetado junto com o motor, e parte dele existe para aproveitar as ondas de pressão em favor do enchimento do cilindro. Cortar sem projeto costuma trocar torque embaixo por barulho, e ainda pode acender luz no painel.

<sub>id `escapamento-barulho` · aula `vid-ressonador`</sub>

### 40. Todo carro híbrido precisa ser ligado na tomada?

- A) Sim, sempre
- **✓** Não, o híbrido comum se recarrega sozinho
- C) Só os importados

**Por que:** O híbrido comum gera a própria energia com o motor a combustão e com a frenagem regenerativa, sem tomada nenhuma. Quem precisa de tomada é o híbrido plug-in, que tem bateria maior e roda um bom trecho só no elétrico.

<sub>id `hibrido-tomada` · aula `cult-hybrid`</sub>

### 41. Carro elétrico não tem manutenção nenhuma?

- A) Isso mesmo, zero manutenção
- **✓** Tem menos itens, mas tem
- C) Tem mais manutenção que o comum

**Por que:** Sem óleo de motor, vela e escapamento, a lista encolhe bastante. Mas continuam existindo pneu, freio, suspensão, filtro de ar da cabine, fluido de arrefecimento da bateria e alinhamento. E, pelo peso maior, pneu costuma gastar mais rápido.

<sub>id `eletrico-manutencao` · aula `cult-ev`</sub>

### 42. Em elétrico e híbrido, por que a pastilha de freio costuma durar mais?

- A) A pastilha é de material melhor
- **✓** O motor elétrico freia o carro boa parte do tempo
- C) O carro é mais leve

**Por que:** Na frenagem regenerativa, o motor elétrico vira gerador e o esforço de frear vira energia de volta para a bateria. O freio de atrito entra menos, então a pastilha dura mais. O efeito colateral é o disco criar ferrugem por pouco uso.

<sub>id `freio-regenerativo` · aula `cult-ev`</sub>

### 43. Parou no semáforo com câmbio automático. Precisa colocar em neutro?

- A) Sim, sempre, para poupar o câmbio
- **✓** Em parada curta não precisa
- C) Precisa colocar em P

**Por que:** Em parada de semáforo, deixar em D com o pé no freio é o uso normal e previsto do câmbio. Em parada longa, tipo trânsito travado ou cancela, o neutro alivia um pouco. Colocar em P a cada parada só desgasta o mecanismo à toa.

<sub>id `cambio-automatico-neutro` · aula `gearbox-tipos`</sub>

### 44. Fluido de câmbio automático é 'para a vida toda' e nunca se troca?

- A) Sim, é selado de fábrica
- **✓** Depende do carro e do uso
- C) Troca todo ano, sempre

**Por que:** Alguns fabricantes anunciam o fluido como vitalício, mas 'vida' ali costuma significar um número de quilômetros, não para sempre. Uso pesado, trânsito e reboque aquecem o fluido e envelhecem antes. Câmbio é caro: na dúvida, o manual e a oficina de confiança decidem.

<sub>id `cambio-fluido` · aula `gearbox-fluido`</sub>

### 45. Câmbio automático começou a dar trancos na troca. É para esperar piorar?

- A) Sim, alguns trancos são normais
- **✓** Não, é sinal de olhar cedo
- C) Só se acender luz no painel

**Por que:** Tranco novo em câmbio que era macio é mudança de comportamento, e mudança de comportamento é o primeiro aviso. Diagnóstico cedo às vezes se resolve com fluido e ajuste; deixar rodar meses costuma transformar em conserto grande.

<sub>id `cambio-solavanco` · aula `gearbox-sintomas`</sub>

### 46. Colocar roda de aro maior melhora o desempenho de um carro popular?

- A) Sim, sempre melhora
- **✓** Costuma piorar aceleração e conforto
- C) Não muda nada

**Por que:** Roda maior costuma ser mais pesada, e peso que gira exige mais do motor para acelerar. O pneu mais baixo perde absorção, então buraco chega mais no corpo e na suspensão. Ganha em visual e, às vezes, em estabilidade em curva.

<sub>id `aro-grande` · aula `vid-roda-grande-1000`</sub>

### 47. Motor diesel gasta menos por natureza?

- A) Sim, e por isso é sempre mais barato rodar
- **✓** Rende mais por litro, mas a conta tem outros itens
- C) Não, gasta mais

**Por que:** O diesel tem mais energia por litro e, por concepção, é mais eficiente termicamente. Só que a manutenção costuma custar mais, a peça é mais cara, e o preço do combustível varia. Rodar muito por ano é o que costuma fechar a conta.

<sub>id `diesel-carro-passeio` · aula `trait-diesel`</sub>

### 48. Rodar como motorista de aplicativo desgasta o carro de forma diferente?

- A) Não, quilômetro é quilômetro
- **✓** Sim, muita parada e arrancada castigam mais
- C) Só o pneu sofre mais

**Por que:** Trânsito de aplicativo é ciclo curto: acelera, freia, para, fica em marcha lenta. Isso castiga freio, embreagem, câmbio e arrefecimento bem mais que a mesma quilometragem em estrada. Por isso vale antecipar revisão em vez de seguir só o número do manual.

<sub>id `app-motorista-desgaste` · aula `trait-appuse`</sub>

### 49. Usar o carro só para trajetos curtos na cidade é o uso mais leve possível?

- A) Sim, roda pouco e devagar
- **✓** Não, o motor nem chega à temperatura ideal
- C) Depende do modelo

**Por que:** Trajeto curto não deixa o motor aquecer o suficiente para evaporar o combustível que se acumula no óleo, e o óleo envelhece mais rápido. Também castiga a bateria, que não recarrega direito. É um uso mais severo do que parece.

<sub>id `urbano-curto` · aula `trait-urban`</sub>

### 50. Carro com frenagem automática de emergência dispensa atenção do motorista?

- A) Sim, ele freia sozinho
- **✓** Não, é apoio, não substituto
- C) Só em rodovia

**Por que:** Esses sistemas reduzem a gravidade de muitas batidas e evitam algumas, mas dependem de câmera e radar, que sofrem com chuva, sujeira, contraluz e situações fora do previsto. Foram feitos para ajudar quem está prestando atenção, não para render o motorista.

<sub>id `adas-confianca` · aula `cult-adas`</sub>

### 51. Dá para colocar um pneu de medida diferente da original?

- A) Sim, qualquer um que caiba na roda
- **✓** Não é o ideal, mas, respeitando carga, velocidade e diâmetro, é aceitável
- C) Nunca, tem que ser idêntico

**Por que:** Existe margem, mas ela tem regra. Índices de carga e velocidade abaixo do especificado são risco direto. E mudar o diâmetro total desregula velocímetro, hodômetro e o comportamento dos sistemas de estabilidade, que contam voltas de roda.

<sub>id `pneu-medida-trocar` · aula `vid-pneu-medidas`</sub>

### 52. Motor 3 cilindros tremer mais que um 4 cilindros é defeito?

- A) Sim, é falta de manutenção
- **✓** Não, é característica do desenho
- C) Só treme se for turbo

**Por que:** Com três cilindros, as forças dentro do motor não se anulam tão bem quanto com quatro, e sobra vibração. Os fabricantes compensam com eixo balanceador e coxins, mas um resto costuma chegar ao volante e ao banco, principalmente na marcha lenta.

<sub>id `tres-cilindros` · aula `vid-tres-cilindros`</sub>

### 53. Por que carro aspirado perde força em cidade de altitude alta?

- A) O combustível queima pior no frio
- **✓** O ar é mais rarefeito, entra menos oxigênio
- C) A gravidade muda

**Por que:** Potência depende de quanto oxigênio entra no cilindro. Em altitude o ar é menos denso, então cabe menos oxigênio e sobra menos força. É também por isso que motores turbo sofrem menos lá: o turbo comprime o ar antes de mandar para dentro.

<sub>id `altitude-potencia` · aula `vid-altitude`</sub>

### 54. A principal diferença prática entre um sedã e o hatch do mesmo modelo é:

- A) O motor é mais potente no sedã
- **✓** O porta-malas fechado e separado da cabine
- C) O sedã gasta menos

**Por que:** Em geral é a mesma mecânica com carroceria diferente. O sedã ganha porta-malas maior, fechado e isolado da cabine, o que ajuda em ruído e em segurança da bagagem. O hatch ganha em versatilidade de espaço e em facilidade para manobrar.

<sub>id `sedan-porta-malas` · aula `vid-sedan`</sub>

### 55. Motor 1.0 turbo entrega força parecida com um 1.6 aspirado como?

- A) Girando muito mais alto
- **✓** Empurrando mais ar para dentro do cilindro
- C) Usando combustível diferente

**Por que:** O turbo comprime o ar antes da admissão, então cabe mais oxigênio no mesmo cilindro pequeno e mais combustível pode ser queimado. É assim que um motor menor entrega força de um maior, com a vantagem de gastar menos quando você anda leve.

<sub>id `tsi-downsizing` · aula `vid-tsi`</sub>

### 56. Cilindrada maior significa sempre mais potência?

- A) Sim, é proporcional
- **✓** Não, depende de como o motor respira
- C) Só em motor a diesel

**Por que:** Cilindrada é o volume que o motor desloca, e é só um dos fatores. Turbo, comando, injeção e formato dos dutos mudam quanto de ar entra e sai. É por isso que um 1.0 turbo moderno passa fácil de um 1.6 antigo aspirado.

<sub>id `cilindrada-potencia` · aula `vid-cilindrada`</sub>

### 57. Por que motores em linha de 6 cilindros são famosos por serem suaves?

- A) Porque são maiores
- **✓** Porque as forças internas se cancelam naturalmente
- C) Porque giram menos

**Por que:** No seis em linha, os movimentos dos pistões se compensam de um jeito que anula as principais vibrações, sem precisar de eixo balanceador. É um caso raro de solução que sai suave de graça, pela geometria, e é por isso que ele tem tanta fama.

<sub>id `balanceamento-motor` · aula `vid-balanceamento-motor`</sub>

### 58. Aerofólio em carro de rua melhora a estabilidade no dia a dia?

- A) Sim, sempre gruda o carro no chão
- **✓** Em velocidade normal, nada
- C) Sim, e melhora o consumo

**Por que:** Força aerodinâmica cresce com o quadrado da velocidade, então o efeito útil aparece em velocidades bem acima das de rua. Abaixo disso, o que sobra costuma ser peso e um pouco mais de resistência ao ar. Em pista, com projeto, a história é outra.

<sub>id `aerodinamica-asa` · aula `sport-aero`</sub>

### 59. Qual a vantagem prática da tração dianteira num carro de rua?

- A) É sempre mais rápida
- **✓** Custa menos, ocupa menos espaço e é previsível
- C) Aguenta mais potência

**Por que:** Com motor e tração na frente, some o túnel central e a mecânica fica concentrada, o que barateia e libera espaço interno. O comportamento no limite também tende a ser mais previsível para quem não é piloto. A traseira leva vantagem em equilíbrio e em aguentar potência.

<sub>id `tracao-traseira` · aula `sport-drivetrain`</sub>

### 60. O 'nitro' dos filmes é o quê, de verdade?

- A) Um combustível especial
- **✓** Óxido nitroso, que leva mais oxigênio ao motor
- C) Um botão de turbo

**Por que:** O óxido nitroso não queima sozinho: ele carrega oxigênio extra, e é isso que permite queimar mais combustível de uma vez. O ganho é real e imediato, e o risco também: sem preparo do motor, é uma das formas mais rápidas de quebrar peça interna.

<sub>id `nitro-filme` · aula `vid-nitro`</sub>

### 61. Por que tantas peças de reposição são baratas em modelos populares?

- A) Porque são de qualidade inferior
- **✓** Porque a escala de produção derruba o preço
- C) Porque o governo subsidia

**Por que:** Modelo com muita unidade rodando tem muita peça sendo fabricada, muita oficina que já conhece o serviço e muita opção de fornecedor. Isso derruba preço e tempo de conserto. É um dos motivos práticos para considerar popularidade na hora de comprar.

<sub>id `marca-fiat-brasil` · aula `brand-fiat`</sub>

### 62. Existe 'ar no cardan' para tirar em oficina?

- A) Sim, é manutenção comum
- **✓** Não, é a piada mais antiga do ramo
- C) Só em caminhão

**Por que:** Cardan é um eixo maciço que transmite giro: não tem líquido nem circuito de ar para sangrar. A brincadeira existe justamente para pegar quem não conhece, e é um bom lembrete de por que vale entender o básico antes de autorizar serviço.

<sub>id `ar-cardan` · aula `vid-ar-cardan`</sub>

### 63. A revisão passou do prazo por alguns meses. O que fazer?

- A) Esperar o próximo prazo cheio
- **✓** Fazer assim que der e retomar o ciclo
- C) Pular, já que passou mesmo

**Por que:** Atraso não se compensa esperando mais. Óleo velho perde propriedade com o tempo, não só com o quilômetro, e filtro saturado deixa de filtrar. Fazer agora e retomar o ciclo a partir daí é mais barato do que esperar o próximo prazo.

<sub>id `revisao-antecipar` · aula `sit-overdue`</sub>

## Inglês (63)

### 1. How often should you change the engine oil?

- A) Every 5,000 km, always
- **✓** Whatever your car's manual says
- C) Every 6 months, regardless of mileage

**Por que:** What decides the oil change is how your car is used. The manual has the right spec for your usage. Changing it sooner does no harm, but it does hit your wallet.

<sub>id `oleo-intervalo` · aula `vid-manual-habitos`</sub>

### 2. Is idling to warm up the engine before driving good for it?

- A) Yes, about 5 minutes every day
- **✓** No, it's better to just drive gently
- C) Only in summer

**Por que:** Wait 10 to 30 seconds for the engine revs to settle. On a fuel-injected engine, idling to warm up just burns fuel and heats up slower than driving does. Set off soon after and drive gently for the first minutes, without revving, until the temperature settles.

<sub>id `esquentar-parado` · aula `vid-manual-suave`</sub>

### 3. A high-pitched squeal when braking usually means what?

- **✓** Brake pads near the end
- B) New brakes bedding in, always normal
- C) A tire problem

**Por que:** Most cars have a metal tab on the pad designed to squeal when the material runs low. It's a built-in warning, not a fault. New pads can squeal for a few days too, but a squeal that persists needs a look.

<sub>id `pastilha-chiado` · aula `diag-noises`</sub>

### 4. Is filling tires with nitrogen instead of air better for street use?

- A) Yes, it makes a big difference
- **✓** It makes little difference day to day
- C) Yes, and you never need to check pressure again

**Por que:** The air you breathe is already almost 80% nitrogen. The difference matters in racing and aviation, where temperature swings are extreme. On the street, what actually changes tire life is checking pressure often, with either one.

<sub>id `pneu-nitrogenio` · aula `tire-calibragem`</sub>

### 5. The check engine light came on and is FLASHING. What now?

- A) Keep driving, it's just a warning
- **✓** Slow down and get help soon
- C) Turn the car off and on to clear it

**Por que:** A steady light is usually something to look into without panic. Flashing is different: it typically means a misfire happening right now, sending unburnt fuel into the catalytic converter and risking damage. Ease off and sort it out soon.

<sub>id `luz-injecao-piscando` · aula `vid-luz-injecao-acendeu`</sub>

### 6. What is the 70% rule between ethanol and gasoline for?

- **✓** Knowing which gives more range for the price
- B) Knowing which makes more power
- C) Knowing which keeps the engine cleaner

**Por que:** The rule compares price with range: ethanol carries less energy per liter, so it goes less far, and the math says from what price it pays off. Except it got less precise, because the gasoline sold today already has ethanol blended in. Use it as a starting point, but the real answer is worked out car by car, measuring consumption on each fuel.

<sub>id `etanol-70` · aula `vid-etanol-gasolina`</sub>

### 7. Can you top up the radiator with tap water?

- A) Always, it's the same thing
- **✓** Only in an emergency, and replace it afterwards
- C) Never, under any circumstance

**Por que:** Coolant isn't just water: it raises the boiling point, lowers the freezing point and protects against corrosion. Tap water also carries minerals that scale up the system. In an emergency, to avoid cooking the engine, top it up and fix it properly later.

<sub>id `agua-radiador` · aula `fund-fluids`</sub>

### 8. The car overheated. Can you open the radiator cap right away?

- A) Yes, to release the pressure
- **✓** No, the system is pressurized and will scald you
- C) Only with a cloth in your hand

**Por que:** A hot system is pressurized, and opening it makes the fluid flash-boil into your face and hands. It's one of the most common burns in roadside breakdowns. Shut it off, let it truly cool, and only then check the level.

<sub>id `superaquecimento-tampa` · aula `diag-superaquecimento`</sub>

### 9. What's the practical difference between a timing belt and a timing chain?

- A) None, just a different name
- **✓** The belt has a replacement interval; the chain usually lasts longer
- C) The chain must be replaced every year

**Por que:** The belt is rubber and has a manufacturer-defined interval. Snapping usually destroys the engine on cars where valves and pistons share space. The chain is metal and generally designed to last the engine's life, but it wears too and gives itself away by noise.

<sub>id `correia-vs-corrente` · aula `fund-systems`</sub>

### 10. Does clearing the code with an OBD2 scanner fix the problem?

- A) Yes, the car goes back to normal
- **✓** No, it only erases the warning
- C) Yes, if you clear it twice

**Por que:** The code is the message, not the illness. Clearing it without fixing means the light returns as soon as the car runs its test cycle again. Worse: clearing it before the shop reads it throws away the clue that would have helped.

<sub>id `obd2-apaga-luz` · aula `read-obd2`</sub>

### 11. Where do you find the correct tire pressure for your car?

- A) Written on the tire's sidewall
- **✓** On the door jamb sticker or in the manual
- C) It's always 32 psi

**Por que:** The number on the sidewall is the tire's MAXIMUM pressure, not the one recommended for your car. The correct one comes from the vehicle maker and is usually on the driver's door jamb sticker, often with different values for a loaded car.

<sub>id `pneu-pressao-onde` · aula `tire-calibragem`</sub>

### 12. Bluish smoke from the exhaust usually points to what?

- **✓** Burning oil
- B) Water in the engine
- C) Too much fuel

**Por que:** Blue is oil getting into the combustion chamber. Thick white with a sweet smell usually means coolant, pointing at a head gasket. Black is a rich mixture, too much fuel. Color is the first clue.

<sub>id `fumaca-azul` · aula `diag-smells`</sub>

### 13. A clear puddle under the car after using the A/C is a problem?

- A) Yes, it's a leak
- **✓** No, it's water the A/C condenses
- C) Yes, it's brake fluid

**Por que:** The A/C pulls moisture from the air and that water drains under the car. It's normal and expected. What worries is anything with color or smell: brown or black is oil, red is steering or transmission, green or orange is coolant.

<sub>id `mancha-chao` · aula `diag-leaks`</sub>

### 14. The shop quoted a high price. What's the first thing to do?

- A) Accept it, they know the subject
- **✓** Ask them to itemize parts and labor
- C) Complain about the price on the spot

**Por que:** An itemized quote separates parts from labor and shows where the money is. It also makes comparing with another shop meaningful. Asking for detail isn't distrust, it's what any serious shop already does unprompted.

<sub>id `orcamento-perguntas` · aula `money-quote`</sub>

### 15. Does a turbo car need to idle before you shut it off?

- A) Always, no exception
- **✓** Depends on use: only after driving hard
- C) It never matters

**Por que:** After very hard use, the right move is to drive at low revs for a bit, letting outside air cool the engine and the turbo. A short stretch of 2 to 3 minutes like that is enough.

<sub>id `turbo-desligar` · aula `trait-turbo`</sub>

### 16. Between two identical used cars, one at 60,000 km and one at 120,000, which is the better buy?

- A) Always the lower mileage one
- **✓** The one with proven maintenance history
- C) Doesn't matter, the year is what counts

**Por que:** Low mileage with no maintenance hides dried-out rubber, old oil and seized parts. High highway mileage with up-to-date servicing and receipts is usually kinder to a car than low city mileage in stop-and-go. History beats the number.

<sub>id `km-alto-comprar` · aula `trait-highkm`</sub>

### 17. The brake pedal went soft and travels far. What does that usually mean?

- A) New pads bedding in
- **✓** Air or low fluid in the system
- C) Normal on a modern car

**Por que:** Brakes work because liquid doesn't compress. A spongy pedal means air in the circuit or low fluid, and either way stopping becomes unpredictable. It's a safety item: not something to leave for next week.

<sub>id `freio-esponjoso` · aula `fund-fluids`</sub>

### 18. A CVT that doesn't 'shift' and holds revs climbing is faulty?

- A) Yes, that's a sign of trouble
- **✓** No, that's how it works
- C) Only if the car is new

**Por que:** A CVT has no fixed gears: it varies the ratio continuously to keep the engine at its most efficient rpm. That 'engine screaming without accelerating' feel bothers people used to conventional gearboxes, but it's the design working, not a fault.

<sub>id `cambio-cvt` · aula `trait-cvt`</sub>

### 19. The car wouldn't start and the battery was weak. Does replacing it always fix it?

- A) Yes, it's always the battery
- **✓** Not necessarily, the alternator may be the problem too
- C) Yes, if the battery is over 2 years old

**Por que:** A weak battery is a symptom, and the cause may be whatever should be recharging it. If the alternator isn't charging, the new battery dies in days and you pay twice. Before replacing, test the charge and the alternator.

<sub>id `bateria-descarregada` · aula `fund-dashboard`</sub>

### 20. The steering wheel shakes only above 90 km/h and settles below. The usual suspect is:

- **✓** Wheel balancing
- B) Engine out of tune
- C) Worn brakes

**Por que:** Vibration that shows up in a speed band and fades after it looks like imbalance. If it only exists with your foot on the brake, then a warped disc becomes the suspect. The speed where it appears is the best clue.

<sub>id `vibracao-velocidade` · aula `diag-vibracao`</sub>

### 21. Does a car sitting in the garage for months suffer less than one being driven?

- A) Yes, parked means no wear
- **✓** No, sitting brings its own problems
- C) Only if it's an old car

**Por que:** Parked, the battery drains, tires flat-spot, rubber dries out, brakes can seize onto the disc and fuel ages. A car driven occasionally usually keeps better than one that sits for months.

<sub>id `carro-parado-tempo` · aula `sit-overdue`</sub>

### 22. Does premium gasoline improve any car?

- A) Yes, it always gives more
- **✓** It depends what the engine was designed for
- C) Only in imported cars

**Por que:** That only becomes a gain in an engine whose calibration can exploit the higher octane. Otherwise it is just money thrown away.

<sub>id `premium-gasolina` · aula `vid-gasolina-e30`</sub>

### 23. Is there a simple rule to decide between fixing the car or replacing it?

- **✓** Compare the repair with the car's value
- B) Always replace past 100,000 km
- C) Never fix a car older than 10 years

**Por que:** A practical rule: if the repair exceeds roughly half the car's market value, or you're spending more on repairs than a monthly payment would cost, it's worth reconsidering. Add up the last twelve months before deciding on impulse.

<sub>id `consertar-ou-trocar` · aula `money-repair-replace`</sub>

### 24. One headlight bulb burned out. Does it make sense to replace both?

- A) No, only the one that failed
- **✓** Yes, they have similar lifespans
- C) It makes no difference

**Por que:** Both worked the same hours, so the second usually fails soon after. Replacing in pairs also keeps color and intensity matched on both sides, which matters for seeing well and for not dazzling oncoming drivers.

<sub>id `farol-queimado-par` · aula `fund-dashboard`</sub>

### 25. When is it worth getting alignment and balancing done?

- A) Only when the car pulls to one side
- **✓** Also after a hard pothole or a tire change
- C) Once a year, always

**Por que:** Pulling to one side is the late symptom: by the time it shows, the tire has already worn unevenly. A hard pothole, new tires and suspension work are the natural moments to check, before the damage reaches the rubber.

<sub>id `alinhamento-quando` · aula `tire-calibragem`</sub>

### 26. On the highway, what burns more fuel: A/C on or windows down?

- A) A/C, always
- **✓** Windows down, in most cases
- C) Both the same

**Por que:** At highway speed, an open window disturbs the airflow around the car, and drag can grow more than the compressor's effort. That depends on the type of vehicle, the speed and other factors. In town, at low speed, it flips, and the window usually wins.

<sub>id `ar-condicionado-consumo` · aula `money-fuel`</sub>

### 27. When is the best moment to check engine oil level?

- A) With the engine hot, just switched off
- **✓** On level ground, engine cold or after a few minutes off
- C) With the engine running

**Por que:** The oil needs time to drain back into the sump, otherwise the dipstick reads lower than reality. Level ground matters for the same reason. Checking right after shutting down hot usually reads low and scares you for nothing.

<sub>id `oleo-nivel-quando` · aula `fund-fluids`</sub>

### 28. Does coasting downhill in neutral save fuel?

- A) Yes, the engine uses less
- **✓** No, apart from rare exceptions
- C) Yes, but only in a manual

**Por que:** On a fuel-injected car, coasting in gear off the throttle cuts fuel, while in neutral the engine needs fuel just to keep idling. That said, if the energy spent on engine braking is greater than what it takes to get back up to speed, you have the exception. Above all, always go down in gear: with no engine braking, the descent rests entirely on the brakes, which heat up and fade.

<sub>id `ponto-morto-descida` · aula `vid-manual-suave`</sub>

### 29. How often is it worth checking the spare tire's pressure?

- A) Never, it just sits there
- **✓** Along with the others, every so often
- C) Only when you get a flat

**Por que:** A tire loses pressure just sitting there, and the spare is exactly the one nobody checks. Finding it flat on the roadside at night is the worst possible moment. Checking it with the others costs a minute.

<sub>id `estepe-pressao` · aula `tire-calibragem`</sub>

### 30. When buying used, which record says most about how the car was cared for?

- A) A blank owner's manual
- **✓** Service receipts and invoices
- C) The model's price guide

**Por que:** Invoices show what was done, when and with which parts. It's the one proof that's hard to fake. A stamped booklet helps, but stamps without invoices say little. A car with no history isn't necessarily bad, it's just a bigger bet.

<sub>id `carro-usado-historico` · aula `vid-comprar-usado`</sub>

### 31. A strong burning smell after a long descent calls for what?

- A) Keep going, it passes
- **✓** Pull over somewhere safe and let the brakes cool
- C) Speed up to air the brakes out

**Por que:** Overheated brakes lose effectiveness exactly when you need them most, and the smell is the warning before that. Pulling over and waiting is right. Throwing water on a hot disc is not: thermal shock can warp it.

<sub>id `cheiro-queimado-freio` · aula `diag-smells`</sub>

### 32. Is a tire with little wear but several years old still safe?

- A) Yes, tread depth is what counts
- **✓** Rubber ages even when unused
- C) It only matters for highway tires

**Por que:** Rubber dries out and loses grip over time, even unused, and starts cracking between the grooves. Every tire carries its week and year of manufacture on the sidewall. Deep tread on a very old tire can be misleading.

<sub>id `pneu-idade` · aula `vid-pneu-indices`</sub>

### 33. Does servicing outside the dealer void the factory warranty?

- A) Yes, it always voids it
- **✓** No, as long as you follow the schedule and keep receipts
- C) It only voids on imported cars

**Por que:** In Brazil the consumer may choose where to service the car, as long as the maker's items, intervals and specifications are respected and documented. What causes trouble is skipping the schedule, out-of-spec parts or missing receipts.

<sub>id `revisao-concessionaria` · aula `sit-just-bought`</sub>

### 34. Is resting your foot on the clutch pedal harmful?

- A) No, the pedal takes it
- **✓** Yes, it wears the disc out early
- C) Only uphill

**Por que:** Even light pressure on the pedal is enough to make the disc slip slightly all the time, and slipping is exactly what wears it. The same goes for holding the car on a hill with the clutch instead of the brake: the fastest way to burn the assembly.

<sub>id `embreagem-pe` · aula `vid-manual-habitos`</sub>

### 35. The red oil light came on while driving. What now?

- A) Top up the oil at the next station
- **✓** Stop as soon as it's safe and switch off
- C) Drive slowly home

**Por que:** That light isn't about level, it's about PRESSURE. Without pressure, the engine's internals run with no oil film, and the damage happens in seconds, not kilometers. Stopping and calling a tow is cheaper than an engine.

<sub>id `luz-oleo-vermelha` · aula `fund-dashboard`</sub>

### 36. I bought a used car with no history. Which service comes first?

- A) Wait until something breaks
- **✓** Change the fluids and check the safety items
- C) Replace the engine as a precaution

**Por que:** With no history you don't know what was done, so the starting point is resetting what's cheap and critical: oil and filters, brake fluid, coolant, plus a look at tires, pads and belt. Far cheaper than finding out on the road.

<sub>id `ipva-multa-revisao` · aula `sit-no-history`</sub>

### 37. A rhythmic click on tight turns, especially at full lock, points to:

- **✓** CV joint
- B) Shock absorber
- C) Exhaust

**Por que:** The CV joint transmits power to the wheel while it steers, and worn out it clicks in that motion. If instead of a click it's a steady hum that changes when turning one way, the suspect becomes a wheel bearing.

<sub>id `estalo-esterco` · aula `diag-noises`</sub>

### 38. Is always driving on reserve bad for the car?

- A) No, a tank is a tank
- **✓** It can harm the fuel pump
- C) Only in diesel cars

**Por que:** On most cars the pump sits inside the tank and uses the fuel itself for cooling. Always running near empty leaves it more exposed to heat and closer to the sediment that settles. It won't fail overnight, but it shortens its life.

<sub>id `combustivel-reserva` · aula `money-fuel`</sub>

### 39. Does cutting the exhaust to make the car louder add power?

- A) Yes, it always frees the engine
- **✓** Not necessarily, and it can make things worse
- C) Only on naturally aspirated engines

**Por que:** The factory exhaust is designed together with the engine, and part of it exists to use pressure waves in favor of cylinder filling. Cutting it without design usually trades low-end torque for noise, and can even trigger a warning light.

<sub>id `escapamento-barulho` · aula `vid-ressonador`</sub>

### 40. Does every hybrid need to be plugged in?

- A) Yes, always
- **✓** No, a conventional hybrid recharges itself
- C) Only imported ones

**Por que:** A conventional hybrid generates its own energy from the combustion engine and regenerative braking, with no plug involved. The one that needs a plug is the plug-in hybrid, with a bigger battery and a decent electric-only range.

<sub>id `hibrido-tomada` · aula `cult-hybrid`</sub>

### 41. Does an electric car need no maintenance at all?

- A) That's right, zero maintenance
- **✓** Fewer items, but it has some
- C) It needs more maintenance than a regular car

**Por que:** With no engine oil, spark plugs or exhaust, the list shrinks a lot. But tires, brakes, suspension, cabin air filter, battery coolant and alignment are all still there. And because of the extra weight, tires often wear faster.

<sub>id `eletrico-manutencao` · aula `cult-ev`</sub>

### 42. In EVs and hybrids, why do brake pads usually last longer?

- A) The pads are made of better material
- **✓** The electric motor does much of the braking
- C) The car is lighter

**Por que:** In regenerative braking, the electric motor becomes a generator and the braking effort turns back into battery energy. The friction brake works less, so pads last longer. The side effect is discs rusting from disuse.

<sub>id `freio-regenerativo` · aula `cult-ev`</sub>

### 43. Stopped at a light with an automatic. Do you need to shift to neutral?

- A) Yes, always, to spare the transmission
- **✓** For a short stop, no
- C) You need to shift to P

**Por que:** At a traffic light, leaving it in D with your foot on the brake is normal, expected use. For a long stop, like gridlock or a barrier, neutral eases things slightly. Shifting to P at every stop just wears the mechanism for nothing.

<sub>id `cambio-automatico-neutro` · aula `gearbox-tipos`</sub>

### 44. Is automatic transmission fluid 'lifetime fill' and never changed?

- A) Yes, it's sealed from the factory
- **✓** Depends on the car and how it's used
- C) Change it every year, always

**Por que:** Some makers advertise the fluid as lifetime, but 'life' there usually means a mileage figure, not forever. Heavy use, traffic and towing heat the fluid and age it sooner. Transmissions are expensive: when in doubt, the manual and a trusted shop decide.

<sub>id `cambio-fluido` · aula `gearbox-fluido`</sub>

### 45. The automatic started jerking between gears. Should you wait for it to get worse?

- A) Yes, some jerking is normal
- **✓** No, it's a sign to look early
- C) Only if a warning light comes on

**Por que:** New jerking in a gearbox that used to be smooth is a change in behavior, and a change in behavior is the first warning. Diagnosing early sometimes means just fluid and adjustment; letting it run for months usually turns into a big repair.

<sub>id `cambio-solavanco` · aula `gearbox-sintomas`</sub>

### 46. Do bigger wheels improve a small car's performance?

- A) Yes, always
- **✓** It usually hurts acceleration and comfort
- C) It changes nothing

**Por que:** A bigger wheel is usually heavier, and rotating weight demands more from the engine to accelerate. The lower-profile tire absorbs less, so potholes reach your body and the suspension harder. You gain looks and sometimes cornering stability.

<sub>id `aro-grande` · aula `vid-roda-grande-1000`</sub>

### 47. Does a diesel engine inherently use less fuel?

- A) Yes, so it's always cheaper to run
- **✓** It gives more per liter, but the math has other items
- C) No, it uses more

**Por que:** Diesel packs more energy per liter and, by design, is thermally more efficient. But maintenance usually costs more, parts are pricier, and fuel prices vary. High annual mileage is usually what makes the math work.

<sub>id `diesel-carro-passeio` · aula `trait-diesel`</sub>

### 48. Does driving for a rideshare app wear a car differently?

- A) No, a kilometer is a kilometer
- **✓** Yes, constant stop-and-go is harder on it
- C) Only the tires suffer more

**Por que:** Rideshare traffic is a short cycle: accelerate, brake, stop, idle. That punishes brakes, clutch, transmission and cooling far more than the same mileage on the highway. Which is why bringing service forward beats following the manual's number alone.

<sub>id `app-motorista-desgaste` · aula `trait-appuse`</sub>

### 49. Is using the car only for short city trips the gentlest possible use?

- A) Yes, little distance and low speed
- **✓** No, the engine never reaches proper temperature
- C) It depends on the model

**Por que:** Short trips don't let the engine warm enough to evaporate the fuel that builds up in the oil, so the oil ages faster. They also punish the battery, which never fully recharges. It's harsher use than it looks.

<sub>id `urbano-curto` · aula `trait-urban`</sub>

### 50. Does automatic emergency braking let the driver stop paying attention?

- A) Yes, it brakes by itself
- **✓** No, it's support, not a substitute
- C) Only on the highway

**Por que:** These systems reduce the severity of many crashes and prevent some, but they rely on cameras and radar, which struggle with rain, dirt, glare and unusual situations. They were built to assist an attentive driver, not to replace one.

<sub>id `adas-confianca` · aula `cult-adas`</sub>

### 51. Can you fit a tire size different from the original?

- A) Yes, anything that fits the wheel
- **✓** Not ideal, but acceptable if load, speed rating and diameter are respected
- C) Never, it must be identical

**Por que:** There's room, but with rules. Load and speed ratings below spec are a direct risk. And changing the overall diameter throws off the speedometer, odometer and the stability systems, which count wheel rotations.

<sub>id `pneu-medida-trocar` · aula `vid-pneu-medidas`</sub>

### 52. Is a three-cylinder engine shaking more than a four a defect?

- A) Yes, it's poor maintenance
- **✓** No, it's inherent to the design
- C) It only shakes if it's turbocharged

**Por que:** With three cylinders, the internal forces don't cancel as neatly as with four, and vibration is left over. Makers compensate with balance shafts and mounts, but some usually reaches the wheel and the seat, especially at idle.

<sub>id `tres-cilindros` · aula `vid-tres-cilindros`</sub>

### 53. Why does a naturally aspirated car lose power at high altitude?

- A) Fuel burns worse in the cold
- **✓** The air is thinner, less oxygen gets in
- C) Gravity changes

**Por que:** Power depends on how much oxygen gets into the cylinder. At altitude the air is less dense, so less oxygen fits and less power comes out. It's also why turbo engines suffer less up there: the turbo compresses the air before sending it in.

<sub>id `altitude-potencia` · aula `vid-altitude`</sub>

### 54. The main practical difference between a sedan and the hatch of the same model is:

- A) The sedan has a more powerful engine
- **✓** A closed trunk, separated from the cabin
- C) The sedan uses less fuel

**Por que:** It's generally the same mechanicals with a different body. The sedan gains a larger trunk, closed and isolated from the cabin, which helps with noise and luggage security. The hatch gains space versatility and easier maneuvering.

<sub>id `sedan-porta-malas` · aula `vid-sedan`</sub>

### 55. How does a 1.0 turbo deliver power similar to a 1.6 naturally aspirated?

- A) By revving much higher
- **✓** By forcing more air into the cylinder
- C) By using different fuel

**Por que:** The turbo compresses air before intake, so more oxygen fits in the same small cylinder and more fuel can be burnt. That's how a smaller engine delivers a bigger one's power, with the advantage of using less when you drive gently.

<sub>id `tsi-downsizing` · aula `vid-tsi`</sub>

### 56. Does bigger displacement always mean more power?

- A) Yes, it's proportional
- **✓** No, it depends on how the engine breathes
- C) Only in diesel engines

**Por que:** Displacement is the volume the engine moves, and it's only one factor. Turbo, camshaft, injection and port design change how much air gets in and out. That's why a modern 1.0 turbo easily beats an older 1.6 naturally aspirated.

<sub>id `cilindrada-potencia` · aula `vid-cilindrada`</sub>

### 57. Why are inline-six engines famous for smoothness?

- A) Because they're bigger
- **✓** Because their internal forces cancel out naturally
- C) Because they rev lower

**Por que:** In an inline-six, the pistons' motions offset each other in a way that cancels the main vibrations, with no balance shaft needed. It's a rare case of smoothness coming free, from geometry alone, which is why it has such a reputation.

<sub>id `balanceamento-motor` · aula `vid-balanceamento-motor`</sub>

### 58. Does a wing on a street car improve everyday stability?

- A) Yes, it always glues the car to the road
- **✓** At normal speeds, nothing
- C) Yes, and it improves fuel economy

**Por que:** Aerodynamic force grows with the square of speed, so the useful effect appears well above street speeds. Below that, what's left is usually weight and a bit more drag. On track, with proper design, it's a different story.

<sub>id `aerodinamica-asa` · aula `sport-aero`</sub>

### 59. What's the practical advantage of front-wheel drive on a street car?

- A) It's always faster
- **✓** Cheaper, more space-efficient and predictable
- C) It handles more power

**Por que:** With engine and drive up front, the center tunnel disappears and the mechanicals stay concentrated, which cuts cost and frees cabin space. Behavior at the limit also tends to be more predictable for non-racers. Rear drive wins on balance and power handling.

<sub>id `tracao-traseira` · aula `sport-drivetrain`</sub>

### 60. What is the movie 'nitro', really?

- A) A special fuel
- **✓** Nitrous oxide, which brings more oxygen into the engine
- C) A turbo button

**Por que:** Nitrous oxide doesn't burn by itself: it carries extra oxygen, and that's what allows burning more fuel at once. The gain is real and immediate, and so is the risk: without a prepared engine, it's one of the quickest ways to break internals.

<sub>id `nitro-filme` · aula `vid-nitro`</sub>

### 61. Why are spare parts so cheap on popular models?

- A) Because they're lower quality
- **✓** Because production scale drives the price down
- C) Because the government subsidizes them

**Por que:** A model with many units on the road has many parts being made, many shops that already know the job and many supplier options. That drives down price and repair time. It's one of the practical reasons to weigh popularity when buying.

<sub>id `marca-fiat-brasil` · aula `brand-fiat`</sub>

### 62. Is there such a thing as 'air in the driveshaft' to be bled at a shop?

- A) Yes, it's routine maintenance
- **✓** No, it's the oldest joke in the trade
- C) Only on trucks

**Por que:** A driveshaft is a solid shaft that transmits rotation: there's no fluid or air circuit to bleed. The prank exists precisely to catch people who don't know, and it's a good reminder of why understanding the basics before authorizing work pays off.

<sub>id `ar-cardan` · aula `vid-ar-cardan`</sub>

### 63. The service is a few months overdue. What now?

- A) Wait for the next full interval
- **✓** Do it as soon as possible and restart the cycle
- C) Skip it, since it's late anyway

**Por que:** Being late isn't fixed by waiting longer. Old oil loses its properties over time, not just mileage, and a saturated filter stops filtering. Doing it now and restarting the cycle from there is cheaper than waiting for the next interval.

<sub>id `revisao-antecipar` · aula `sit-overdue`</sub>
