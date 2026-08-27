# Fotos da equipe

`alessandro.jpg` é usada no bloco de autoridade da LP de conversão
(`components/lp/Especialista.tsx`) e é a única imagem esperada aqui.

Enquanto o arquivo não existir, o bloco cai nas iniciais "AV" sozinho, sem
quebrar a página. É de propósito: página de conversão não pode mostrar
retângulo de imagem quebrada.

Como preparar a foto:

- recorte QUADRADO, centralizado no rosto (o bloco usa `object-top`, então
  sobra do queixo para baixo, nunca da testa para cima);
- pelo menos 400x400px, para não borrar em tela retina;
- `.jpg`, comprimida (mire abaixo de 150 KB): é imagem de tráfego pago, e
  cada quilobyte atrasa a página que você está pagando para carregar.
