import type { Tradutor } from "./base";

// O catálogo de veículos que alimenta o "Adicionar carro".
//
// São dados, não texto de interface: marca e modelo não se traduzem. Ficam
// separados da cópia porque mudam por outro motivo e em outra frequência (um
// modelo novo por ano, não uma frase reescrita por semana).
export function veiculos(_T: Tradutor) {

// ---- Vehicle catalog (for Adicionar carro) -------------------------------
const makes: Record<"car" | "moto", string[]> = {
  car: [
    "Volkswagen", "Chevrolet", "Fiat", "Toyota", "Hyundai", "Honda", "Jeep", "Renault",
    "Nissan", "Ford", "Peugeot", "Citroën", "Caoa Chery", "BYD", "Mitsubishi", "Kia",
    "Ram", "GWM", "Volvo", "BMW", "Mercedes-Benz", "Audi", "Land Rover", "Suzuki",
  ],
  moto: [
    "Honda", "Yamaha", "Suzuki", "Haojue", "Shineray", "Dafra", "Royal Enfield",
    "BMW", "Kawasaki", "Harley-Davidson", "Triumph", "KTM", "Ducati", "Kasinski",
  ],
};
// Car models by make — os mais vendidos do Brasil, novos E de frota.
//
// A lista nasceu olhando só para o que se vende zero km, e isso deixava de
// fora carro que está na rua às centenas de milhares. Em 04/09/2026, dos dez
// carros mais comuns da frota brasileira (Gol, Uno, Palio, Strada, Onix,
// Fiesta, Celta, Fox, HB20, Ka), DOIS não podiam nem ser cadastrados aqui:
// Fiesta e Celta. Quem tem um deles abria o app, procurava o próprio carro e
// não achava. É o pior primeiro minuto que existe.
//
// A regra que ficou: **modelo fora de linha continua entrando enquanto estiver
// na rua.** Quem cuida do carro em casa, que é o nosso público, dirige o carro
// de dez anos, não o do ano. A `npm run conferir:frota` cobra a lista da frota.
const modelsByMake: Record<string, string[]> = {
  Volkswagen: ["Polo", "Nivus", "T-Cross", "Virtus", "Gol", "Saveiro", "Amarok", "Taos", "Jetta", "Tera", "Voyage", "Fusca", "Fox", "CrossFox", "SpaceFox", "Parati", "Kombi", "Up!", "Golf", "Tiguan Allspace", "Passat"],
  Chevrolet: ["Onix", "Onix Plus", "Tracker", "Spin", "Montana", "S10", "Equinox", "Trailblazer", "Cruze", "Cruze Sport6", "Blazer", "Cobalt", "Prisma", "Joy", "Sonic", "Celta", "Corsa", "Classic", "Astra", "Vectra", "Meriva", "Agile"],
  Fiat: ["Strada", "Argo", "Mobi", "Pulse", "Pulse Abarth", "Fastback", "Toro", "Cronos", "Fiorino", "Titano", "Ducato", "Uno", "Palio", "Palio Weekend", "Siena", "Idea", "Doblò", "Punto", "Grand Siena", "Bravo", "500"],
  Toyota: ["Corolla", "Corolla Cross", "Hilux", "Yaris", "Yaris Sedan", "SW4", "RAV4", "Camry", "Etios", "Etios Sedan"],
  Hyundai: ["HB20", "HB20S", "HB20X", "Creta", "Tucson", "Santa Fe", "ix35", "Azera", "Kona", "i30"],
  Honda: ["HR-V", "City", "City Hatchback", "Civic", "WR-V", "ZR-V", "CR-V", "Fit", "Accord"],
  Jeep: ["Renegade", "Compass", "Commander", "Wrangler", "Gladiator"],
  Renault: ["Kwid", "Kardian", "Duster", "Oroch", "Sandero", "Logan", "Stepway", "Captur", "Master", "Megane", "Fluence", "Boreal", "Koleos", "Clio", "Symbol"],
  Nissan: ["Kicks", "Versa", "Frontier", "Sentra", "March", "Leaf", "Livina", "Grand Livina", "Kait", "GT-R", "Tiida"],
  Ford: ["Ranger", "Territory", "Bronco", "Bronco Sport", "Maverick", "Mustang", "Ka", "Ka Sedan", "EcoSport", "Fiesta", "Fiesta Sedan", "Focus"],
  Peugeot: ["208", "2008", "3008", "5008", "Partner", "Expert", "Boxer", "308", "408", "206", "207", "307"],
  "Citroën": ["C3", "C3 Aircross", "Basalt", "C4 Cactus", "C4 Lounge", "Jumpy", "Jumper"],
  "Caoa Chery": ["Tiggo 2", "Tiggo 3x", "Tiggo 5x", "Tiggo 7", "Tiggo 7 Pro", "Tiggo 8", "Tiggo 8 Pro", "Arrizo 6"],
  BYD: ["Dolphin", "Dolphin Mini", "Dolphin Plus", "Song Plus", "Song Pro", "Yuan Plus", "Yuan Pro", "Seal", "King", "Han", "Tan", "Atto 8"],
  Mitsubishi: ["L200 Triton", "Triton Sport", "Pajero Sport", "Eclipse Cross", "Outlander", "ASX", "Pajero"],
  Kia: ["Sportage", "Seltos", "Sorento", "Stonic", "Carnival", "Cerato", "Bongo"],
  Ram: ["Rampage", "1500", "2500", "3500", "Classic"],
  GWM: ["Haval H6", "Haval H6 GT", "Ora 03", "Poer"],
  Volvo: ["XC40", "XC60", "XC90", "C40", "EX30", "S60", "EX90"],
  BMW: ["320i", "118i", "X1", "X3", "X4", "X5", "X6", "Z4"],
  "Mercedes-Benz": ["C180", "C200", "A200", "GLA 200", "GLB 200", "GLC 300", "Sprinter"],
  Audi: ["A3", "A4", "Q3", "Q5", "Q7", "Q8"],
  "Land Rover": ["Range Rover Evoque", "Discovery Sport", "Defender", "Range Rover Velar", "Discovery"],
  Suzuki: ["Jimny", "Jimny Sierra", "S-Cross", "Vitara"],
};
// Motorcycle models by make (kept separate so the car search never lists motos).
//
// POR QUE ESTA LISTA CRESCEU DE 37 PARA O QUE ESTÁ AQUI (27/09/2026). Chegou
// um "Quero cadastrar minha moto" pelo suporte. O seletor Carro/Moto existe e
// funciona desde sempre, mas o catálogo tinha SEIS marcas e 37 modelos contra
// 24 marcas e 235 modelos de carro: era vitrine de concessionária, o mesmo
// defeito que a nota do catálogo de carro acima descreve e manda não repetir.
// O banco concordava: 68 veículos cadastrados, NENHUM do tipo moto.
//
// O erro mais caro era de NOME, não de cobertura. A moto mais comum do Brasil
// é a família CG, e ela estava aqui só como "CG 160". Ninguém chama a própria
// moto assim: no tanque está escrito TITAN, FAN, START ou CARGO. Quem digitava
// "Titan" recebia "Nenhum carro encontrado" e ia embora. Por isso as variantes
// entram pelo nome do tanque, e não pela cilindrada: a busca é por substring,
// então "CG 160" continua achando as quatro.
//
// Mesma regra do catálogo de carro: modelo fora de linha continua entrando
// enquanto estiver na rua. A CG 125 saiu de linha há mais de uma década e são
// milhões delas rodando. `npm run conferir:frota` cobra as duas listas.
//
// Acentos ficam de fora de propósito ("Tenere", não "Ténéré"): o campo é uma
// busca por substring e ninguém digita acento no teclado do celular.
const motoModelsByMake: Record<string, string[]> = {
  Honda: [
    "CG 160 Titan", "CG 160 Fan", "CG 160 Start", "CG 160 Cargo",
    "CG 150 Titan", "CG 150 Fan", "CG 150 Sport",
    "CG 125 Titan", "CG 125 Fan", "CG 125 Cargo",
    "Biz 125", "Biz 110i", "Biz 100",
    "Pop 110i", "Pop 100",
    "Bros 160", "Bros 150", "Bros 125",
    "XRE 300", "XRE 190",
    "CB 300F Twister", "CB 300R", "CB 250F Twister",
    "CB 500F", "CB 500X", "CB 650R", "CBR 500R", "CBR 650R", "Hornet 600",
    "Falcon NX4", "Tornado XR 250",
    "PCX", "ADV", "Elite 125", "SH 300i",
    "Shadow 750", "Africa Twin",
  ],
  Yamaha: [
    "Factor 150", "Factor 125", "YBR 125", "YBR 150",
    "Fazer 250", "Fazer 150", "Fazer 600",
    "Crosser 150", "Lander 250", "Tenere 250", "Tenere 700",
    "XTZ 125", "XTZ 250",
    "NMAX 160", "Neo 125", "Fluo 125",
    "MT-03", "MT-07", "MT-09", "R3", "R15", "XJ6",
    "Virago 250", "Midnight Star 950",
  ],
  Suzuki: [
    "Yes 125", "Intruder 125", "Intruder 150",
    "Burgman 125", "Burgman 400",
    "DR 160", "V-Strom 650", "V-Strom 1000",
    "GSX-S750", "GSX-R750", "GSX-R1000", "Bandit 650", "Boulevard M800",
  ],
  Haojue: ["DK 150", "DK 160", "Master Ride 150", "Chopper Road 150", "NK 150", "Lindy 125"],
  Shineray: ["Jet 50", "Phoenix 50", "Worker 125", "XY 50Q", "SHI 175"],
  Dafra: ["Citycom 300", "Horizon 150", "Next 250", "Speed 150", "Riva 150", "Apache 150"],
  "Royal Enfield": [
    "Meteor 350", "Hunter 350", "Classic 350", "Bullet 350", "Himalayan",
    "Interceptor 650", "Continental GT 650",
  ],
  BMW: [
    "G 310 R", "G 310 GS", "F 750 GS", "F 850 GS", "F 900 R",
    "R 1250 GS", "R 1300 GS", "S 1000 RR", "S 1000 XR",
  ],
  Kawasaki: [
    "Ninja 300", "Ninja 400", "Ninja 650", "Ninja ZX-10R",
    "Z400", "Z650", "Z900", "Versys 650", "Versys 1000", "Vulcan S",
  ],
  "Harley-Davidson": [
    "Iron 883", "Forty-Eight", "Sportster S", "Street 750",
    "Fat Boy", "Heritage Classic", "Road King", "Pan America",
  ],
  Triumph: [
    "Street Triple", "Speed Triple", "Trident 660", "Bonneville T100",
    "Bonneville T120", "Tiger 660", "Tiger 900", "Scrambler 900",
    "Speed 400", "Scrambler 400 X",
  ],
  KTM: [
    "Duke 200", "Duke 390", "Duke 790", "Duke 890",
    "Adventure 390", "Adventure 790", "Adventure 890", "RC 390",
  ],
  Ducati: [
    "Monster 797", "Monster 937", "Scrambler Icon", "Panigale V2",
    "Panigale V4", "Multistrada V4", "Diavel", "Hypermotard 950",
  ],
  Kasinski: ["Mirage 250", "Comet 250", "Win 110", "Prima 150", "Seta 125"],
};
const years = Array.from({ length: 27 }, (_, i) => 2026 - i);

  return { makes, modelsByMake, motoModelsByMake, years };
}
