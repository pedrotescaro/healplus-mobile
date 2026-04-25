export const STORAGE_KEY = '@healplus_local_db_v4';
export const ONBOARDING_STORAGE_KEY = '@healplus_onboarding_seen_v1';
export const APP_VERSION = require('../../app.json')?.expo?.version || '1.0.0';
export const LOGO_IMAGE = require('../../assets/logo.png');

export const PROFILE_STACK_SCREENS = [
  'Perfil',
  'EditarPerfil',
  'Notificacoes',
  'Privacidade',
  'SobreApp',
];

export const BOTTOM_NAV_HORIZONTAL_PADDING = 8;
export const BOTTOM_NAV_INDICATOR_WIDTH = 88;
export const BOTTOM_NAV_INDICATOR_HEIGHT = 2;
export const BOTTOM_NAV_INDICATOR_LEFT_BIAS = 6;
export const ANDROID_BOTTOM_NAV_MIN_SPACER = 52;
export const BOTTOM_NAV_TABS = ['Home', 'Pacientes', 'Avaliacao', 'Agenda', 'Perfil'];

export const SCREEN_SKELETON_CONFIGS = {
  Home: { variant: 'home', top: 108, bottom: 92 },
  Pacientes: { variant: 'patients', top: 108, bottom: 92 },
  Agenda: { variant: 'agenda', top: 108, bottom: 92 },
  Avaliacao: { variant: 'form', top: 108, bottom: 92 },
  Perfil: { variant: 'profile', top: 84, bottom: 92 },
  EditarPerfil: { variant: 'form', top: 84, bottom: 0 },
  Notificacoes: { variant: 'profile', top: 84, bottom: 92 },
  Privacidade: { variant: 'profile', top: 84, bottom: 92 },
  SobreApp: { variant: 'profile', top: 84, bottom: 92 },
  Relatorios: { variant: 'form', top: 82, bottom: 92 },
  CompararRelatorios: { variant: 'form', top: 82, bottom: 0 },
  ChatBot: { variant: 'chat', top: 70, bottom: 120 },
  ChatBotInfo: { variant: 'home', top: 82, bottom: 0 },
};

export const SCREEN_SKELETON_MIN_VISIBLE_MS = 140;
export const SCREEN_SKELETON_FADE_DURATION_MS = 260;

export const MONTH_NAMES_PT = [
  'Janeiro',
  'Fevereiro',
  'Marco',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const MONTH_NAMES_PT_LOWER = MONTH_NAMES_PT.map(month => month.toLowerCase());

export const WEEKDAY_SHORT_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

export const WEEKDAY_FULL_PT = [
  'Domingo',
  'Segunda-feira',
  'Terca-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sabado',
];

export const AGENDA_TYPE_OPTIONS = [
  'Troca de Curativo',
  'Retorno',
  'Follow-up',
  'Avaliacao Fotografica',
  'Wound Care',
  'Primeira Consulta',
];

export const AGENDA_STATUS_OPTIONS = ['Confirmado', 'Pendente', 'Cancelado'];

export const FORM_OPTIONS = {
  estadoCivil: ['Solteiro(a)', 'Casado(a)', 'Uniao estavel', 'Divorciado(a)', 'Viuvo(a)'],
  nivelAtividade: ['Acamado', 'Sedentario', 'Parcialmente ativo', 'Ativo'],
  compreensaoAdesao: ['Boa', 'Regular', 'Baixa'],
  pulsosPerifericos: ['Presentes', 'Diminuídos', 'Ausentes', 'Nao avaliado'],
  localizacaoFerida: [
    'Regiao Sacral (Posterior)',
    'Calcanhar Direito',
    'Calcanhar Esquerdo',
    'Torax (Anterior)',
    'Costas (Posterior)',
    'Perna Esquerda (Anterior)',
    'Perna Direita (Anterior)',
    'Abdome',
    'MIE - Tornozelo',
    'MMII',
    'MMSS',
  ],
  etiologiaFerida: [
    'Lesao por Pressao',
    'Ulcera Venosa',
    'Ulcera Arterial',
    'Pe Diabetico',
    'Ferida Cirurgica',
    'Ferida Traumatica',
    'Queimadura',
    'Outra',
  ],
  quantidadeExsudato: ['Ausente', 'Escasso', 'Pequeno', 'Moderado', 'Abundante'],
  tipoExsudato: ['Seroso', 'Sanguinolento', 'Serossanguinolento', 'Purulento', 'Seropurulento'],
  consistenciaExsudato: ['Fina', 'Viscosa', 'Espessa'],
  bordasCaracteristicas: ['Regulares', 'Irregulares', 'Elevadas', 'Maceradas', 'Epitelizadas'],
  fixacaoBordas: ['Aderidas', 'Nao aderidas', 'Descoladas'],
  velocidadeCicatrizacao: ['Rapida', 'Moderada', 'Lenta', 'Estagnada'],
  pelePerilesionalUmidade: ['Seca', 'Hidratada', 'Macerada', 'Edemaciada'],
};

export const COMORBIDADES_CONFIG = [
  ['dmi', 'DMI'],
  ['dmii', 'DMII'],
  ['has', 'HAS'],
  ['neoplasia', 'Neoplasia'],
  ['hiv_aids', 'HIV/AIDS'],
  ['obesidade', 'Obesidade'],
  ['cardiopatia', 'Cardiopatia'],
  ['dpoc', 'DPOC'],
  ['doenca_hematologica', 'Doenca Hematologica'],
  ['doenca_vascular', 'Doenca Vascular'],
  ['demencia_senil', 'Demencia Senil'],
  ['insuficiencia_renal', 'Insuficiencia Renal'],
  ['hanseniase', 'Hanseniase'],
  ['insuficiencia_hepatica', 'Insuficiencia Hepatica'],
  ['doenca_autoimune', 'Doenca Autoimune'],
];

export const MEDICAMENTOS_CONFIG = [
  ['anti_hipertensivo', 'Anti-hipertensivo'],
  ['corticoides', 'Corticoides'],
  ['hipoglicemiantes_orais', 'Hipoglicemiantes Orais'],
  ['aines', 'AINES'],
  ['insulina', 'Insulina'],
  ['drogas_vasoativa', 'Drogas Vasoativas'],
  ['suplemento', 'Suplemento'],
  ['anticoagulante', 'Anticoagulante'],
  ['vitaminico', 'Vitaminico'],
  ['antirretroviral', 'Antirretroviral'],
];
