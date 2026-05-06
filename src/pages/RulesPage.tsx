import { motion } from 'motion/react';
import { ScrollText, Trophy, Target, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function RulesPage() {
  const rules = [
    {
      icon: Target,
      title: "Pontuação Básica",
      desc: "Ganhe pontos acertando o vencedor ou o placar exato dos jogos.",
      points: [
        { label: "Placar Exato", value: "3 pts", detail: "Ex: Palpite 2x1, Jogo 2x1" },
        { label: "Vencedor e Gols", value: "1 pt", detail: "Ex: Palpite 1x0, Jogo 2x1" },
        { label: "Empate (Placar diferente)", value: "1 pt", detail: "Ex: Palpite 0x0, Jogo 1x1" }
      ]
    },
    {
      icon: Clock,
      title: "Prazos de Envio",
      desc: "O sistema de palpites possui regras rígidas de horário.",
      points: [
        { label: "Trava do Sistema", value: "30 min", detail: "Palpites fecham 30 minutos antes do início real de cada partida." },
        { label: "Alterações", value: "Ilimitadas", detail: "Você pode mudar seu palpite quantas vezes quiser até o momento da trava." }
      ]
    },
    {
      icon: Trophy,
      title: "Critérios de Desempate",
      desc: "Em caso de igualdade de pontos no ranking geral.",
      points: [
        { label: "1º Critério", value: "Placares Exatos", detail: "Quem acertou mais placares exatos (3 pts) fica na frente." },
        { label: "2º Critério", value: "Ordem Alfabética", detail: "Persistindo o empate, prevalece a ordem do nome." }
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">
          <ScrollText className="text-primary w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Regulamento Oficial</span>
        </div>
        <h1 className="text-4xl font-black text-white font-lexend tracking-tight uppercase">
          Regras do <span className="text-primary">Bolão</span>
        </h1>
        <p className="text-white/40 font-medium max-w-lg mx-auto">
          Leia atentamente como funciona a pontuação e os prazos para garantir sua subida no ranking.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 max-w-3xl mx-auto">
        {rules.map((section, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-dark p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <section.icon size={120} />
            </div>

            <div className="flex items-start gap-6 relative z-10">
              <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary flex-shrink-0 border border-primary/10">
                <section.icon size={32} />
              </div>
              <div className="space-y-6 flex-1">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{section.title}</h3>
                  <p className="text-white/40 text-sm font-medium">{section.desc}</p>
                </div>

                <div className="grid gap-3">
                  {section.points.map((point, pIdx) => (
                    <div key={pIdx} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-wider">{point.label}</p>
                        <p className="text-[10px] text-white/30 font-medium">{point.detail}</p>
                      </div>
                      <div className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-xs font-black self-start sm:self-center">
                        {point.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        <div className="bg-secondary/10 border border-secondary/20 rounded-[2rem] p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary flex-shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-white uppercase tracking-widest">Jogo Limpo</p>
            <p className="text-[10px] text-white/40 font-medium">A decisão do administrador sobre resultados e aprovações é soberana e final.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
