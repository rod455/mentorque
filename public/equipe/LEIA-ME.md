# Fotos da equipe

A foto do bloco de autoridade da LP de conversão (`components/lp/Especialista.tsx`).

O nome pode ser `alessandro.jpg`, `alessandro.png` ou `alessandro.jpeg`: o
componente tenta os três, nessa ordem. São três porque o arquivo é subido à
mão e errar a extensão é o engano mais fácil do mundo, e o sintoma seria a
página cair nas iniciais sem dizer por quê.

Enquanto o arquivo não existir, o bloco cai nas iniciais "AV" sozinho, sem
quebrar a página. É de propósito: página de conversão não pode mostrar
retângulo de imagem quebrada.

Como preparar a foto:

- recorte QUADRADO, centralizado no rosto (o bloco usa `object-top`, então
  sobra do queixo para baixo, nunca da testa para cima);
- pelo menos 400x400px, para não borrar em tela retina;
- prefira `.jpg` e comprima (mire abaixo de 150 KB): é imagem de tráfego
  pago, e cada quilobyte atrasa a página que você está pagando para carregar.
