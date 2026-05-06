export interface Match {
  id: string;
  group: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  location?: string;
}

export interface Round {
  name: string;
  matches: Match[];
}

export const WORLD_CUP_2026_ROUNDS: Round[] = [
  {
    name: "1ª Rodada",
    matches: [
      { id: "1", group: "A", homeTeam: "México", awayTeam: "África do Sul", date: "2026-06-11", time: "16:00" },
      { id: "2", group: "A", homeTeam: "República da Coreia", awayTeam: "República Tcheca", date: "2026-06-11", time: "23:00" },
      { id: "3", group: "B", homeTeam: "Canadá", awayTeam: "Bósnia e Herzegovina", date: "2026-06-12", time: "16:00" },
      { id: "4", group: "D", homeTeam: "Estados Unidos", awayTeam: "Paraguai", date: "2026-06-12", time: "22:00" },
      { id: "5", group: "B", homeTeam: "Catar", awayTeam: "Suíça", date: "2026-06-13", time: "16:00" },
      { id: "6", group: "C", homeTeam: "Brasil", awayTeam: "Marrocos", date: "2026-06-13", time: "19:00" },
      { id: "7", group: "C", homeTeam: "Haiti", awayTeam: "Escócia", date: "2026-06-13", time: "22:00" },
      { id: "8", group: "D", homeTeam: "Austrália", awayTeam: "Turquia", date: "2026-06-14", time: "01:00" },
      { id: "9", group: "E", homeTeam: "Alemanha", awayTeam: "Curaçau", date: "2026-06-14", time: "14:00" },
      { id: "10", group: "F", homeTeam: "Holanda", awayTeam: "Japão", date: "2026-06-14", time: "17:00" },
      { id: "11", group: "E", homeTeam: "Costa do Marfim", awayTeam: "Equador", date: "2026-06-14", time: "20:00" },
      { id: "12", group: "F", homeTeam: "Suécia", awayTeam: "Tunísia", date: "2026-06-14", time: "23:00" },
      { id: "13", group: "H", homeTeam: "Espanha", awayTeam: "Cabo Verde", date: "2026-06-15", time: "13:00" },
      { id: "14", group: "G", homeTeam: "Bélgica", awayTeam: "Egito", date: "2026-06-15", time: "16:00" },
      { id: "15", group: "H", homeTeam: "Arábia Saudita", awayTeam: "Uruguai", date: "2026-06-15", time: "19:00" },
      { id: "16", group: "G", homeTeam: "Irã", awayTeam: "Nova Zelândia", date: "2026-06-15", time: "22:00" },
      { id: "17", group: "I", homeTeam: "França", awayTeam: "Senegal", date: "2026-06-16", time: "16:00" },
      { id: "18", group: "I", homeTeam: "Iraque", awayTeam: "Noruega", date: "2026-06-16", time: "19:00" },
      { id: "19", group: "J", homeTeam: "Argentina", awayTeam: "Argélia", date: "2026-06-16", time: "22:00" },
      { id: "20", group: "J", homeTeam: "Áustria", awayTeam: "Jordânia", date: "2026-06-17", time: "01:00" },
      { id: "21", group: "K", homeTeam: "Portugal", awayTeam: "República Democrática do Congo", date: "2026-06-17", time: "14:00" },
      { id: "22", group: "L", homeTeam: "Inglaterra", awayTeam: "Croácia", date: "2026-06-17", time: "17:00" },
      { id: "23", group: "L", homeTeam: "Gana", awayTeam: "Panamá", date: "2026-06-17", time: "20:00" },
      { id: "24", group: "K", homeTeam: "Uzbequistão", awayTeam: "Colômbia", date: "2026-06-17", time: "21:00" },
    ]
  },
  {
    name: "2ª Rodada",
    matches: [
      { id: "25", group: "A", homeTeam: "República Tcheca", awayTeam: "África do Sul", date: "2026-06-18", time: "13:00" },
      { id: "26", group: "B", homeTeam: "Suíça", awayTeam: "Bósnia e Herzegovina", date: "2026-06-18", time: "16:00" },
      { id: "27", group: "B", homeTeam: "Canadá", awayTeam: "Catar", date: "2026-06-18", time: "19:00" },
      { id: "28", group: "A", homeTeam: "México", awayTeam: "República da Coreia", date: "2026-06-18", time: "22:00" },
      { id: "29", group: "D", homeTeam: "Turquia", awayTeam: "Paraguai", date: "2026-06-19", time: "00:00" },
      { id: "30", group: "D", homeTeam: "Estados Unidos", awayTeam: "Austrália", date: "2026-06-19", time: "16:00" },
      { id: "31", group: "C", homeTeam: "Escócia", awayTeam: "Marrocos", date: "2026-06-19", time: "19:00" },
      { id: "32", group: "C", homeTeam: "Brasil", awayTeam: "Haiti", date: "2026-06-19", time: "21:30" },
      { id: "33", group: "F", homeTeam: "Holanda", awayTeam: "Suécia", date: "2026-06-20", time: "14:00" },
      { id: "34", group: "E", homeTeam: "Alemanha", awayTeam: "Costa do Marfim", date: "2026-06-20", time: "17:00" },
      { id: "35", group: "E", homeTeam: "Equador", awayTeam: "Curaçau", date: "2026-06-20", time: "21:00" },
      { id: "36", group: "F", homeTeam: "Tunísia", awayTeam: "Japão", date: "2026-06-20", time: "23:00" },
      { id: "37", group: "H", homeTeam: "Espanha", awayTeam: "Arábia Saudita", date: "2026-06-21", time: "13:00" },
      { id: "38", group: "G", homeTeam: "Bélgica", awayTeam: "Irã", date: "2026-06-21", time: "16:00" },
      { id: "39", group: "H", homeTeam: "Uruguai", awayTeam: "Cabo Verde", date: "2026-06-21", time: "19:00" },
      { id: "40", group: "G", homeTeam: "Nova Zelândia", awayTeam: "Egito", date: "2026-06-21", time: "22:00" },
      { id: "41", group: "J", homeTeam: "Argentina", awayTeam: "Áustria", date: "2026-06-22", time: "14:00" },
      { id: "42", group: "I", homeTeam: "França", awayTeam: "Iraque", date: "2026-06-22", time: "18:00" },
      { id: "43", group: "I", homeTeam: "Noruega", awayTeam: "Senegal", date: "2026-06-22", time: "21:00" },
      { id: "44", group: "J", homeTeam: "Jordânia", awayTeam: "Argélia", date: "2026-06-23", time: "00:00" },
      { id: "45", group: "K", homeTeam: "Portugal", awayTeam: "Uzbequistão", date: "2026-06-23", time: "14:00" },
      { id: "46", group: "L", homeTeam: "Inglaterra", awayTeam: "Gana", date: "2026-06-23", time: "17:00" },
      { id: "47", group: "L", homeTeam: "Panamá", awayTeam: "Croácia", date: "2026-06-23", time: "20:00" },
      { id: "48", group: "K", homeTeam: "Colômbia", awayTeam: "República Democrática do Congo", date: "2026-06-23", time: "23:00" },
    ]
  },
  {
    name: "3ª Rodada",
    matches: [
      { id: "49", group: "B", homeTeam: "Suíça", awayTeam: "Canadá", date: "2026-06-24", time: "16:00" },
      { id: "50", group: "B", homeTeam: "Bósnia e Herzegovina", awayTeam: "Catar", date: "2026-06-24", time: "16:00" },
      { id: "51", group: "C", homeTeam: "Escócia", awayTeam: "Brasil", date: "2026-06-24", time: "19:00" },
      { id: "52", group: "C", homeTeam: "Marrocos", awayTeam: "Haiti", date: "2026-06-24", time: "19:00" },
      { id: "53", group: "A", homeTeam: "República Tcheca", awayTeam: "México", date: "2026-06-24", time: "22:00" },
      { id: "54", group: "A", homeTeam: "África do Sul", awayTeam: "República da Coreia", date: "2026-06-24", time: "22:00" },
      { id: "55", group: "E", homeTeam: "Equador", awayTeam: "Alemanha", date: "2026-06-25", time: "17:00" },
      { id: "56", group: "E", homeTeam: "Curaçau", awayTeam: "Costa do Marfim", date: "2026-06-25", time: "17:00" },
      { id: "57", group: "F", homeTeam: "Japão", awayTeam: "Suécia", date: "2026-06-25", time: "20:00" },
      { id: "58", group: "F", homeTeam: "Tunísia", awayTeam: "Holanda", date: "2026-06-25", time: "20:00" },
      { id: "59", group: "D", homeTeam: "Turquia", awayTeam: "Estados Unidos", date: "2026-06-25", time: "23:00" },
      { id: "60", group: "D", homeTeam: "Paraguai", awayTeam: "Austrália", date: "2026-06-25", time: "23:00" },
      { id: "61", group: "I", homeTeam: "Noruega", awayTeam: "França", date: "2026-06-26", time: "16:00" },
      { id: "62", group: "I", homeTeam: "Senegal", awayTeam: "Iraque", date: "2026-06-26", time: "16:00" },
      { id: "63", group: "H", homeTeam: "Cabo Verde", awayTeam: "Arábia Saudita", date: "2026-06-26", time: "21:00" },
      { id: "64", group: "H", homeTeam: "Uruguai", awayTeam: "Espanha", date: "2026-06-26", time: "21:00" },
      { id: "65", group: "G", homeTeam: "Egito", awayTeam: "Irã", date: "2026-06-27", time: "00:00" },
      { id: "66", group: "G", homeTeam: "Nova Zelândia", awayTeam: "Bélgica", date: "2026-06-27", time: "00:00" },
      { id: "67", group: "L", homeTeam: "Panamá", awayTeam: "Inglaterra", date: "2026-06-27", time: "18:00" },
      { id: "68", group: "L", homeTeam: "Croácia", awayTeam: "Gana", date: "2026-06-27", time: "18:00" },
      { id: "69", group: "K", homeTeam: "Colômbia", awayTeam: "Portugal", date: "2026-06-27", time: "20:30" },
      { id: "70", group: "K", homeTeam: "República Democrática do Congo", awayTeam: "Uzbequistão", date: "2026-06-27", time: "20:30" },
      { id: "71", group: "J", homeTeam: "Argélia", awayTeam: "Áustria", date: "2026-06-27", time: "23:00" },
      { id: "72", group: "J", homeTeam: "Jordânia", awayTeam: "Argentina", date: "2026-06-27", time: "23:00" },
    ]
  }
];
