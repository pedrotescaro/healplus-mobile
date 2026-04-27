import { Dimensions, Platform, StatusBar } from 'react-native';

import {
  AGENDA_STATUS_OPTIONS,
  AGENDA_TYPE_OPTIONS,
  ANDROID_BOTTOM_NAV_MIN_SPACER,
  COMORBIDADES_CONFIG,
  FORM_OPTIONS,
  MEDICAMENTOS_CONFIG,
  MONTH_NAMES_PT,
  MONTH_NAMES_PT_LOWER,
  WEEKDAY_FULL_PT,
  WEEKDAY_SHORT_PT,
} from '../constants/appConstants';

export const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
export const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
export const pad2 = value => String(value).padStart(2, '0');
export const getMonthStart = date => new Date(date.getFullYear(), date.getMonth(), 1);
export const getDaysInMonth = date => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
export const toAgendaDateKey = date =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

export const parseAgendaDate = value => {
  if (!value || typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const parsed = new Date(year, month, day);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

export const getAgendaMonthLabel = date => `${MONTH_NAMES_PT[date.getMonth()]} ${date.getFullYear()}`;
export const getAgendaFullDateLabel = date =>
  `${WEEKDAY_FULL_PT[date.getDay()]}, ${date.getDate()} de ${MONTH_NAMES_PT_LOWER[date.getMonth()]}`;

export const normalizeText = value =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const maskEmail = value => {
  const [local = '', domain = ''] = String(value || '').split('@');
  if (!local || !domain) return String(value || '');

  const [domainName = '', ...domainSuffix] = domain.split('.');
  const visibleLocal = local.slice(0, Math.min(3, local.length));
  const maskedLocal = `${visibleLocal}${'*'.repeat(Math.max(local.length - visibleLocal.length, 2))}`;
  const visibleDomain = domainName.slice(0, Math.min(1, domainName.length));
  const maskedDomain = `${visibleDomain}${'*'.repeat(
    Math.max(domainName.length - visibleDomain.length, 2)
  )}`;

  return `${maskedLocal}@${maskedDomain}${
    domainSuffix.length ? `.${domainSuffix.join('.')}` : ''
  }`;
};

export const getAndroidBottomInset = () => {
  if (Platform.OS !== 'android') return 0;

  const windowDimensions = Dimensions.get('window');
  const screenDimensions = Dimensions.get('screen');
  const rawInset = Math.max(screenDimensions.height - windowDimensions.height, 0);
  const statusInset = StatusBar.currentHeight || 0;
  const detectedInset =
    rawInset > statusInset + 8 ? Math.max(rawInset - statusInset, 0) : 0;

  return Math.max(detectedInset, ANDROID_BOTTOM_NAV_MIN_SPACER);
};

export const getAgendaDateTime = consulta => {
  const parsedDate = parseAgendaDate(consulta?.date);
  if (!parsedDate) return null;

  const hour = parseInt(consulta?.hora || '0', 10) || 0;
  const minute = parseInt(consulta?.min || '0', 10) || 0;

  return new Date(
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    parsedDate.getDate(),
    hour,
    minute
  );
};

export const sortConsultasByDateTime = consultas =>
  [...consultas].sort((a, b) => {
    const aDate = getAgendaDateTime(a);
    const bDate = getAgendaDateTime(b);
    return (aDate?.getTime() || 0) - (bDate?.getTime() || 0);
  });

export const formatAgendaDateForChat = value => {
  const parsed = value instanceof Date ? value : parseAgendaDate(value);
  if (!parsed) return String(value || 'sem data');
  return `${WEEKDAY_SHORT_PT[parsed.getDay()]}, ${pad2(parsed.getDate())}/${pad2(
    parsed.getMonth() + 1
  )}`;
};

export const getConsultaAppearance = tipo => {
  const normalizedType = (tipo || '').toLowerCase();
  if (normalizedType.includes('foto') || normalizedType.includes('avalia')) {
    return { color: '#8B5CF6', icon: 'camera-outline' };
  }
  if (normalizedType.includes('curativo')) {
    return { color: '#3B82F6', icon: 'bandage-outline' };
  }
  if (normalizedType.includes('follow') || normalizedType.includes('retorno')) {
    return { color: '#F59E0B', icon: 'checkmark-done-outline' };
  }
  if (normalizedType.includes('wound') || normalizedType.includes('consulta')) {
    return { color: '#10B981', icon: 'medkit-outline' };
  }
  return { color: '#3B82F6', icon: 'calendar-outline' };
};

export const getLegacyConsultaDate = diaId => {
  const day = Math.max(1, Math.min(31, 24 + (Number(diaId) || 4)));
  return `2026-03-${pad2(day)}`;
};

export const normalizeConsulta = consulta => {
  const appearance = getConsultaAppearance(consulta?.tipo);
  const parsedHour = Math.max(0, Math.min(23, parseInt(consulta?.hora ?? '8', 10) || 0));
  const parsedMin = Math.max(0, Math.min(59, parseInt(consulta?.min ?? '0', 10) || 0));
  const normalizedDate =
    consulta?.date || consulta?.dataAgenda || getLegacyConsultaDate(consulta?.diaId);

  return {
    id: String(consulta?.id ?? createId()),
    patientId: consulta?.patientId ?? '',
    date: normalizedDate,
    hora: pad2(parsedHour),
    min: pad2(parsedMin),
    paciente: consulta?.paciente || '',
    tipo: consulta?.tipo || AGENDA_TYPE_OPTIONS[1],
    status: consulta?.status || AGENDA_STATUS_OPTIONS[1],
    corLinha: consulta?.corLinha || appearance.color,
    icon: consulta?.icon || appearance.icon,
    observacoes: consulta?.observacoes || '',
  };
};

export const createDefaultAppointments = () => {
  const today = new Date();
  const dayOne = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const dayTwo = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);

  return [
    {
      id: '1',
      date: toAgendaDateKey(dayOne),
      hora: '08',
      min: '00',
      paciente: 'Guilherme Santos',
      tipo: 'Troca de Curativo',
      status: 'Confirmado',
    },
    {
      id: '2',
      date: toAgendaDateKey(dayOne),
      hora: '09',
      min: '30',
      paciente: 'Ana Luiza Pereira',
      tipo: 'Follow-up',
      status: 'Pendente',
    },
    {
      id: '3',
      date: toAgendaDateKey(dayOne),
      hora: '11',
      min: '00',
      paciente: 'Carlos Eduardo Lima',
      tipo: 'Avaliação Fotográfica',
      status: 'Confirmado',
    },
    {
      id: '4',
      date: toAgendaDateKey(dayTwo),
      hora: '14',
      min: '00',
      paciente: 'Fernanda Oliveira',
      tipo: 'Wound Care',
      status: 'Confirmado',
    },
  ].map(normalizeConsulta);
};

export const emptyAgendaForm = (date = toAgendaDateKey(new Date())) => ({
  patientId: '',
  paciente: '',
  tipo: 'Retorno',
  status: 'Pendente',
  date,
  hora: '08',
  min: '00',
  observacoes: '',
});

export const getPainColor = val => {
  if (val <= 2) return '#84CC16';
  if (val <= 4) return '#3B82F6';
  if (val <= 6) return '#FACC15';
  if (val <= 8) return '#F97316';
  return '#EF4444';
};

export const emptyAnamnesis = () => ({
  patientId: '',
  nome_cliente: '',
  data_nascimento: '',
  telefone: '',
  email: '',
  profissao: '',
  estado_civil: '',
  nivel_atividade: '',
  suporte_social: '',
  compreensao_adesao: '',
  objetivo_tratamento: '',
  historico_cicrizacao: '',
  estado_nutricional: '',
  possui_alergia: false,
  qual_alergia: '',
  pratica_atividade_fisica: false,
  qual_atividade: '',
  frequencia_atividade: '',
  ingestao_agua_dia: '',
  ingestao_alcool: false,
  frequencia_alcool: '',
  realizou_cirurgias: false,
  quais_cirurgias: '',
  claudicacao_intermitente: false,
  dor_repouso: false,
  pulsos_perifericos: '',
  fumante: false,
  dmi: false,
  dmii: false,
  has: false,
  neoplasia: false,
  hiv_aids: false,
  obesidade: false,
  cardiopatia: false,
  dpoc: false,
  doenca_hematologica: false,
  doenca_vascular: false,
  demencia_senil: false,
  insuficiencia_renal: false,
  hanseniase: false,
  insuficiencia_hepatica: false,
  doenca_autoimune: false,
  outros_hpp: '',
  anti_hipertensivo: false,
  anti_hipertensivo_nome: '',
  anti_hipertensivo_dose: '',
  corticoides: false,
  corticoides_nome: '',
  corticoides_dose: '',
  hipoglicemiantes_orais: false,
  hipoglicemiantes_orais_nome: '',
  hipoglicemiantes_orais_dose: '',
  aines: false,
  aines_nome: '',
  aines_dose: '',
  insulina: false,
  insulina_nome: '',
  insulina_dose: '',
  drogas_vasoativa: false,
  drogas_vasoativa_nome: '',
  drogas_vasoativa_dose: '',
  suplemento: false,
  suplemento_nome: '',
  suplemento_dose: '',
  anticoagulante: false,
  anticoagulante_nome: '',
  anticoagulante_dose: '',
  vitaminico: false,
  vitaminico_nome: '',
  vitaminico_dose: '',
  antirretroviral: false,
  antirretroviral_nome: '',
  antirretroviral_dose: '',
  outros_medicamento: '',
  woundImageUri: '',
  imagemOriginalUri: '',
  imageUri: '',
  imageBase64: '',
  imageMimeType: '',
  rois: [],
  roiPoints: [],
  roiMask: null,
  ferida_largura: '',
  ferida_comprimento: '',
  ferida_profundidade: '',
  localizacao_ferida: '',
  etiologia_ferida: '',
  etiologia_outra: '',
  tempo_evolucao: '',
  dor_escala: '0',
  dor_fatores: '',
  percentual_granulacao_leito: '',
  percentual_epitelizacao_leito: '',
  percentual_esfacelo_leito: '',
  percentual_necrose_seca_leito: '',
  inflamacao_rubor: false,
  inflamacao_calor: false,
  inflamacao_edema: false,
  inflamacao_dor_local: false,
  inflamacao_perda_funcao: false,
  infeccao_eritema_perilesional: false,
  infeccao_calor_local: false,
  infeccao_edema: false,
  infeccao_dor_local: false,
  infeccao_exsudato: false,
  infeccao_odor: false,
  infeccao_retardo_cicatrizacao: false,
  cultura_realizada: false,
  resultado_cultura: '',
  quantidade_exsudato: '',
  tipo_exsudato: '',
  consistencia_exsudato: '',
  pele_perilesional_umidade: '',
  pele_perilesional_extensao: '',
  bordas_caracteristicas: '',
  fixacao_bordas: '',
  tunel_cavidade: false,
  localizacao_tunel_cavidade: '',
  velocidade_cicatrizacao: '',
  pele_perilesional_integra: false,
  pele_perilesional_eritematosa: false,
  pele_perilesional_macerada: false,
  pele_perilesional_seca_descamativa: false,
  pele_perilesional_eczematosa: false,
  pele_perilesional_hiperpigmentada: false,
  pele_perilesional_hipopigmentada: false,
  pele_perilesional_indurada: false,
  pele_perilesional_sensivel: false,
  pele_perilesional_edema: false,
  observacoes: '',
  data_consulta: '2026-03-31',
  hora_consulta: '23:00',
  profissional_responsavel: '',
  coren: '',
  data_retorno: '',
});

const normalizeRoiPoint = point => {
  const x = Math.min(Math.max(Number(point?.x) || 0, 0), 1);
  const y = Math.min(Math.max(Number(point?.y) || 0, 0), 1);
  return { x, y };
};

const ROI_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

const normalizeRoiItem = (roi, index) => ({
  id: roi?.id || `roi-${index + 1}`,
  label: roi?.label || `ROI ${index + 1}`,
  mode: roi?.mode === 'pen' ? 'pen' : 'points',
  color: roi?.color || ROI_COLORS[index % ROI_COLORS.length],
  points: Array.isArray(roi?.points) ? roi.points.map(normalizeRoiPoint) : [],
  roiImageUri: roi?.roiImageUri || '',
  roiImageBase64: roi?.roiImageBase64 || '',
});

export const normalizeEvaluationImageData = evaluation => {
  const originalForm = evaluation?.form || {};
  const imagemOriginalUri =
    originalForm.imageUri ||
    evaluation?.imageUri ||
    originalForm.imagemOriginalUri ||
    originalForm.woundImageUri ||
    evaluation?.imagemOriginalUri ||
    evaluation?.woundImageUri ||
    '';
  const legacyRoiPoints = Array.isArray(originalForm.roiPoints)
    ? originalForm.roiPoints.map(normalizeRoiPoint)
    : Array.isArray(evaluation?.roiPoints)
      ? evaluation.roiPoints.map(normalizeRoiPoint)
      : [];
  const roisSource = Array.isArray(originalForm.rois)
    ? originalForm.rois
    : Array.isArray(evaluation?.rois)
      ? evaluation.rois
      : legacyRoiPoints.length
        ? [{ id: 'roi-1', label: 'ROI 1', mode: 'points', color: ROI_COLORS[0], points: legacyRoiPoints }]
        : [];
  const rois = roisSource
    .map(normalizeRoiItem)
    .filter(roi => roi.points.length > 0);
  const roiPoints = rois[0]?.points || legacyRoiPoints;
  const roiMask = roiPoints.length >= 3 ? { type: 'polygon', points: roiPoints } : null;
  const imageBase64 = originalForm.imageBase64 || evaluation?.imageBase64 || '';
  const imageMimeType = originalForm.imageMimeType || evaluation?.imageMimeType || '';

  return {
    ...evaluation,
    imageUri: imagemOriginalUri,
    imageBase64,
    imageMimeType,
    imagemOriginalUri,
    woundImageUri: imagemOriginalUri,
    rois,
    roiPoints,
    roiMask,
    form: {
      ...originalForm,
      imageUri: imagemOriginalUri,
      imageBase64,
      imageMimeType,
      woundImageUri: imagemOriginalUri,
      imagemOriginalUri,
      rois,
      roiPoints,
      roiMask,
    },
  };
};

export const createDefaultDb = () => ({
  user: {
    name: 'James Baxter',
    email: 'eve.holt@reqres.in',
    photo: null,
    notificationsEnabled: true,
    emailNotificationsEnabled: true,
    agendaRemindersEnabled: true,
    hideEmailPreviewEnabled: false,
    showProfilePhotoEnabled: true,
  },
  pacientes: [
    {
      id: '1',
      nome: 'Tania Silva',
      telefone: '(11) 99999-9999',
      email: 'tania@email.com',
      dataNasc: '12/05/1985',
      archived: false,
      archivedAt: null,
      avaliacoes: [],
    },
    {
      id: '2',
      nome: 'Teste Pereira',
      telefone: '(11) 88888-8888',
      email: 'teste@email.com',
      dataNasc: '23/08/1990',
      archived: false,
      archivedAt: null,
      avaliacoes: [],
    },
    {
      id: '3',
      nome: 'Guilherme Costa',
      telefone: '(11) 77777-7777',
      email: 'gui@email.com',
      dataNasc: '04/11/1978',
      archived: false,
      archivedAt: null,
      avaliacoes: [],
    },
    {
      id: '4',
      nome: 'Paulo Souza',
      telefone: '(11) 66666-6666',
      email: 'paulo@email.com',
      dataNasc: '19/02/1965',
      archived: false,
      archivedAt: null,
      avaliacoes: [],
    },
  ],
  bancoDeConsultas: createDefaultAppointments(),
});

export const migrateDb = rawData => {
  const defaultDb = createDefaultDb();
  const nextData = rawData || defaultDb;
  const nextPacientes = Array.isArray(nextData.pacientes)
    ? nextData.pacientes.map(paciente => ({
        ...paciente,
        archived: paciente.archived || false,
        archivedAt: paciente.archivedAt || null,
        avaliacoes: Array.isArray(paciente.avaliacoes)
          ? paciente.avaliacoes.map(normalizeEvaluationImageData)
          : [],
      }))
    : defaultDb.pacientes;

  return {
    ...defaultDb,
    ...nextData,
    user: { ...defaultDb.user, ...(nextData.user || {}) },
    pacientes: nextPacientes,
    bancoDeConsultas: Array.isArray(nextData.bancoDeConsultas)
      ? nextData.bancoDeConsultas.map(normalizeConsulta)
      : defaultDb.bancoDeConsultas,
  };
};

export const getStatusStyles = status => {
  if (status === 'Confirmado') return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
  if (status === 'Cancelado') return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' };
  return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' };
};

export const getCompareEvalArea = ev => {
  if (!ev || !ev.form) return 0;
  const width = parseFloat(ev.form.ferida_largura) || 0;
  const length = parseFloat(ev.form.ferida_comprimento) || 0;
  return width * length;
};

export {
  AGENDA_STATUS_OPTIONS,
  AGENDA_TYPE_OPTIONS,
  COMORBIDADES_CONFIG,
  FORM_OPTIONS,
  MEDICAMENTOS_CONFIG,
};
