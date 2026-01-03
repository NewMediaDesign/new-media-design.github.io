
import { CaseStudy, Course } from './types';

// Definizione dei casi studio (Case Studies) per la sezione portfolio.
export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'customer-care-automation',
    title: 'Automazione Supporto Retail',
    category: 'Customer Care',
    client: 'Swiss Retail Group',
    sector: 'Retail / E-commerce',
    timeline: '3 Mesi',
    stack: ['GPT-4', 'Python', 'Vector DB', 'LangChain'],
    description: 'Implementazione di un sistema di supporto intelligente capace di gestire il 70% delle richieste inbound in autonomia.',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1000',
    challenge: 'L\'azienda riceveva oltre 5.000 ticket settimanali, con tempi di risposta medi superiori alle 12 ore, causando insoddisfazione e abbandono del carrello.',
    solution: 'Abbiamo sviluppato un assistente AI integrato nel CRM aziendale, addestrato sulla knowledge base proprietaria e sulle policy di reso, capace di risolvere problemi complessi in tempo reale.',
    impact: [
      { label: 'Risposta Istantanea', value: '70%', description: 'Riduzione del carico di lavoro manuale' },
      { label: 'Costo per Ticket', value: '-45%', description: 'Efficienza operativa migliorata' },
      { label: 'Customer CSAT', value: '+30%', description: 'Aumento della soddisfazione cliente' }
    ],
    quote: {
      text: "L'integrazione di questa tecnologia ha trasformato il nostro servizio clienti da un centro di costo a un vantaggio competitivo.",
      author: "Marcello V.",
      role: "Head of Operations",
      avatar: "https://i.pravatar.cc/150?u=marcello"
    }
  },
  {
    id: 'marketing-optimization',
    title: 'Hyper-Personalization Marketing',
    category: 'Marketing',
    client: 'Global Tech Corp',
    sector: 'Technology',
    timeline: '4 Mesi',
    stack: ['Claude 3', 'Node.js', 'Stable Diffusion'],
    description: 'Generazione di contenuti dinamici e personalizzazione delle campagne su larga scala tramite AI generativa.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000',
    challenge: 'Necessità di produrre varianti creative per migliaia di segmenti di pubblico diversi, mantenendo coerenza di brand e tempi rapidi.',
    solution: 'Creazione di una pipeline di content generation automatizzata che utilizza LLM per il copywriting e modelli di diffusione per la grafica, tutto validato da un workflow umano-in-the-loop.',
    impact: [
      { label: 'Time-to-market', value: '-80%', description: 'Velocità di esecuzione' },
      { label: 'CTR Campagne', value: '+25%', description: 'Migliore rilevanza dei contenuti' },
      { label: 'ROI Creativo', value: '3x', description: 'Ritorno sull\'investimento' }
    ]
  },
  {
    id: 'supply-chain-predictive',
    title: 'Analisi Predittiva Supply Chain',
    category: 'Supply Chain',
    client: 'Logistics Pro',
    sector: 'Logistica',
    timeline: '6 Mesi',
    stack: ['TensorFlow', 'Gemini Pro', 'BigQuery'],
    description: 'Sistema di previsione della domanda e ottimizzazione dei livelli di stock basato su segnali di mercato deboli.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1000',
    challenge: 'Eccesso di stock in alcuni magazzini e rotture di stock in altri a causa di fluttuazioni di mercato imprevedibili.',
    solution: 'Modello ibrido che combina analisi statistica classica con capacità di ragionamento di modelli linguistici di grandi dimensioni per interpretare news ed eventi macroeconomici.',
    impact: [
      { label: 'Inventory Cost', value: '-15%', description: 'Capitale circolante liberato' },
      { label: 'Accuracy', value: '92%', description: 'Precisione delle previsioni' },
      { label: 'Stockouts', value: '-60%', description: 'Continuità di servizio' }
    ]
  }
];

// Definizione dei corsi (Courses) offerti.
export const COURSES: Course[] = [
  {
    id: 'ai-essentials',
    level: 'Beginner',
    title: 'AI Essentials per il Business',
    description: 'Comprendere le basi dell\'AI generativa e come applicarla immediatamente nel flusso di lavoro quotidiano per massimizzare la produttività personale.',
    duration: '1 Giorno (8h)',
    topics: ['Fondamenti di LLM', 'Prompt Engineering 101', 'Tool di produttività AI', 'Etica e Privacy'],
    icon: 'bolt',
    accent: false
  },
  {
    id: 'advanced-prompting',
    level: 'Avanzato',
    title: 'Mastering Prompt Engineering',
    description: 'Tecniche avanzate di prompting, concatenazione di prompt e workflow di automazione complessi per risolvere problemi aziendali reali.',
    duration: '2 Giorni (16h)',
    topics: ['Few-shot & Chain of Thought', 'Agentic Workflows', 'Retrieval Augmented Generation', 'Testing & Valutazione'],
    icon: 'psychology',
    accent: true
  },
  {
    id: 'executive-ai-strategy',
    level: 'Executive',
    title: 'AI Strategy for Leaders',
    description: 'Definire roadmap strategiche per l\'integrazione dell\'AI a livello enterprise, gestione del cambiamento e calcolo del ROI.',
    duration: '3 Sessioni (4h cad.)',
    topics: ['ROI dell\'AI', 'Governance & Risk Management', 'Costruire Team AI', 'Roadmap di Implementazione'],
    icon: 'leaderboard',
    accent: false
  }
];
