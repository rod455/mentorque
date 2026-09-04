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
  moto: ["Honda", "Yamaha", "Suzuki", "Royal Enfield", "BMW", "Kawasaki"],
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
  Fiat: ["Strada", "Argo", "Mobi", "Pulse", "Pulse Abarth", "Fastback", "Toro", "Cronos", "Fiorino", "Titano", "Ducato", "Uno", "Palio", "Palio Weekend", "Siena", "Idea", "Doblò", "Punto", "Grand Siena", "500"],
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
const motoModelsByMake: Record<string, string[]> = {
  Honda: ["CG 160", "Biz", "Pop 110", "Bros 160", "XRE 300", "CB 300", "CB 500", "PCX", "Elite 125", "ADV"],
  Yamaha: ["Fazer 250", "Factor 150", "YBR 150", "Crosser 150", "MT-03", "MT-07", "NMAX", "Lander 250", "XTZ 250"],
  Suzuki: ["Intruder 150", "GSX-S750", "Burgman", "DR 160", "GSX-R1000"],
  "Royal Enfield": ["Meteor 350", "Hunter 350", "Classic 350", "Bullet 350", "Himalayan"],
  BMW: ["G 310", "F 850 GS", "R 1250 GS", "S 1000 RR"],
  Kawasaki: ["Ninja 400", "Z400", "Versys 650", "Ninja 650"],
};
const years = Array.from({ length: 27 }, (_, i) => 2026 - i);

  return { makes, modelsByMake, motoModelsByMake, years };
}
