export interface KnockoutMatch {
  id: string;
  phase: string;
  homePlaceholder: string;
  awayPlaceholder: string;
  date: string;
  time: string;
}

export const KNOCKOUT_MATCHES: KnockoutMatch[] = [
  // FASE MATA-MATA (Round of 32)
  { id: "M1", phase: "Mata-Mata", homePlaceholder: "2º do Grupo A", awayPlaceholder: "2º do Grupo B", date: "2026-06-28", time: "16:00" },
  { id: "M2", phase: "Mata-Mata", homePlaceholder: "1º do Grupo E", awayPlaceholder: "3º do Grupo (A, B, C, D ou F)", date: "2026-06-29", time: "17:30" },
  { id: "M3", phase: "Mata-Mata", homePlaceholder: "1º do Grupo F", awayPlaceholder: "2º do Grupo C", date: "2026-06-29", time: "22:00" },
  { id: "M4", phase: "Mata-Mata", homePlaceholder: "1º do Grupo C", awayPlaceholder: "2º do Grupo F", date: "2026-06-29", time: "14:00" },
  { id: "M5", phase: "Mata-Mata", homePlaceholder: "1º do Grupo I", awayPlaceholder: "3º do Grupo (C, D, F, G ou H)", date: "2026-06-30", time: "18:00" },
  { id: "M6", phase: "Mata-Mata", homePlaceholder: "2º do Grupo E", awayPlaceholder: "2º do Grupo I", date: "2026-06-30", time: "14:00" },
  { id: "M7", phase: "Mata-Mata", homePlaceholder: "1º do Grupo A", awayPlaceholder: "3º do Grupo (C, E, F, H ou I)", date: "2026-06-30", time: "22:00" },
  { id: "M8", phase: "Mata-Mata", homePlaceholder: "1º do Grupo D", awayPlaceholder: "3º do Grupo (B, E, F, I ou J)", date: "2026-07-01", time: "21:00" },
  { id: "M9", phase: "Mata-Mata", homePlaceholder: "1º do Grupo G", awayPlaceholder: "3º do Grupo (A, E, H, I ou J)", date: "2026-07-01", time: "17:00" },
  { id: "M10", phase: "Mata-Mata", homePlaceholder: "1º do Grupo L", awayPlaceholder: "3º do Grupo (E, H, I, J ou K)", date: "2026-07-01", time: "13:00" },
  { id: "M11", phase: "Mata-Mata", homePlaceholder: "1º do Grupo K", awayPlaceholder: "2º do Grupo L", date: "2026-07-02", time: "20:00" },
  { id: "M12", phase: "Mata-Mata", homePlaceholder: "1º do Grupo H", awayPlaceholder: "2º do Grupo J", date: "2026-07-02", time: "16:00" },
  { id: "M13", phase: "Mata-Mata", homePlaceholder: "1º do Grupo B", awayPlaceholder: "3º do Grupo (E, F, G, I ou J)", date: "2026-07-03", time: "01:00" },
  { id: "M14", phase: "Mata-Mata", homePlaceholder: "1º do Grupo J", awayPlaceholder: "2º do Grupo H", date: "2026-07-03", time: "19:00" },
  { id: "M15", phase: "Mata-Mata", homePlaceholder: "2º do Grupo D", awayPlaceholder: "2º do Grupo G", date: "2026-07-03", time: "15:00" },
  { id: "M16", phase: "Mata-Mata", homePlaceholder: "1º do Grupo K", awayPlaceholder: "3º do Grupo (D, E, I, J ou L)", date: "2026-07-03", time: "22:30" },

  // OITAVAS DE FINAL
  { id: "O1", phase: "Oitavas", homePlaceholder: "Vencedor Jogo M1", awayPlaceholder: "Vencedor Jogo M2", date: "2026-07-04", time: "18:00" },
  { id: "O2", phase: "Oitavas", homePlaceholder: "Vencedor Jogo M3", awayPlaceholder: "Vencedor Jogo M4", date: "2026-07-04", time: "14:00" },
  { id: "O3", phase: "Oitavas", homePlaceholder: "Vencedor Jogo M5", awayPlaceholder: "Vencedor Jogo M6", date: "2026-07-05", time: "17:00" },
  { id: "O4", phase: "Oitavas", homePlaceholder: "Vencedor Jogo M7", awayPlaceholder: "Vencedor Jogo M8", date: "2026-07-05", time: "21:00" },
  { id: "O5", phase: "Oitavas", homePlaceholder: "Vencedor Jogo M9", awayPlaceholder: "Vencedor Jogo M10", date: "2026-07-06", time: "16:00" },
  { id: "O6", phase: "Oitavas", homePlaceholder: "Vencedor Jogo M11", awayPlaceholder: "Vencedor Jogo M12", date: "2026-07-06", time: "21:00" },
  { id: "O7", phase: "Oitavas", homePlaceholder: "Vencedor Jogo M13", awayPlaceholder: "Vencedor Jogo M14", date: "2026-07-07", time: "13:00" },
  { id: "O8", phase: "Oitavas", homePlaceholder: "Vencedor Jogo M15", awayPlaceholder: "Vencedor Jogo M16", date: "2026-07-07", time: "17:00" },

  // QUARTAS DE FINAL
  { id: "Q1", phase: "Quartas", homePlaceholder: "Vencedor O1", awayPlaceholder: "Vencedor O2", date: "2026-07-09", time: "17:00" },
  { id: "Q2", phase: "Quartas", homePlaceholder: "Vencedor O3", awayPlaceholder: "Vencedor O4", date: "2026-07-10", time: "16:00" },
  { id: "Q3", phase: "Quartas", homePlaceholder: "Vencedor O5", awayPlaceholder: "Vencedor O6", date: "2026-07-11", time: "18:00" },
  { id: "Q4", phase: "Quartas", homePlaceholder: "Vencedor O7", awayPlaceholder: "Vencedor O8", date: "2026-07-11", time: "22:00" },

  // SEMIFINAIS
  { id: "S1", phase: "Seminais", homePlaceholder: "Vencedor Q1", awayPlaceholder: "Vencedor Q2", date: "2026-07-14", time: "16:00" },
  { id: "S2", phase: "Seminais", homePlaceholder: "Vencedor Q3", awayPlaceholder: "Vencedor Q4", date: "2026-07-15", time: "16:00" },

  // FINAIS
  { id: "F3", phase: "Final", homePlaceholder: "Perdedor S1", awayPlaceholder: "Perdedor S2", date: "2026-07-18", time: "18:00" },
  { id: "F1", phase: "Final", homePlaceholder: "Vencedor S1", awayPlaceholder: "Vencedor S2", date: "2026-07-19", time: "16:00" },
];
