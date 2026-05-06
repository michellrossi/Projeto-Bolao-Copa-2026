export interface Group {
  id: string;
  name: string;
  teams: string[];
}

export const WORLD_CUP_2026_GROUPS: Group[] = [
  { id: "A", name: "Grupo A", teams: ["México", "África do Sul", "Coreia do Sul", "República Tcheca"] },
  { id: "B", name: "Grupo B", teams: ["Canadá", "Bósnia", "Catar", "Suíça"] },
  { id: "C", name: "Grupo C", teams: ["Brasil", "Marrocos", "Haiti", "Escócia"] },
  { id: "D", name: "Grupo D", teams: ["Estados Unidos", "Paraguai", "Austrália", "Turquia"] },
  { id: "E", name: "Grupo E", teams: ["Alemanha", "Curaçau", "Costa do Marfim", "Equador"] },
  { id: "F", name: "Grupo F", teams: ["Holanda", "Japão", "Suécia", "Tunísia"] },
  { id: "G", name: "Grupo G", teams: ["Bélgica", "Egito", "Irã", "Nova Zelândia"] },
  { id: "H", name: "Grupo H", teams: ["Espanha", "Cabo Verde", "Arábia Saudita", "Uruguai"] },
  { id: "I", name: "Grupo I", teams: ["França", "Senegal", "Iraque", "Noruega"] },
  { id: "J", name: "Grupo J", teams: ["Argentina", "Argélia", "Áustria", "Jordânia"] },
  { id: "K", name: "Grupo K", teams: ["Portugal", "Congo", "Uzbequistão", "Colômbia"] },
  { id: "L", name: "Grupo L", teams: ["Inglaterra", "Croácia", "Gana", "Panamá"] }
];
