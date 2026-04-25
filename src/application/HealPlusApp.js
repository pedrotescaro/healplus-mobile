import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import HomeScreen from '../screens/HomeScreen';
import ReportsScreen from '../screens/ReportsScreen';
import CompareReportsScreen from '../screens/CompareReportsScreen';
import PatientsScreen from '../screens/PatientsScreen';
import AgendaScreen from '../screens/AgendaScreen';
import EvaluationScreen from '../screens/EvaluationScreen';
import ChatBotInfoScreen from '../screens/ChatBotInfoScreen';
import ChatBotScreen from '../screens/ChatBotScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import AboutAppScreen from '../screens/AboutAppScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import LoginScreen from '../screens/LoginScreen';
import SwitchAccountScreen from '../screens/SwitchAccountScreen';
import AgendaAppointmentModal from '../components/modals/AgendaAppointmentModal';
import LoginErrorModal from '../components/modals/LoginErrorModal';
import PatientFormModal from '../components/modals/PatientFormModal';
import ProfilePhotoPickerModal from '../components/modals/ProfilePhotoPickerModal';
import ReportEvaluationSelectionModal from '../components/modals/ReportEvaluationSelectionModal';
import ReportPatientSelectionModal from '../components/modals/ReportPatientSelectionModal';
import appGetStyles from '../styles/getStyles';
import { useTheme } from '../context/ThemeContext';
import {
  APP_VERSION,
  AGENDA_STATUS_OPTIONS as agendaStatusOptions,
  AGENDA_TYPE_OPTIONS as agendaTypeOptions,
  BOTTOM_NAV_HORIZONTAL_PADDING,
  BOTTOM_NAV_INDICATOR_HEIGHT,
  BOTTOM_NAV_INDICATOR_LEFT_BIAS,
  BOTTOM_NAV_INDICATOR_WIDTH,
  BOTTOM_NAV_TABS,
  COMORBIDADES_CONFIG as comorbidadesConfig,
  FORM_OPTIONS as options,
  LOGO_IMAGE,
  MEDICAMENTOS_CONFIG as medicamentosConfig,
  ONBOARDING_STORAGE_KEY,
  PROFILE_STACK_SCREENS,
  SCREEN_SKELETON_CONFIGS,
  SCREEN_SKELETON_FADE_DURATION_MS,
  SCREEN_SKELETON_MIN_VISIBLE_MS,
  STORAGE_KEY,
  WEEKDAY_SHORT_PT,
} from '../constants/appConstants';
import {
  createDefaultDb,
  createId,
  emptyAgendaForm,
  emptyAnamnesis,
  formatAgendaDateForChat,
  getAgendaDateTime,
  getAgendaFullDateLabel,
  getAgendaMonthLabel,
  getAndroidBottomInset,
  getCompareEvalArea as calculateCompareEvalArea,
  getConsultaAppearance,
  getDaysInMonth,
  getMonthStart,
  getPainColor,
  getStatusStyles,
  maskEmail,
  migrateDb,
  normalizeConsulta,
  normalizeText,
  pad2,
  parseAgendaDate,
  sortConsultasByDateTime,
  toAgendaDateKey,
  wait,
} from '../utils/appUtils';
import { getStoredValue, setStoredValue } from '../storage/appStorage';
import {
  buildCameraPickerOptions as imageServiceBuildCameraPickerOptions,
  buildLibraryPickerOptions as imageServiceBuildLibraryPickerOptions,
  executeImageFlow as imageServiceExecuteImageFlow,
} from '../services/imagePickerService';
import {
  buildClinicalReportHtml as reportBuildClinicalReportHtml,
  buildComparisonReportHtml as reportBuildComparisonReportHtml,
  exportHtmlToPdf as exportHtmlToPdfReport,
  makeReport as buildReportFromService,
} from '../services/reportService';
import useBottomNavItems from '../hooks/useBottomNavItems';

const IMAGE_PICKER_MODAL_CLOSE_DELAY_MS = Platform.OS === 'ios' ? 350 : 120;
const USE_NATIVE_DRIVER = Platform.OS !== 'web';
function AppContent() {
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => appGetStyles(colors), [colors]);
  const [loadingDb, setLoadingDb] = useState(true);
  const [db, setDb] = useState(createDefaultDb());
  const [tela, setTela] = useState('Login');
  const [tempName, setTempName] = useState('James Baxter');
  const [tempEmail, setTempEmail] = useState('eve.holt@reqres.in');
  const [tempPhoto, setTempPhoto] = useState(null);
  const [password, setPassword] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoginButtonDimmed, setIsLoginButtonDimmed] = useState(false);
  const [activity, setActivity] = useState(false);
  const [modalErroVisible, setModalErroVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [openPatientMenuId, setOpenPatientMenuId] = useState(null);
  const [modalPacienteVisible, setModalPacienteVisible] = useState(false);
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [isEditingEvaluation, setIsEditingEvaluation] = useState(false);
  const [editingEvaluationId, setEditingEvaluationId] = useState(null);
  const [novoPacNome, setNovoPacNome] = useState('');
  const [novoPacTelefone, setNovoPacTelefone] = useState('');
  const [novoPacEmail, setNovoPacEmail] = useState('');
  const [novoPacDataNasc, setNovoPacDataNasc] = useState('');
  const [agendaMonthDate, setAgendaMonthDate] = useState(() => getMonthStart(new Date()));
  const [selectedAgendaDate, setSelectedAgendaDate] = useState(() => toAgendaDateKey(new Date()));
  const [modalAgendaVisible, setModalAgendaVisible] = useState(false);
  const [agendaForm, setAgendaForm] = useState(() => emptyAgendaForm(toAgendaDateKey(new Date())));
  const [isEditingAgendaAppointment, setIsEditingAgendaAppointment] = useState(false);
  const [editingAgendaAppointmentId, setEditingAgendaAppointmentId] = useState(null);
  const [expandedSection, setExpandedSection] = useState('item-0');
  const [isNotificacoesEnabled, setIsNotificacoesEnabled] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [showProfileImagePickerModal, setShowProfileImagePickerModal] = useState(false);
  const [isImagePickerBusy, setIsImagePickerBusy] = useState(false);
  const [form, setForm] = useState(emptyAnamnesis());
  const [reportPatientId, setReportPatientId] = useState(null);
  const [comparePatientId, setComparePatientId] = useState(null);
  const [compareEvalAId, setCompareEvalAId] = useState(null);
  const [compareEvalBId, setCompareEvalBId] = useState(null);
  const [modalReportPatientVisible, setModalReportPatientVisible] = useState(false);
  const [modalReportEvalVisible, setModalReportEvalVisible] = useState(false);
  const [reportSelectedEvalId, setReportSelectedEvalId] = useState(null);
  const [relatorioPaciente, setRelatorioPaciente] = useState('');
  const [showRelatorioDropdown, setShowRelatorioDropdown] = useState(false);
  const [compareSearchQuery, setCompareSearchQuery] = useState('');
  const [showCompareDropdown, setShowCompareDropdown] = useState(false);
  const [showEvalDropdown, setShowEvalDropdown] = useState(false);
  const [relatorioSelectedEvalId, setRelatorioSelectedEvalId] = useState(null);
  const [incTimers, setIncTimers] = useState(true);
  const [incFotos, setIncFotos] = useState(true);
  const [incAnalise, setIncAnalise] = useState(true);
  const [incNotas, setIncNotas] = useState(false);
  const [exportFormat, setExportFormat] = useState('PDF');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const chatScrollRef = useRef();
  const labelAnim = useRef(new Animated.Value(0)).current;
  const patientMenuAnimations = useRef({});
  const onboardingAnim = useRef(new Animated.Value(0)).current;
  const bottomNavTranslate = useRef(new Animated.Value(0)).current;
  const imagePickerInFlightRef = useRef(false);
  const bottomNavScale = useRef(new Animated.Value(1)).current;
  const bottomNavReadyRef = useRef(false);
  const skeletonPulse = useRef(new Animated.Value(0.55)).current;
  const transitionSkeletonOpacity = useRef(new Animated.Value(0)).current;
  const previousTelaRef = useRef(tela);
  const transitionSkeletonTokenRef = useRef(0);
  const hasSeenFirstResolvedScreenRef = useRef(false);
  const [bottomNavWidth, setBottomNavWidth] = useState(0);
  const [androidBottomInset, setAndroidBottomInset] = useState(() => getAndroidBottomInset());
  const [transitionSkeletonScreen, setTransitionSkeletonScreen] = useState(null);
  const activeBottomTabKey =
    PROFILE_STACK_SCREENS.includes(tela)
      ? 'Perfil'
      : BOTTOM_NAV_TABS.includes(tela)
        ? tela
        : null;
  const activeBottomTabIndex = activeBottomTabKey ? BOTTOM_NAV_TABS.indexOf(activeBottomTabKey) : -1;
  const androidTopInset = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  const agendaFabOffsetStyle = Platform.OS === 'android' ? { bottom: 104 + androidBottomInset } : null;
  const agendaScrollFooterHeight = 96 + (Platform.OS === 'android' ? androidBottomInset : 0);
  const onboardingAndroidContainerStyle = Platform.OS === 'android'
    ? {
        paddingTop: androidTopInset + 14,
        paddingBottom: 24 + androidBottomInset,
      }
    : null;

  useEffect(() => {
    const load = async () => {
      try {
        const [raw, onboardingSeen] = await Promise.all([
          getStoredValue(STORAGE_KEY),
          getStoredValue(ONBOARDING_STORAGE_KEY),
        ]);
        const data = migrateDb(raw ? JSON.parse(raw) : createDefaultDb());
        setDb(data);
        setTempName(data.user.name);
        setTempEmail(data.user.email);
        setTempPhoto(data.user.photo);
        setIsNotificacoesEnabled(data.user.notificationsEnabled);
        if (data.bancoDeConsultas?.length) {
          const today = new Date();
          const hasAppointmentsThisMonth = data.bancoDeConsultas.some(consulta => {
            const parsed = parseAgendaDate(consulta.date);
            return (
              parsed &&
              parsed.getFullYear() === today.getFullYear() &&
              parsed.getMonth() === today.getMonth()
            );
          });

          if (!hasAppointmentsThisMonth) {
            const [firstAppointment] = [...data.bancoDeConsultas].sort((a, b) =>
              `${a.date} ${a.hora}:${a.min}`.localeCompare(`${b.date} ${b.hora}:${b.min}`)
            );
            const firstAppointmentDate = parseAgendaDate(firstAppointment?.date);
            if (firstAppointmentDate) {
              setAgendaMonthDate(getMonthStart(firstAppointmentDate));
              setSelectedAgendaDate(toAgendaDateKey(firstAppointmentDate));
            }
          }
        }
        if (!raw) await setStoredValue(STORAGE_KEY, JSON.stringify(data));
        setShowOnboarding(onboardingSeen !== '1');
      } finally {
        setLoadingDb(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!loadingDb) setStoredValue(STORAGE_KEY, JSON.stringify(db)).catch(() => {});
  }, [db, loadingDb]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      setAndroidBottomInset(0);
      return undefined;
    }

    const syncAndroidBottomInset = () => {
      const nextInset = getAndroidBottomInset();
      setAndroidBottomInset(currentInset => (Math.abs(currentInset - nextInset) > 0.5 ? nextInset : currentInset));
    };

    syncAndroidBottomInset();
    const subscription = Dimensions.addEventListener('change', syncAndroidBottomInset);

    return () => subscription?.remove?.();
  }, []);

  useEffect(() => {
    setDb(prev => ({ ...prev, user: { ...prev.user, notificationsEnabled: isNotificacoesEnabled } }));
  }, [isNotificacoesEnabled]);

  useEffect(() => {
    if (!showOnboarding) return;
    onboardingAnim.setValue(0);
    Animated.timing(onboardingAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  }, [showOnboarding, onboardingStep, onboardingAnim]);

  useEffect(() => {
    if (activeBottomTabIndex < 0 || bottomNavWidth <= 0) return;

    const availableWidth = Math.max(bottomNavWidth - BOTTOM_NAV_HORIZONTAL_PADDING * 2, 0);
    const tabWidth = availableWidth / BOTTOM_NAV_TABS.length;
    const maxTranslateX = Math.max(bottomNavWidth - BOTTOM_NAV_INDICATOR_WIDTH, 0);
    const rawTranslateX =
      BOTTOM_NAV_HORIZONTAL_PADDING +
      tabWidth * activeBottomTabIndex +
      Math.max((tabWidth - BOTTOM_NAV_INDICATOR_WIDTH) / 2, 0) -
      BOTTOM_NAV_INDICATOR_LEFT_BIAS;
    const targetTranslateX = Math.min(Math.max(rawTranslateX, 0), maxTranslateX);

    if (!bottomNavReadyRef.current) {
      bottomNavTranslate.setValue(targetTranslateX);
      bottomNavReadyRef.current = true;
      return;
    }

    const runBottomNavAnimation = () => {
      Animated.parallel([
        Animated.timing(bottomNavTranslate, {
          toValue: targetTranslateX,
          duration: 380,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.sequence([
          Animated.timing(bottomNavScale, {
            toValue: 1.015,
            duration: 120,
            easing: Easing.out(Easing.quad),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(bottomNavScale, {
            toValue: 1,
            duration: 240,
            easing: Easing.out(Easing.quad),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
      ]).start();
    };

    bottomNavTranslate.stopAnimation(currentTranslate => {
      bottomNavTranslate.setValue(currentTranslate);
      bottomNavScale.stopAnimation(currentScale => {
        bottomNavScale.setValue(currentScale);
        runBottomNavAnimation();
      });
    });
  }, [activeBottomTabIndex, bottomNavScale, bottomNavTranslate, bottomNavWidth]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonPulse, {
          toValue: 1,
          duration: 920,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(skeletonPulse, {
          toValue: 0.55,
          duration: 920,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );

    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [skeletonPulse]);

  useEffect(() => {
    if (loadingDb) return undefined;

    if (!hasSeenFirstResolvedScreenRef.current) {
      hasSeenFirstResolvedScreenRef.current = true;
      previousTelaRef.current = tela;
      return undefined;
    }

    const nextSkeletonConfig = SCREEN_SKELETON_CONFIGS[tela];
    const previousScreen = previousTelaRef.current;
    previousTelaRef.current = tela;

    if (!nextSkeletonConfig || previousScreen === tela) return undefined;

    const token = transitionSkeletonTokenRef.current + 1;
    transitionSkeletonTokenRef.current = token;

    transitionSkeletonOpacity.stopAnimation();
    transitionSkeletonOpacity.setValue(1);
    setTransitionSkeletonScreen(tela);

    const hideTimer = setTimeout(() => {
      Animated.timing(transitionSkeletonOpacity, {
        toValue: 0,
        duration: SCREEN_SKELETON_FADE_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start(({ finished }) => {
        if (finished && transitionSkeletonTokenRef.current === token) {
          setTransitionSkeletonScreen(null);
        }
      });
    }, SCREEN_SKELETON_MIN_VISIBLE_MS);

    return () => clearTimeout(hideTimer);
  }, [loadingDb, tela, transitionSkeletonOpacity]);

  const userName = db.user.name;
  const userEmail = db.user.email;
  const userPhoto = db.user.photo;
  const showProfilePhotoEnabled = db.user.showProfilePhotoEnabled !== false;
  const showUserPhotoPreview = showProfilePhotoEnabled && !!userPhoto;
  const hideEmailPreviewEnabled = db.user.hideEmailPreviewEnabled === true;
  const previewUserEmail = hideEmailPreviewEnabled ? maskEmail(userEmail) : userEmail;
  const emailNotificationsEnabled = db.user.emailNotificationsEnabled ?? true;
  const agendaRemindersEnabled = db.user.agendaRemindersEnabled ?? true;
  const pacientes = db.pacientes;
  const bancoDeConsultas = db.bancoDeConsultas;
  const totalAvaliacoes = pacientes.reduce((sum, p) => sum + (p.avaliacoes?.length || 0), 0);
  const pacientesAtivos = pacientes.filter(p => !p.archived);
  const pacientesArquivados = pacientes.filter(p => p.archived);
  const mesAtivo = getAgendaMonthLabel(agendaMonthDate);
  const diasAgenda = useMemo(() => {
    const totalDias = getDaysInMonth(agendaMonthDate);
    return Array.from({ length: totalDias }, (_, index) => {
      const date = new Date(agendaMonthDate.getFullYear(), agendaMonthDate.getMonth(), index + 1);
      const dateKey = toAgendaDateKey(date);

      return {
        id: dateKey,
        date,
        dateKey,
        semana: WEEKDAY_SHORT_PT[date.getDay()],
        dia: pad2(index + 1),
        nomeCompleto: getAgendaFullDateLabel(date),
      };
    });
  }, [agendaMonthDate]);
  const infoDiaAtivo = diasAgenda.find(d => d.dateKey === selectedAgendaDate) || null;
  const consultasDoDia = useMemo(
    () =>
      bancoDeConsultas
        .filter(c => c.date === selectedAgendaDate)
        .sort((a, b) => `${a.hora}:${a.min}`.localeCompare(`${b.hora}:${b.min}`)),
    [bancoDeConsultas, selectedAgendaDate]
  );
  const totalConsultasMes = useMemo(
    () =>
      bancoDeConsultas.filter(c => {
        const parsed = parseAgendaDate(c.date);
        return (
          parsed &&
          parsed.getFullYear() === agendaMonthDate.getFullYear() &&
          parsed.getMonth() === agendaMonthDate.getMonth()
        );
      }).length,
    [agendaMonthDate, bancoDeConsultas]
  );
  const pacientesFiltrados = pacientesAtivos.filter(p => p.nome.toLowerCase().includes(searchQuery.toLowerCase()));
  const pacientesArquivadosFiltrados = pacientesArquivados.filter(p => p.nome.toLowerCase().includes(searchQuery.toLowerCase()));
  const patientsWithReports = pacientes.filter(p => (p.avaliacoes || []).length > 0);
  const pacientesRelatorioFilter = pacientesAtivos.filter(p => p.nome.toLowerCase().includes(relatorioPaciente.toLowerCase()));
  const patientsWithCompare = pacientes.filter(p => (p.avaliacoes || []).length >= 2);
  const pacientesCompareFilter = patientsWithCompare.filter(p => p.nome.toLowerCase().includes(compareSearchQuery.toLowerCase()));
  const reportPatient = pacientes.find(p => p.id === reportPatientId) || null;
  const comparePatient = pacientes.find(p => p.id === comparePatientId) || null;
  const compareEvals = comparePatient?.avaliacoes || [];
  const compareEvalA = compareEvals.find(e => e.id === compareEvalAId) || null;
  const compareEvalB = compareEvals.find(e => e.id === compareEvalBId) || null;
  const chatQuickTopics = [
    { id: '1', label: 'Pacientes', prompt: 'Quantos pacientes ativos eu tenho?' },
    { id: '2', label: 'Agenda hoje', prompt: 'Quais atendimentos eu tenho hoje?' },
    { id: '3', label: 'Avaliações', prompt: 'Quantas avaliações estão salvas?' },
    { id: '4', label: 'Arquivados', prompt: 'Quantos pacientes estão arquivados?' },
    { id: '5', label: 'Próximo retorno', prompt: 'Qual é meu próximo atendimento?' },
  ];
  const chatStopWords = useMemo(
    () =>
      new Set([
        'a',
        'ao',
        'aos',
        'as',
        'com',
        'como',
        'da',
        'das',
        'de',
        'do',
        'dos',
        'e',
        'em',
        'ha',
        'hoje',
        'local',
        'me',
        'mostrar',
        'mostre',
        'na',
        'nas',
        'no',
        'nos',
        'o',
        'os',
        'ou',
        'paciente',
        'pacientes',
        'para',
        'pesquise',
        'pesquisar',
        'pesquisa',
        'procure',
        'procurar',
        'qual',
        'quais',
        'quantas',
        'quantos',
        'que',
        'resumo',
        'salvo',
        'salvos',
        'sem',
        'sobre',
        'tem',
        'tenho',
        'um',
        'uma',
      ]),
    []
  );
  const onboardingSlides = useMemo(
    () => [
      {
        id: 'welcome',
        icon: 'heart-circle-outline',
        title: 'Bem-vindo ao Heal+',
        description:
          'Sua central clínica para acompanhar feridas com mais organização, clareza e segurança.',
        points: ['Visão rápida dos casos ativos', 'Fluxo pensado para o dia a dia da assistência'],
      },
      {
        id: 'patients',
        icon: 'people-outline',
        title: 'Pacientes em ordem',
        description:
          'Cadastre e mantenha dados do paciente em um só lugar para reduzir retrabalho e ganhar agilidade.',
        points: ['Dados pessoais centralizados', 'Histórico de avaliações sempre acessível'],
      },
      {
        id: 'evolution',
        icon: 'camera-outline',
        title: 'Evolução com imagem e dados',
        description:
          'Registre dimensões, sinais clínicos e fotos para monitorar a evolução de forma objetiva.',
        points: ['Escala de dor e sinais de infecção', 'Comparativos e relatórios em poucos toques'],
      },
      {
        id: 'start',
        icon: 'flash-outline',
        title: 'Pronto para começar',
        description:
          'Use o Heal+ para conduzir o cuidado com praticidade, consistência e mais confiança na tomada de decisão.',
        points: ['Experiência fluida e profissional', 'Tudo salvo localmente no dispositivo'],
      },
    ],
    []
  );
  const isLastOnboardingStep = onboardingStep === onboardingSlides.length - 1;
  const onboardingCurrentSlide = onboardingSlides[onboardingStep];

  const concluirOnboarding = useCallback(async () => {
    try {
      await setStoredValue(ONBOARDING_STORAGE_KEY, '1');
    } catch {
      // Ignora erro de persistência para não bloquear o acesso ao app.
    }
    setShowOnboarding(false);
    setOnboardingStep(0);
  }, []);

  const pularOnboarding = useCallback(() => {
    concluirOnboarding();
  }, [concluirOnboarding]);

  const avancarOnboarding = useCallback(() => {
    if (isLastOnboardingStep) {
      concluirOnboarding();
      return;
    }
    setOnboardingStep(prev => Math.min(prev + 1, onboardingSlides.length - 1));
  }, [concluirOnboarding, isLastOnboardingStep, onboardingSlides.length]);

  const irParaSlideOnboarding = useCallback(index => {
    setOnboardingStep(index);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(labelAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };
  const handleBlur = () => {
    setIsFocused(false);
    if (!password) Animated.timing(labelAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const labelStyle = {
    position: 'absolute',
    left: 16,
    top: labelAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 4] }),
    fontSize: labelAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 12] }),
    color: isError ? '#EF4444' : colors.textSecondary,
    zIndex: 1,
  };

  const prepararTroca = () => {
    setTempEmail(userEmail);
    setTempName(userName);
    setTempPhoto(userPhoto);
    setPassword('');
    setIsLoginButtonDimmed(false);
    setIsError(false);
    Animated.timing(labelAnim, { toValue: 0, duration: 0, useNativeDriver: false }).start();
    setTela('TrocarConta');
  };

  const handleLogin = () => {
    if (password === 'password') {
      setActivity(true);
      setIsError(false);
      setTimeout(() => {
        setActivity(false);
        setTela('Home');
      }, 1000);
    } else {
      setIsError(true);
      setModalErroVisible(true);
    }
  };

  const handleForgotPasswordContinue = () => {
    Alert.alert(
      'Recuperação de senha',
      'No Heal+, o próximo passo seguiria por um fluxo seguro para redefinir sua senha dentro do aplicativo.',
      [{ text: 'Voltar ao login', onPress: () => setTela('Login') }]
    );
  };

  const confirmarTroca = () => {
    if (tempEmail.trim() && tempName.trim()) {
      setDb(prev => ({ ...prev, user: { ...prev.user, name: tempName, email: tempEmail } }));
      setPassword('');
      setIsLoginButtonDimmed(false);
      setTela('Login');
      Animated.timing(labelAnim, { toValue: 0, duration: 0, useNativeDriver: false }).start();
    }
  };

  const salvarEdicaoPerfil = () => {
    if (tempEmail.trim() && tempName.trim()) {
      setDb(prev => ({ ...prev, user: { ...prev.user, name: tempName, email: tempEmail, photo: tempPhoto } }));
      setTela('Perfil');
    }
  };

  const abrirPerfil = () => {
    setTempName(userName);
    setTempEmail(userEmail);
    setTempPhoto(userPhoto);
    setTela('Perfil');
  };

  const abrirEdicaoPerfil = () => {
    setTempName(userName);
    setTempEmail(userEmail);
    setTempPhoto(userPhoto);
    setTela('EditarPerfil');
  };

  const sairDaConta = () => {
    setTela('Login');
    setPassword('');
    setIsLoginButtonDimmed(false);
  };

  const updateUserPreference = (key, value) => {
    setDb(prev => ({
      ...prev,
      user: {
        ...prev.user,
        [key]: typeof value === 'function' ? value(prev.user?.[key]) : value,
      },
    }));
  };

  const abrirImagePickerPerfil = () => {
    if (imagePickerInFlightRef.current) return;
    setShowProfileImagePickerModal(true);
  };

  const fecharImagePickerPerfil = () => setShowProfileImagePickerModal(false);
  const fecharTodosImagePickers = () => {
    setShowProfileImagePickerModal(false);
    setShowImagePickerModal(false);
  };

  const executarFluxoImagem = async config => {
    if (imagePickerInFlightRef.current) return;

    imagePickerInFlightRef.current = true;
    setIsImagePickerBusy(true);
    fecharTodosImagePickers();

    try {
      await wait(IMAGE_PICKER_MODAL_CLOSE_DELAY_MS);
      await imageServiceExecuteImageFlow(config);
    } finally {
      imagePickerInFlightRef.current = false;
      setIsImagePickerBusy(false);
    }
  };

  const tirarFotoPerfil = async () =>
    executarFluxoImagem({
      requestPermission: () => ImagePicker.requestCameraPermissionsAsync(),
      permissionDeniedMessage: 'Precisamos de acesso à câmera para atualizar a foto do perfil.',
      blockedPermissionName: 'à câmera',
      launchPicker: () => ImagePicker.launchCameraAsync(imageServiceBuildCameraPickerOptions([1, 1])),
      errorActionLabel: 'abrir a câmera',
      onPick: setTempPhoto,
    });

  const escolherFotoPerfilGaleria = async () =>
    executarFluxoImagem({
      requestPermission: () => ImagePicker.requestMediaLibraryPermissionsAsync(),
      permissionDeniedMessage: 'Precisamos de acesso à galeria para atualizar a foto do perfil.',
      blockedPermissionName: 'às fotos',
      launchPicker: () => ImagePicker.launchImageLibraryAsync(imageServiceBuildLibraryPickerOptions([1, 1])),
      errorActionLabel: 'abrir a galeria',
      onPick: setTempPhoto,
    });

  const removerFotoPerfil = () => {
    if (imagePickerInFlightRef.current) return;
    fecharImagePickerPerfil();
    setTempPhoto(null);
  };

  const toggleSection = item => setExpandedSection(expandedSection === item ? null : item);
  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const toggleBool = key => setForm(prev => ({ ...prev, [key]: !prev[key] }));

  const handleTissuePercentageChange = (field, value) => {
    if (value === '') {
      setForm(prev => ({ ...prev, [field]: '' }));
      return;
    }
    
    let numVal = parseInt(value, 10);
    if (isNaN(numVal)) return;
    
    numVal = Math.max(0, Math.min(100, numVal));

    const fields = [
      'percentual_granulacao_leito',
      'percentual_epitelizacao_leito',
      'percentual_esfacelo_leito',
      'percentual_necrose_seca_leito'
    ];
    
    if (numVal === 100) {
      setForm(prev => {
        let nextForm = { ...prev };
        fields.forEach(f => {
          nextForm[f] = f === field ? String(numVal) : '';
        });
        return nextForm;
      });
      return;
    }

    setForm(prev => {
      let nextForm = { ...prev, [field]: String(numVal) };
      let otherKeys = fields.filter(f => f !== field);
      let sumOthers = otherKeys.reduce((sum, f) => sum + (parseInt(nextForm[f], 10) || 0), 0);
      
      if (numVal + sumOthers > 100) {
         let diff = (numVal + sumOthers) - 100;
         for (let i = 0; i < otherKeys.length; i++) {
            let key = otherKeys[i];
            let val = parseInt(nextForm[key], 10) || 0;
            if (val > 0) {
               if (val >= diff) {
                  nextForm[key] = val - diff > 0 ? String(val - diff) : '';
                  break;
               } else {
                  diff -= val;
                  nextForm[key] = '';
               }
            }
         }
      }
      return nextForm;
    });
  };

  // --- FUNÇÕES DO IMAGE PICKER (FERIDA) ---
  const abrirImagePicker = () => {
    if (imagePickerInFlightRef.current) return;
    setShowImagePickerModal(true);
  };

  const tirarFotoFerida = async () =>
    executarFluxoImagem({
      requestPermission: () => ImagePicker.requestCameraPermissionsAsync(),
      permissionDeniedMessage: 'Precisamos de acesso à câmera para tirar fotos da ferida.',
      blockedPermissionName: 'à câmera',
      launchPicker: () => ImagePicker.launchCameraAsync(imageServiceBuildCameraPickerOptions([4, 3])),
      errorActionLabel: 'abrir a câmera',
      onPick: uri => updateField('woundImageUri', uri),
    });

  const escolherFotoGaleria = async () =>
    executarFluxoImagem({
      requestPermission: () => ImagePicker.requestMediaLibraryPermissionsAsync(),
      permissionDeniedMessage: 'Precisamos de acesso à galeria para selecionar fotos.',
      blockedPermissionName: 'às fotos',
      launchPicker: () => ImagePicker.launchImageLibraryAsync(imageServiceBuildLibraryPickerOptions([4, 3])),
      errorActionLabel: 'abrir a galeria',
      onPick: uri => updateField('woundImageUri', uri),
    });

  const updateAgendaField = (key, value) => setAgendaForm(prev => ({ ...prev, [key]: value }));

  const fecharModalAgenda = () => {
    setModalAgendaVisible(false);
    setIsEditingAgendaAppointment(false);
    setEditingAgendaAppointmentId(null);
    setOpenDropdown(null);
  };

  const abrirModalAgenda = (date = selectedAgendaDate) => {
    setAgendaForm(emptyAgendaForm(date));
    setIsEditingAgendaAppointment(false);
    setEditingAgendaAppointmentId(null);
    setOpenDropdown(null);
    setModalAgendaVisible(true);
  };

  const abrirEditarAgenda = consulta => {
    setAgendaForm({
      patientId: consulta.patientId || '',
      paciente: consulta.paciente || '',
      tipo: consulta.tipo || 'Retorno',
      status: consulta.status || 'Pendente',
      date: consulta.date || selectedAgendaDate,
      hora: consulta.hora || '08',
      min: consulta.min || '00',
      observacoes: consulta.observacoes || '',
    });
    setIsEditingAgendaAppointment(true);
    setEditingAgendaAppointmentId(consulta.id);
    setOpenDropdown(null);
    setModalAgendaVisible(true);
  };

  const selecionarPacienteAgenda = paciente => {
    setAgendaForm(prev => ({
      ...prev,
      patientId: paciente.id,
      paciente: paciente.nome,
    }));
  };

  const navegarMesAgenda = direction => {
    setAgendaMonthDate(prev => {
      const nextMonth = new Date(prev.getFullYear(), prev.getMonth() + direction, 1);
      const currentSelected = parseAgendaDate(selectedAgendaDate) || new Date();
      const nextDay = Math.min(currentSelected.getDate(), getDaysInMonth(nextMonth));
      const nextSelectedDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), nextDay);
      setSelectedAgendaDate(toAgendaDateKey(nextSelectedDate));
      return nextMonth;
    });
  };

  const saveAgendaAppointment = () => {
    const normalizedDate = parseAgendaDate(agendaForm.date);
    const patientName = agendaForm.paciente.trim();
    const hour = parseInt(agendaForm.hora, 10);
    const minute = parseInt(agendaForm.min, 10);

    if (!patientName) {
      Alert.alert('Campo obrigatório', 'Informe o nome do paciente para agendar o atendimento.');
      return;
    }

    if (!normalizedDate) {
      Alert.alert('Data inválida', 'Informe a data do atendimento no formato aaaa-mm-dd.');
      return;
    }

    if (Number.isNaN(hour) || hour < 0 || hour > 23) {
      Alert.alert('Hora inválida', 'Informe uma hora válida entre 00 e 23.');
      return;
    }

    if (Number.isNaN(minute) || minute < 0 || minute > 59) {
      Alert.alert('Minutos inválidos', 'Informe os minutos entre 00 e 59.');
      return;
    }

    const normalizedDateKey = toAgendaDateKey(normalizedDate);
    const appearance = getConsultaAppearance(agendaForm.tipo);
    const atendimentoPayload = normalizeConsulta({
      id: editingAgendaAppointmentId || createId(),
      patientId: agendaForm.patientId,
      date: normalizedDateKey,
      hora: pad2(hour),
      min: pad2(minute),
      paciente: patientName,
      tipo: agendaForm.tipo,
      status: agendaForm.status,
      corLinha: appearance.color,
      icon: appearance.icon,
      observacoes: agendaForm.observacoes,
    });

    setDb(prev => ({
      ...prev,
      bancoDeConsultas: (
        isEditingAgendaAppointment
          ? prev.bancoDeConsultas.map(item =>
              item.id === editingAgendaAppointmentId ? atendimentoPayload : item
            )
          : [...prev.bancoDeConsultas, atendimentoPayload]
      ).sort((a, b) => `${a.date} ${a.hora}:${a.min}`.localeCompare(`${b.date} ${b.hora}:${b.min}`)),
    }));
    setAgendaMonthDate(getMonthStart(normalizedDate));
    setSelectedAgendaDate(normalizedDateKey);
    fecharModalAgenda();
    Alert.alert(
      isEditingAgendaAppointment ? 'Atendimento atualizado' : 'Atendimento agendado',
      isEditingAgendaAppointment
        ? 'As alterações do atendimento foram salvas na agenda do profissional.'
        : 'O novo atendimento foi salvo na agenda do profissional.'
    );
  };

  const excluirAgendaAppointment = consultaId => {
    setDb(prev => ({
      ...prev,
      bancoDeConsultas: prev.bancoDeConsultas.filter(item => item.id !== consultaId),
    }));
    if (editingAgendaAppointmentId === consultaId) {
      fecharModalAgenda();
    }
  };

  const confirmarExcluirAgenda = consulta => {
    Alert.alert(
      'Excluir atendimento',
      `Deseja remover o atendimento de ${consulta.paciente}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            excluirAgendaAppointment(consulta.id);
            Alert.alert('Atendimento removido', 'O atendimento foi excluído da agenda.');
          },
        },
      ]
    );
  };

  const abrirModalNovoPaciente = () => {
    setIsEditingPatient(false);
    setEditingPatientId(null);
    setNovoPacNome('');
    setNovoPacTelefone('');
    setNovoPacEmail('');
    setNovoPacDataNasc('');
    setModalPacienteVisible(true);
  };

  const resetEvaluationEditingState = () => {
    setIsEditingEvaluation(false);
    setEditingEvaluationId(null);
  };

  const getPatientMenuAnimation = useCallback(patientId => {
    if (!patientMenuAnimations.current[patientId]) {
      patientMenuAnimations.current[patientId] = new Animated.Value(0);
    }
    return patientMenuAnimations.current[patientId];
  }, []);

  const animatePatientMenu = useCallback((patientId, toValue, onEnd) => {
    if (!patientId) return;
    const animValue = getPatientMenuAnimation(patientId);
    Animated.timing(animValue, {
      toValue,
      duration: 220,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(() => {
      if (onEnd) onEnd();
    });
  }, [getPatientMenuAnimation]);

  const closePatientMenu = useCallback((patientId = openPatientMenuId) => {
    if (!patientId) return;
    animatePatientMenu(patientId, 0, () => {
      setOpenPatientMenuId(currentId => (currentId === patientId ? null : currentId));
    });
  }, [animatePatientMenu, openPatientMenuId]);

  const togglePatientMenu = useCallback(patientId => {
    if (openPatientMenuId === patientId) {
      closePatientMenu(patientId);
      return;
    }
    if (openPatientMenuId) {
      animatePatientMenu(openPatientMenuId, 0);
    }
    setOpenPatientMenuId(patientId);
    animatePatientMenu(patientId, 1);
  }, [animatePatientMenu, closePatientMenu, openPatientMenuId]);

  const abrirTelaNovaAvaliacao = () => {
    resetEvaluationEditingState();
    setForm(emptyAnamnesis());
    setExpandedSection('item-0');
    setTela('Avaliacao');
  };

  const abrirModalEditarPaciente = paciente => {
    setIsEditingPatient(true);
    setEditingPatientId(paciente.id);
    setNovoPacNome(paciente.nome || '');
    setNovoPacTelefone(paciente.telefone || '');
    setNovoPacEmail(paciente.email || '');
    setNovoPacDataNasc(paciente.dataNasc || '');
    setModalPacienteVisible(true);
    closePatientMenu(paciente.id);
  };

  const salvarPaciente = () => {
    if (!novoPacNome.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o nome do paciente.');
      return;
    }
    if (isEditingPatient && editingPatientId) {
      setDb(prev => ({
        ...prev,
        pacientes: prev.pacientes.map(p =>
          p.id === editingPatientId
            ? { ...p, nome: novoPacNome, telefone: novoPacTelefone, email: novoPacEmail, dataNasc: novoPacDataNasc }
            : p
        ),
      }));
    } else {
      const novo = {
        id: createId(), nome: novoPacNome, telefone: novoPacTelefone, email: novoPacEmail, dataNasc: novoPacDataNasc,
        archived: false, archivedAt: null, avaliacoes: [],
      };
      setDb(prev => ({ ...prev, pacientes: [novo, ...prev.pacientes] }));
    }
    setModalPacienteVisible(false);
    setIsEditingPatient(false);
    setEditingPatientId(null);
    setNovoPacNome(''); setNovoPacTelefone(''); setNovoPacEmail(''); setNovoPacDataNasc('');
  };

  const arquivarPaciente = paciente => {
    Alert.alert(
      'Arquivar paciente',
      `Deseja arquivar ${paciente.nome}? O registro será mantido no banco local e ficará fora da lista ativa.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Arquivar',
          onPress: () => {
            setDb(prev => ({
              ...prev,
              pacientes: prev.pacientes.map(p =>
                p.id === paciente.id ? { ...p, archived: true, archivedAt: new Date().toISOString() } : p
              ),
            }));
            closePatientMenu(paciente.id);
          },
        },
      ]
    );
  };

  const selecionarPacienteExistente = paciente => {
    setForm(prev => ({
      ...prev,
      patientId: paciente.id,
      nome_cliente: paciente.nome,
      telefone: paciente.telefone,
      email: paciente.email,
      data_nascimento: paciente.dataNasc || '',
    }));
  };

  const abrirNovaAvaliacaoPaciente = paciente => {
    resetEvaluationEditingState();
    setForm({
      ...emptyAnamnesis(),
      patientId: paciente.id,
      nome_cliente: paciente.nome || '',
      telefone: paciente.telefone || '',
      email: paciente.email || '',
      data_nascimento: paciente.dataNasc || '',
    });
    closePatientMenu(paciente.id);
    setExpandedSection('item-0');
    setTela('Avaliacao');
  };

  const abrirEditarAvaliacaoPaciente = (paciente, avaliacao) => {
    const avaliacaoForm = avaliacao?.form || {};
    setForm({
      ...emptyAnamnesis(),
      ...avaliacaoForm,
      patientId: paciente.id,
      nome_cliente: avaliacaoForm.nome_cliente || paciente.nome || '',
      telefone: avaliacaoForm.telefone || paciente.telefone || '',
      email: avaliacaoForm.email || paciente.email || '',
      data_nascimento: avaliacaoForm.data_nascimento || paciente.dataNasc || '',
      localizacao_ferida: avaliacaoForm.localizacao_ferida || avaliacao?.regiao || '',
      data_consulta: avaliacaoForm.data_consulta || avaliacao?.data || '',
    });
    setIsEditingEvaluation(true);
    setEditingEvaluationId(avaliacao.id);
    closePatientMenu(paciente.id);
    setExpandedSection('item-0');
    setTela('Avaliacao');
  };

  const saveAvaliacao = () => {
    if (!form.nome_cliente || !form.localizacao_ferida) {
      Alert.alert('Campos obrigatórios', 'Preencha nome do paciente e localização da ferida.');
      return;
    }
    const totalPercentage = ['percentual_granulacao_leito','percentual_epitelizacao_leito','percentual_esfacelo_leito','percentual_necrose_seca_leito']
      .reduce((sum, key) => sum + (parseInt(form[key] || '0', 10) || 0), 0);
    if (totalPercentage > 100) {
      Alert.alert('Percentual inválido', `A soma dos percentuais do leito não pode exceder 100%. Total atual: ${totalPercentage}%.`);
      return;
    }
    if (isEditingEvaluation && (!editingEvaluationId || !form.patientId)) {
      Alert.alert('Edição inválida', 'Não foi possível identificar a avaliação a ser editada.');
      return;
    }

    const nowIso = new Date().toISOString();
    const registroBase = {
      id: editingEvaluationId || createId(),
      regiao: form.localizacao_ferida,
      data: form.data_consulta || '31/03/2026',
      tipo: form.etiologia_ferida === 'Outra' ? form.etiologia_outra || 'Outra' : form.etiologia_ferida,
      form: { ...form },
      createdAt: nowIso,
    };

    if (isEditingEvaluation) {
      const pacienteAtual = pacientes.find(p => p.id === form.patientId);
      const avaliacaoAtual = pacienteAtual?.avaliacoes?.find(av => av.id === editingEvaluationId);
      if (!avaliacaoAtual) {
        Alert.alert('Avaliação não encontrada', 'A avaliação selecionada não foi encontrada para edição.');
        return;
      }

      const registroAtualizado = {
        ...avaliacaoAtual,
        ...registroBase,
        id: editingEvaluationId,
        createdAt: avaliacaoAtual.createdAt || nowIso,
        updatedAt: nowIso,
      };

      setDb(prev => ({
        ...prev,
        pacientes: prev.pacientes.map(p =>
          p.id === form.patientId
            ? {
                ...p,
                nome: form.nome_cliente,
                telefone: form.telefone,
                email: form.email,
                dataNasc: form.data_nascimento,
                avaliacoes: (p.avaliacoes || []).map(av =>
                  av.id === editingEvaluationId ? registroAtualizado : av
                ),
              }
            : p
        ),
      }));
      Alert.alert('Avaliação atualizada', 'As alterações da avaliação foram salvas com sucesso.');
    } else if (form.patientId) {
      const registro = {
        ...registroBase,
        id: createId(),
        createdAt: nowIso,
      };
      setDb(prev => ({
        ...prev,
        pacientes: prev.pacientes.map(p =>
          p.id === form.patientId
            ? { ...p, nome: form.nome_cliente, telefone: form.telefone, email: form.email, dataNasc: form.data_nascimento, avaliacoes: [registro, ...(p.avaliacoes || [])] }
            : p
        ),
      }));
      Alert.alert('Avaliação salva', 'A avaliação foi salva localmente com persistência no aparelho.');
    } else {
      const registro = {
        ...registroBase,
        id: createId(),
        createdAt: nowIso,
      };
      const novoPaciente = { id: createId(), nome: form.nome_cliente, telefone: form.telefone, email: form.email, dataNasc: form.data_nascimento, archived: false, archivedAt: null, avaliacoes: [registro] };
      setDb(prev => ({ ...prev, pacientes: [novoPaciente, ...prev.pacientes] }));
      Alert.alert('Avaliação salva', 'A avaliação foi salva localmente com persistência no aparelho.');
    }

    resetEvaluationEditingState();
    setForm(emptyAnamnesis());
    setExpandedSection('item-0');
    setTela('Pacientes');
  };

  const getStatusStyles = status => {
    if (status === 'Confirmado') return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
    if (status === 'Cancelado') return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' };
    return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' };
  };

  const voltarParaHome = () => {
    setMessages([]);
    setChatMessage('');
    setTela('Home');
  };

  const handleSendChat = suggestionText => {
    const textToSend = typeof suggestionText === 'string' ? suggestionText : chatMessage;
    if (!textToSend.trim()) return;
    const userMsg = { id: Date.now().toString(), text: textToSend, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 80);
    setChatMessage('');
    setIsAiTyping(true);
    setTimeout(() => {
      const aiMsg = {
        id: `${Date.now()}a`,
        text: buildLocalAssistantReply(textToSend),
        sender: 'ai',
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsAiTyping(false);
      setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 700);
  };

  const abrirGerarRelatorio = pacienteId => {
    setReportPatientId(pacienteId || null);
    setReportSelectedEvalId(null);
    setTela('Relatorios');
  };

  const abrirCompararRelatorios = pacienteId => {
    setComparePatientId(pacienteId || null);
    const p = pacientes.find(x => x.id === pacienteId);
    if (p && p.avaliacoes?.length >= 2) {
      setCompareEvalAId(p.avaliacoes[0]?.id || null);
      setCompareEvalBId(p.avaliacoes[1]?.id || null);
    } else {
      setCompareEvalAId(null);
      setCompareEvalBId(null);
    }
    setTela('CompararRelatorios');
  };

  const selectedPacienteRelatorio = pacientesAtivos.find(p => p.nome === relatorioPaciente) || pacientes.find(p => p.nome === relatorioPaciente);
  const relatorioPatientEvals = selectedPacienteRelatorio?.avaliacoes || [];
  const activeReportEval = relatorioPatientEvals.find(ev => ev.id === relatorioSelectedEvalId);

  const handleGerarRelatorio = async () => {
    if (!relatorioPaciente || !selectedPacienteRelatorio) {
      Alert.alert('Aviso', 'Selecione um paciente para gerar o relatório.');
      return;
    }
    if (!activeReportEval) {
      Alert.alert(
        'Aviso',
        'Selecione uma avaliação clínica para exportar no relatório.'
      );
      return;
    }

    const reportInfo = buildReportFromService(
      selectedPacienteRelatorio,
      activeReportEval
    );

    if (!reportInfo) {
      Alert.alert(
        'Aviso',
        'Não foi possível estruturar os dados do relatório com esta avaliação.'
      );
      return;
    }

    try {
      const html = reportBuildClinicalReportHtml({
        reportInfo,
        includeTimers: incTimers,
        includeNotes: incNotas,
      });

      if (
        exportFormat === 'PDF' ||
        exportFormat === 'Link' ||
        exportFormat === 'Email'
      ) {
        await exportHtmlToPdfReport(html);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o PDF: ' + error.message);
    }
  };

  const handleExportarComparativo = async () => {
    if (!comparePatient) {
      Alert.alert('Aviso', 'Selecione um paciente para exportar a comparação.');
      return;
    }
    if (!compareEvalA || !compareEvalB) {
      Alert.alert(
        'Aviso',
        'Selecione duas avaliações para comparar antes de exportar.'
      );
      return;
    }

    try {
      const html = reportBuildComparisonReportHtml({
        comparePatient,
        compareEvalA,
        compareEvalB,
      });

      await exportHtmlToPdfReport(html);
    } catch (error) {
      Alert.alert(
        'Erro',
        'Não foi possível gerar o PDF comparativo: ' + error.message
      );
    }
  };

  const reportPatientEvals = reportPatient?.avaliacoes || [];
  const selectedReportEval = reportPatientEvals.length
    ? (reportSelectedEvalId ? reportPatientEvals.find(ev => ev.id === reportSelectedEvalId) || reportPatientEvals[0] : reportPatientEvals[0])
    : null;
  const patientEvalLabel = ev => {
    const ff = ev?.form || {};
    const reg = ff.localizacao_ferida || ev?.regiao || 'Sem região';
    return `${ev?.data || '-'} • ${reg}`;
  };
  const getChatAppointmentLabel = consulta => {
    const parsedDate = getAgendaDateTime(consulta);
    const dateLabel = parsedDate ? formatAgendaDateForChat(parsedDate) : consulta.date || 'sem data';
    return `${dateLabel} às ${consulta.hora}:${consulta.min} • ${consulta.paciente}${consulta.tipo ? ` • ${consulta.tipo}` : ''}`;
  };
  const getPatientMatchesFromQuery = query => {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return [];

    const patientPool = pacientes.map(patient => ({
      patient,
      normalizedName: normalizeText(patient.nome),
    }));

    const fullMatches = patientPool.filter(item => normalizedQuery.includes(item.normalizedName));
    if (fullMatches.length) {
      return fullMatches.map(item => item.patient);
    }

    const queryTokens = Array.from(
      new Set(
        normalizedQuery
          .split(/[^a-z0-9]+/)
          .filter(token => token.length >= 3 && !chatStopWords.has(token))
      )
    );

    if (!queryTokens.length) return [];

    const scoredMatches = patientPool
      .map(item => {
        const patientTokens = item.normalizedName.split(' ');
        const score = queryTokens.reduce(
          (sum, token) =>
            sum +
            (patientTokens.some(
              patientToken =>
                patientToken.startsWith(token) ||
                patientToken.includes(token) ||
                token.startsWith(patientToken)
            )
              ? 1
              : 0),
          0
        );
        return { patient: item.patient, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || a.patient.nome.localeCompare(b.patient.nome));

    if (!scoredMatches.length) return [];

    const bestScore = scoredMatches[0].score;
    return scoredMatches.filter(item => item.score === bestScore).map(item => item.patient);
  };
  const buildLocalAssistantReply = query => {
    const normalizedQuery = normalizeText(query);
    const now = new Date();
    const todayKey = toAgendaDateKey(now);
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const tomorrowKey = toAgendaDateKey(tomorrow);
    const allAppointments = sortConsultasByDateTime(bancoDeConsultas);
    const upcomingAppointments = allAppointments.filter(consulta => {
      const consultaDate = getAgendaDateTime(consulta);
      return consultaDate && consultaDate.getTime() >= now.getTime();
    });
    const patientMatches = getPatientMatchesFromQuery(query);
    const activePatientNames = pacientesAtivos.map(patient => patient.nome);

    const wantsPatientList =
      normalizedQuery.includes('listar paciente') ||
      normalizedQuery.includes('lista de paciente') ||
      normalizedQuery.includes('nomes dos pacientes') ||
      normalizedQuery.includes('quais pacientes') ||
      normalizedQuery.includes('mostrar pacientes');
    const wantsTodayAppointments =
      normalizedQuery.includes('hoje') &&
      /(agenda|retorno|retornos|atendimento|atendimentos|consulta|consultas)/.test(normalizedQuery);
    const wantsTomorrowAppointments =
      normalizedQuery.includes('amanha') &&
      /(agenda|retorno|retornos|atendimento|atendimentos|consulta|consultas)/.test(normalizedQuery);
    const wantsNextAppointment =
      /(proximo|proxima|seguinte)/.test(normalizedQuery) &&
      /(agenda|retorno|retornos|atendimento|atendimentos|consulta|consultas)/.test(normalizedQuery);
    const wantsArchived = /(arquivad|inativ)/.test(normalizedQuery);
    const wantsEvaluationCount = /(avaliac|evoluc|relatorio)/.test(normalizedQuery);
    const wantsDatabaseSummary =
      normalizedQuery.includes('banco local') ||
      normalizedQuery.includes('dados salvos') ||
      normalizedQuery.includes('o que esta salvo') ||
      normalizedQuery.includes('resumo geral') ||
      normalizedQuery.includes('panorama');
    const wantsPatientCount = normalizedQuery.includes('paciente') && /(quant|total)/.test(normalizedQuery);
    const wantsTodayOnly = normalizedQuery === 'hoje';

    if (patientMatches.length > 1) {
      return `Encontrei mais de um paciente parecido com essa busca: ${patientMatches
        .slice(0, 4)
        .map(patient => patient.nome)
        .join(', ')}. Me diga o nome mais completo para eu responder com precisão.`;
    }

    if (patientMatches.length === 1) {
      const patient = patientMatches[0];
      const evaluations = [...(patient.avaliacoes || [])].sort(
        (a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)
      );
      const nextAppointments = upcomingAppointments.filter(
        consulta =>
          (consulta.patientId && consulta.patientId === patient.id) ||
          normalizeText(consulta.paciente) === normalizeText(patient.nome)
      );
      const lastEvaluation = evaluations[0] || null;
      const statusText = patient.archived ? 'arquivado' : 'ativo';

      if (/(telefone|celular|contato)/.test(normalizedQuery)) {
        return patient.telefone
          ? `${patient.nome} está ${statusText} e o telefone salvo é ${patient.telefone}.`
          : `${patient.nome} está ${statusText}, mas ainda não tem telefone salvo no banco local.`;
      }

      if (normalizedQuery.includes('email')) {
        return patient.email
          ? `${patient.nome} está ${statusText} e o e-mail salvo é ${patient.email}.`
          : `${patient.nome} está ${statusText}, mas ainda não tem e-mail salvo no banco local.`;
      }

      if (/(nascimento|idade|aniversario)/.test(normalizedQuery)) {
        return patient.dataNasc
          ? `${patient.nome} está ${statusText} e a data de nascimento salva é ${patient.dataNasc}.`
          : `${patient.nome} está ${statusText}, mas ainda não tem data de nascimento registrada.`;
      }

      if (/(agenda|retorno|consulta|atendimento)/.test(normalizedQuery)) {
        if (!nextAppointments.length) {
          return `${patient.nome} está ${statusText} e não possui atendimentos futuros salvos na agenda local.`;
        }
        return `${patient.nome} está ${statusText}.\nPróximo atendimento: ${getChatAppointmentLabel(nextAppointments[0])}.`;
      }

      if (/(avaliac|evoluc|ferida|historico|relatorio)/.test(normalizedQuery)) {
        if (!lastEvaluation) {
          return `${patient.nome} está ${statusText} e ainda não possui avaliações salvas.`;
        }
        return `${patient.nome} está ${statusText}.\nAvaliações salvas: ${evaluations.length}.\nÚltima evolução: ${lastEvaluation.data || 'sem data'} • ${lastEvaluation.regiao || 'região não informada'}${lastEvaluation.tipo ? ` • ${lastEvaluation.tipo}` : ''}.`;
      }

      return `${patient.nome} está ${statusText}.\nTelefone: ${patient.telefone || 'não informado'}.\nE-mail: ${patient.email || 'não informado'}.\nAvaliações salvas: ${evaluations.length}.\nPróximo atendimento: ${nextAppointments[0] ? getChatAppointmentLabel(nextAppointments[0]) : 'nenhum atendimento futuro salvo'}.`;
    }

    if (wantsTodayAppointments || wantsTodayOnly) {
      const todayAppointments = allAppointments.filter(consulta => consulta.date === todayKey);
      if (!todayAppointments.length) {
        return 'Hoje não há atendimentos salvos na agenda local.';
      }
      return `Hoje você tem ${todayAppointments.length} atendimento(s):\n${todayAppointments
        .slice(0, 4)
        .map(consulta => `• ${getChatAppointmentLabel(consulta)}`)
        .join('\n')}`;
    }

    if (wantsTomorrowAppointments) {
      const tomorrowAppointments = allAppointments.filter(consulta => consulta.date === tomorrowKey);
      if (!tomorrowAppointments.length) {
        return 'Amanhã não há atendimentos salvos na agenda local.';
      }
      return `Amanhã você tem ${tomorrowAppointments.length} atendimento(s):\n${tomorrowAppointments
        .slice(0, 4)
        .map(consulta => `• ${getChatAppointmentLabel(consulta)}`)
        .join('\n')}`;
    }

    if (wantsNextAppointment) {
      if (!upcomingAppointments.length) {
        return 'Não encontrei atendimentos futuros na agenda local.';
      }
      return `Seu próximo atendimento salvo é ${getChatAppointmentLabel(upcomingAppointments[0])}.`;
    }

    if (wantsArchived) {
      return pacientesArquivados.length
        ? `Há ${pacientesArquivados.length} paciente(s) arquivado(s) no banco local: ${pacientesArquivados
            .slice(0, 4)
            .map(patient => patient.nome)
            .join(', ')}.`
        : 'Não há pacientes arquivados no banco local.';
    }

    if (wantsEvaluationCount) {
      if (!totalAvaliacoes) {
        return 'Ainda não há avaliações salvas no banco local.';
      }
      const highlightedPatients = patientsWithReports
        .slice(0, 3)
        .map(patient => `${patient.nome} (${patient.avaliacoes.length})`)
        .join(', ');
      return `Existem ${totalAvaliacoes} avaliação(ões) salvas no total.\nPacientes com histórico: ${highlightedPatients || 'nenhum ainda'}.`;
    }

    if (wantsPatientList) {
      if (!activePatientNames.length) {
        return 'Ainda não há pacientes ativos cadastrados no Heal+.';
      }
      const preview = activePatientNames.slice(0, 6).join(', ');
      return `Pacientes ativos no momento: ${preview}${activePatientNames.length > 6 ? ` e mais ${activePatientNames.length - 6}` : ''}.`;
    }

    if (wantsDatabaseSummary || wantsPatientCount) {
      return `Resumo do banco local:\n• Pacientes ativos: ${pacientesAtivos.length}\n• Pacientes arquivados: ${pacientesArquivados.length}\n• Avaliações salvas: ${totalAvaliacoes}\n• Atendimentos futuros: ${upcomingAppointments.length}`;
    }

    return 'Consigo consultar o banco local do Heal+ sem custo e sem internet.\nTente perguntas como:\n• Quantos pacientes ativos eu tenho?\n• Quais atendimentos eu tenho hoje?\n• Quantas avaliações estão salvas?\n• Me fale sobre o paciente Paulo Souza.';
  };
  const chatInfoCards = [
    {
      id: '1',
      icon: 'chatbubble-ellipses-outline',
      title: 'Faça perguntas rápidas',
      text: 'Use o assistente para consultar pacientes, avaliações e agenda já salvos no próprio Heal+.',
    },
    {
      id: '2',
      icon: 'pulse-outline',
      title: 'Tudo local e sem custo',
      text: 'As respostas usam o banco local do app, sem cobrança por token e sem depender de serviço externo.',
    },
  ];

  const renderPatientHeaderActions = paciente => {
    const progress = getPatientMenuAnimation(paciente.id);
    const isOpen = openPatientMenuId === paciente.id;
    const dotsOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
    const dotsScale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.85] });
    const iconsOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
    const iconsTranslate = progress.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });

    return (
      <View style={styles.patientHeaderActions}>
        <Animated.View
          pointerEvents={isOpen ? 'none' : 'auto'}
          style={[
            styles.patientMoreButtonLayer,
            {
              opacity: dotsOpacity,
              transform: [{ scale: dotsScale }],
            },
          ]}
        >
          <TouchableOpacity style={styles.patientMoreButton} onPress={() => togglePatientMenu(paciente.id)}>
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View
          pointerEvents={isOpen ? 'auto' : 'none'}
          style={[
            styles.patientInlineIconActions,
            {
              opacity: iconsOpacity,
              transform: [{ translateX: iconsTranslate }],
            },
          ]}
        >
          <TouchableOpacity style={styles.patientIconActionBtn} onPress={() => abrirModalEditarPaciente(paciente)}>
            <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.patientIconActionBtn} onPress={() => arquivarPaciente(paciente)}>
            <Ionicons name="archive-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.patientIconActionBtn} onPress={() => closePatientMenu(paciente.id)}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderPatientEvaluationItem = (paciente, aval, index) => (
    <View
      key={aval.id}
      style={[styles.patientRecordItem, index !== paciente.avaliacoes.length - 1 && styles.patientRecordBorder]}
    >
      <View style={styles.patientRecordHeaderRow}>
        <View style={styles.patientRecordInfoCol}>
          <View style={styles.patientDetailRow}>
            <Ionicons name="eye-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.patientDetailText}>{aval.regiao}</Text>
          </View>
          <View style={styles.patientDetailRow}>
            <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.patientDetailText}>{aval.data}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.patientEvalEditBtn} onPress={() => abrirEditarAvaliacaoPaciente(paciente, aval)}>
          <Ionicons name="create-outline" size={16} color={colors.primary} />
          <Text style={styles.patientEvalEditText}>Editar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const compareAreaA = compareEvalA ? calculateCompareEvalArea(compareEvalA) : 0;
  const compareAreaB = compareEvalB ? calculateCompareEvalArea(compareEvalB) : 0;
  let compareAreaReduction = 0;
  if (compareAreaA > 0) {
      compareAreaReduction = Math.round(((compareAreaB - compareAreaA) / compareAreaA) * 100);
  }
  const compareAreaReductionText = compareAreaReduction > 0 ? `↑ +${compareAreaReduction}%` : (compareAreaReduction < 0 ? `↓ ${Math.abs(compareAreaReduction)}%` : `0%`);
  const compareAreaReductionColor = compareAreaReduction <= 0 ? '#10B981' : '#EF4444';
  const compareMaxChartArea = Math.max(compareAreaA, compareAreaB) > 0 ? Math.max(compareAreaA, compareAreaB) * 1.2 : 14;
  const compareHasValidChart = compareEvalA && compareEvalB && compareEvalA.id !== compareEvalB.id;
  const avaliacaoPageTitle = isEditingEvaluation ? 'Editar Avaliação' : 'Nova Avaliação';
  const avaliacaoSaveButtonLabel = isEditingEvaluation ? 'Salvar Alterações da Avaliação' : 'Salvar Avaliação';
  const isLoginButtonDisabled = isLoginButtonDimmed;
  const currentSkeletonConfig = SCREEN_SKELETON_CONFIGS[transitionSkeletonScreen] || null;

  const SkeletonBlock = ({ width = '100%', height = 16, style, rounded = 12, accent = false }) => (
    <Animated.View
      style={[
        styles.skeletonBlock,
        accent ? styles.skeletonBlockAccent : styles.skeletonBlockBase,
        { width, height, borderRadius: rounded, opacity: skeletonPulse },
        style,
      ]}
    />
  );

  const SkeletonContentShell = ({
    top = 0,
    bottom = 0,
    horizontalPadding = 24,
    contentContainerStyle,
    children,
  }) => (
    <View style={[styles.skeletonViewport, { top, bottom }]}>
      <ScrollView
        style={styles.skeletonViewportScroll}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={[
          styles.skeletonViewportContent,
          { paddingHorizontal: horizontalPadding },
          contentContainerStyle,
        ]}
      >
        {children}
      </ScrollView>
    </View>
  );

  const renderHomeSkeleton = config => (
    <SkeletonContentShell top={config.top} bottom={config.bottom} contentContainerStyle={styles.homeScrollContent}>
        <View style={styles.homeSearchPill}>
          <SkeletonBlock width={18} height={18} rounded={9} />
          <SkeletonBlock width="58%" height={14} rounded={7} style={{ marginLeft: 12 }} />
        </View>

        <View style={styles.skeletonCard}>
          <SkeletonBlock width="52%" height={24} rounded={10} accent style={{ marginBottom: 10 }} />
          <SkeletonBlock width="88%" height={14} rounded={7} style={{ marginBottom: 8 }} />
          <SkeletonBlock width="66%" height={14} rounded={7} />
        </View>

        <View style={styles.skeletonPillRow}>
          {Array.from({ length: 3 }).map((_, index) => (
            <View key={`home-pill-${index}`} style={styles.skeletonMiniPill}>
              <SkeletonBlock width={16} height={16} rounded={8} accent={index === 0} />
              <SkeletonBlock width={68} height={12} rounded={6} style={{ marginLeft: 8 }} />
            </View>
          ))}
        </View>

        <SkeletonBlock width={140} height={16} rounded={8} style={{ marginBottom: 14 }} />
        <View style={styles.skeletonSplitRow}>
          {Array.from({ length: 2 }).map((_, index) => (
            <View key={`home-stat-${index}`} style={styles.skeletonSplitCard}>
              <SkeletonBlock width={34} height={34} rounded={17} accent={index === 0} style={{ marginBottom: 14 }} />
              <SkeletonBlock width={56} height={24} rounded={9} style={{ marginBottom: 10 }} />
              <SkeletonBlock width={90} height={12} rounded={6} />
            </View>
          ))}
        </View>

        <SkeletonBlock width={132} height={16} rounded={8} style={{ marginBottom: 14 }} />
        <View style={styles.skeletonGrid}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View key={`home-grid-${index}`} style={styles.skeletonGridCard}>
              <SkeletonBlock width={36} height={36} rounded={12} accent={index % 2 === 0} style={{ marginBottom: 16 }} />
              <SkeletonBlock width="68%" height={14} rounded={7} style={{ marginBottom: 8 }} />
            <SkeletonBlock width="48%" height={12} rounded={6} />
          </View>
        ))}
      </View>
    </SkeletonContentShell>
  );

  const renderPatientsSkeleton = config => (
    <SkeletonContentShell
      top={config.top}
      bottom={config.bottom}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 30 }}
    >
        <View style={styles.skeletonPatientsHero}>
          <SkeletonBlock width="54%" height={24} rounded={9} accent style={{ alignSelf: 'center', marginBottom: 10 }} />
          <SkeletonBlock width="76%" height={14} rounded={7} style={{ alignSelf: 'center', marginBottom: 18 }} />
          <SkeletonBlock height={56} rounded={18} style={{ marginBottom: 16 }} />
          <View style={styles.skeletonPillRow}>
            {Array.from({ length: 3 }).map((_, index) => (
              <View key={`patient-action-${index}`} style={styles.skeletonMiniPill}>
                <SkeletonBlock width={16} height={16} rounded={8} accent={index === 1} />
                <SkeletonBlock width={70} height={12} rounded={6} style={{ marginLeft: 8 }} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.skeletonFilterRow}>
          <SkeletonBlock width={132} height={14} rounded={7} />
          <SkeletonBlock width={48} height={30} rounded={16} accent />
        </View>

        {Array.from({ length: 3 }).map((_, index) => (
          <View key={`patient-card-${index}`} style={styles.skeletonCard}>
            <View style={styles.skeletonPatientHeader}>
              <View style={styles.skeletonPatientIdentity}>
                <SkeletonBlock width={42} height={42} rounded={21} accent />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <SkeletonBlock width="58%" height={16} rounded={8} style={{ marginBottom: 8 }} />
                  <SkeletonBlock width="72%" height={12} rounded={6} />
                </View>
              </View>
              <SkeletonBlock width={28} height={28} rounded={14} />
            </View>

            <View style={styles.skeletonPillRow}>
              {Array.from({ length: 3 }).map((__, pillIndex) => (
                <View key={`patient-shortcut-${index}-${pillIndex}`} style={styles.skeletonMiniPill}>
                  <SkeletonBlock width={14} height={14} rounded={7} accent={pillIndex === 0} />
                  <SkeletonBlock width={58} height={11} rounded={5} style={{ marginLeft: 8 }} />
                </View>
              ))}
            </View>

            <View style={styles.skeletonListGroup}>
              {Array.from({ length: 2 }).map((__, recordIndex) => (
                <View key={`patient-record-${index}-${recordIndex}`} style={styles.skeletonListRow}>
                  <View style={{ flex: 1 }}>
                    <SkeletonBlock width="44%" height={12} rounded={6} style={{ marginBottom: 8 }} />
                    <SkeletonBlock width="34%" height={12} rounded={6} />
                  </View>
                  <SkeletonBlock width={68} height={28} rounded={12} />
                </View>
              ))}
            </View>
          </View>
        ))}

    </SkeletonContentShell>
  );

  const renderAgendaSkeleton = config => (
    <SkeletonContentShell
      top={config.top}
      bottom={config.bottom}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 96 }}
    >
        <View style={styles.skeletonAgendaTop}>
          <SkeletonBlock width="62%" height={24} rounded={9} accent style={{ alignSelf: 'center', marginBottom: 10 }} />
          <SkeletonBlock width="82%" height={14} rounded={7} style={{ alignSelf: 'center' }} />
        </View>

        <View style={styles.skeletonCard}>
          <SkeletonBlock width={96} height={14} rounded={7} style={{ marginBottom: 12 }} />
          <SkeletonBlock width="46%" height={24} rounded={9} accent style={{ marginBottom: 10 }} />
          <SkeletonBlock width="92%" height={13} rounded={7} />
        </View>

        <View style={styles.skeletonMonthRow}>
          <SkeletonBlock width={38} height={38} rounded={19} />
          <SkeletonBlock width={160} height={18} rounded={9} />
          <SkeletonBlock width={38} height={38} rounded={19} />
        </View>

        <View style={styles.skeletonDayRow}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={`agenda-day-${index}`} style={styles.skeletonDayPill}>
              <SkeletonBlock width={24} height={10} rounded={5} />
              <SkeletonBlock width={28} height={16} rounded={8} accent={index === 2} style={{ marginTop: 8 }} />
            </View>
          ))}
        </View>

        <SkeletonBlock width="48%" height={16} rounded={8} style={{ marginBottom: 8 }} />
        <SkeletonBlock width="34%" height={12} rounded={6} style={{ marginBottom: 18 }} />

        {Array.from({ length: 3 }).map((_, index) => (
          <View key={`agenda-card-${index}`} style={styles.skeletonAgendaCard}>
            <View style={styles.skeletonAgendaTime}>
              <SkeletonBlock width={32} height={18} rounded={9} accent={index === 0} style={{ marginBottom: 8 }} />
              <SkeletonBlock width={22} height={14} rounded={7} />
            </View>
            <View style={styles.skeletonAgendaDivider} />
            <View style={{ flex: 1 }}>
              <SkeletonBlock width="56%" height={16} rounded={8} style={{ marginBottom: 10 }} />
              <SkeletonBlock width="42%" height={12} rounded={6} style={{ marginBottom: 10 }} />
              <SkeletonBlock width="84%" height={12} rounded={6} style={{ marginBottom: 12 }} />
              <View style={styles.skeletonAgendaActions}>
                <SkeletonBlock width={78} height={28} rounded={12} />
                <SkeletonBlock width={78} height={28} rounded={12} />
              </View>
            </View>
            <SkeletonBlock width={74} height={28} rounded={14} accent />
          </View>
        ))}
    </SkeletonContentShell>
  );

  const renderFormSkeleton = config => (
    <SkeletonContentShell
      top={config.top}
      bottom={config.bottom}
      contentContainerStyle={{ paddingTop: 4, paddingBottom: 40 }}
    >
        <SkeletonBlock width="48%" height={24} rounded={9} accent style={{ alignSelf: 'center', marginBottom: 10 }} />
        <SkeletonBlock width="76%" height={14} rounded={7} style={{ alignSelf: 'center', marginBottom: 22 }} />

        <View style={styles.skeletonAccordionCard}>
          <View style={styles.skeletonAccordionHeader}>
            <View style={styles.skeletonAccordionTitle}>
              <SkeletonBlock width={24} height={24} rounded={12} accent />
              <SkeletonBlock width={138} height={16} rounded={8} style={{ marginLeft: 10 }} />
            </View>
            <SkeletonBlock width={18} height={18} rounded={9} />
          </View>
          <View style={styles.skeletonCardSubtle}>
            <SkeletonBlock width={118} height={14} rounded={7} style={{ marginBottom: 14 }} />
            <View style={styles.skeletonSplitRow}>
              <SkeletonBlock width="48%" height={52} rounded={16} />
              <SkeletonBlock width="48%" height={52} rounded={16} />
            </View>
            <View style={styles.skeletonSplitRow}>
              <SkeletonBlock width="48%" height={52} rounded={16} />
              <SkeletonBlock width="48%" height={52} rounded={16} />
            </View>
          </View>
        </View>

        <View style={styles.skeletonAccordionCard}>
          <View style={styles.skeletonAccordionHeader}>
            <View style={styles.skeletonAccordionTitle}>
              <SkeletonBlock width={24} height={24} rounded={12} accent />
              <SkeletonBlock width={108} height={16} rounded={8} style={{ marginLeft: 10 }} />
            </View>
            <SkeletonBlock width={18} height={18} rounded={9} />
          </View>
          <View style={styles.skeletonCardSubtle}>
            <SkeletonBlock height={170} rounded={22} accent style={{ marginBottom: 14 }} />
            <View style={styles.skeletonSplitRow}>
              <SkeletonBlock width="48%" height={52} rounded={16} />
              <SkeletonBlock width="48%" height={52} rounded={16} />
            </View>
            <SkeletonBlock height={52} rounded={16} style={{ marginTop: 12 }} />
          </View>
        </View>

        <View style={styles.skeletonAccordionCard}>
          <View style={styles.skeletonAccordionHeader}>
            <View style={styles.skeletonAccordionTitle}>
              <SkeletonBlock width={24} height={24} rounded={12} />
              <SkeletonBlock width={154} height={16} rounded={8} style={{ marginLeft: 10 }} />
            </View>
            <SkeletonBlock width={18} height={18} rounded={9} />
          </View>
        </View>

        <View style={styles.skeletonAccordionCard}>
          <View style={styles.skeletonAccordionHeader}>
            <View style={styles.skeletonAccordionTitle}>
              <SkeletonBlock width={24} height={24} rounded={12} />
              <SkeletonBlock width={170} height={16} rounded={8} style={{ marginLeft: 10 }} />
            </View>
            <SkeletonBlock width={18} height={18} rounded={9} />
          </View>
        </View>
        <SkeletonBlock height={56} rounded={18} accent style={{ marginTop: 10 }} />
    </SkeletonContentShell>
  );

  const renderProfileSkeleton = config => (
    <SkeletonContentShell
      top={config.top}
      bottom={config.bottom}
      contentContainerStyle={{ paddingTop: 4, paddingBottom: 20 }}
    >
        <View style={styles.profileInfoContainer}>
          <SkeletonBlock width={104} height={104} rounded={52} accent style={{ marginBottom: 14 }} />
          <SkeletonBlock width="44%" height={12} rounded={6} style={{ marginBottom: 14 }} />
          <SkeletonBlock width="52%" height={22} rounded={10} style={{ marginBottom: 10 }} />
          <SkeletonBlock width="60%" height={14} rounded={7} />
        </View>

        <View style={styles.skeletonCard}>
          <View style={styles.skeletonMetricsHeader}>
            <SkeletonBlock width={22} height={22} rounded={11} accent />
            <SkeletonBlock width={170} height={16} rounded={8} style={{ marginLeft: 10 }} />
          </View>
          <View style={styles.skeletonMetricsRow}>
            {Array.from({ length: 3 }).map((_, index) => (
              <View key={`metric-${index}`} style={styles.skeletonMetricCol}>
                <SkeletonBlock width={52} height={24} rounded={10} accent={index < 2} style={{ marginBottom: 10 }} />
                <SkeletonBlock width={76} height={12} rounded={6} style={{ marginBottom: 6 }} />
                <SkeletonBlock width={54} height={12} rounded={6} />
              </View>
            ))}
          </View>
        </View>

        <SkeletonBlock width={78} height={14} rounded={7} style={{ marginBottom: 14 }} />

        {Array.from({ length: 3 }).map((_, index) => (
          <View key={`profile-row-${index}`} style={styles.skeletonMenuRow}>
            <View style={styles.skeletonMenuLeading}>
              <SkeletonBlock width={42} height={42} rounded={16} accent={index !== 1} />
              <View style={{ marginLeft: 12 }}>
                <SkeletonBlock width={108} height={14} rounded={7} style={{ marginBottom: 8 }} />
                <SkeletonBlock width={136} height={12} rounded={6} />
              </View>
            </View>
            <SkeletonBlock width={index === 1 ? 48 : 18} height={index === 1 ? 30 : 18} rounded={16} />
          </View>
        ))}
    </SkeletonContentShell>
  );

  const renderChatSkeleton = config => (
    <SkeletonContentShell
      top={config.top}
      bottom={config.bottom}
      horizontalPadding={20}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
    >
      <View style={[styles.skeletonChatBubble, styles.skeletonChatBubbleAi, { marginBottom: 14 }]}>
        <SkeletonBlock width="78%" height={12} rounded={6} style={{ marginBottom: 8 }} />
        <SkeletonBlock width="54%" height={12} rounded={6} />
      </View>
      <View style={[styles.skeletonChatBubble, styles.skeletonChatBubbleUser, { marginBottom: 14 }]}>
        <SkeletonBlock width="64%" height={12} rounded={6} />
      </View>
      <View style={[styles.skeletonChatBubble, styles.skeletonChatBubbleAi]}>
        <SkeletonBlock width="82%" height={12} rounded={6} style={{ marginBottom: 8 }} />
        <SkeletonBlock width="48%" height={12} rounded={6} />
      </View>
    </SkeletonContentShell>
  );

  const renderSkeletonVariant = config => {
    const variant = config?.variant || 'home';

    switch (variant) {
      case 'patients':
        return renderPatientsSkeleton(config);
      case 'agenda':
        return renderAgendaSkeleton(config);
      case 'form':
        return renderFormSkeleton(config);
      case 'profile':
        return renderProfileSkeleton(config);
      case 'chat':
        return renderChatSkeleton(config);
      case 'home':
      default:
        return renderHomeSkeleton(config);
    }
  };

  const headerProps = {
    colors,
    styles,
    onOpenProfile: abrirPerfil,
    onOpenNotifications: () => setTela('Notificacoes'),
    showUserPhotoPreview,
    userPhoto,
    userName,
  };

  const navItems = useBottomNavItems({
    onGoHome: voltarParaHome,
    onGoPatients: () => setTela('Pacientes'),
    onGoEvaluation: abrirTelaNovaAvaliacao,
    onGoAgenda: () => setTela('Agenda'),
    onGoProfile: abrirPerfil,
  });

  const bottomNavProps = {
    colors,
    styles,
    navItems,
    activeBottomTabKey,
    activeBottomTabIndex,
    bottomNavWidth,
    setBottomNavWidth,
    bottomNavTranslate,
    bottomNavScale,
    androidBottomInset,
  };

  const renderCurrentScreen = () => {
    switch (tela) {
      case 'Home':
        return (
          <HomeScreen
            styles={styles}
            colors={colors}
            userName={userName}
            pacientesAtivos={pacientesAtivos}
            totalAvaliacoes={totalAvaliacoes}
            onOpenChat={() => setTela('ChatBot')}
            onOpenNewEvaluation={abrirTelaNovaAvaliacao}
            onOpenPatients={() => setTela('Pacientes')}
            onOpenReport={() => abrirGerarRelatorio(null)}
            onOpenCompare={() => abrirCompararRelatorios(null)}
            headerProps={headerProps}
            bottomNavProps={bottomNavProps}
          />
        );
      case 'Relatorios':
        return (
          <ReportsScreen
            styles={styles}
            colors={colors}
            relatorioPaciente={relatorioPaciente}
            setRelatorioPaciente={setRelatorioPaciente}
            showRelatorioDropdown={showRelatorioDropdown}
            setShowRelatorioDropdown={setShowRelatorioDropdown}
            pacientesRelatorioFilter={pacientesRelatorioFilter}
            selectedPacienteRelatorio={selectedPacienteRelatorio}
            activeReportEval={activeReportEval}
            relatorioPatientEvals={relatorioPatientEvals}
            showEvalDropdown={showEvalDropdown}
            setShowEvalDropdown={setShowEvalDropdown}
            patientEvalLabel={patientEvalLabel}
            setRelatorioSelectedEvalId={setRelatorioSelectedEvalId}
            incTimers={incTimers}
            setIncTimers={setIncTimers}
            incFotos={incFotos}
            setIncFotos={setIncFotos}
            incAnalise={incAnalise}
            setIncAnalise={setIncAnalise}
            incNotas={incNotas}
            setIncNotas={setIncNotas}
            exportFormat={exportFormat}
            setExportFormat={setExportFormat}
            onGenerateReport={handleGerarRelatorio}
            onBackHome={() => setTela('Home')}
            bottomNavProps={bottomNavProps}
          />
        );
      case 'CompararRelatorios':
        return (
          <CompareReportsScreen
            styles={styles}
            colors={colors}
            compareSearchQuery={compareSearchQuery}
            setCompareSearchQuery={setCompareSearchQuery}
            showCompareDropdown={showCompareDropdown}
            setShowCompareDropdown={setShowCompareDropdown}
            pacientesCompareFilter={pacientesCompareFilter}
            setComparePatientId={setComparePatientId}
            setCompareEvalAId={setCompareEvalAId}
            setCompareEvalBId={setCompareEvalBId}
            comparePatient={comparePatient}
            comparePatientId={comparePatientId}
            patientsWithCompare={patientsWithCompare}
            compareEvalA={compareEvalA}
            compareEvalB={compareEvalB}
            compareEvals={compareEvals}
            patientEvalLabel={patientEvalLabel}
            compareAreaA={compareAreaA}
            compareAreaB={compareAreaB}
            compareHasValidChart={compareHasValidChart}
            compareAreaReductionColor={compareAreaReductionColor}
            compareAreaReductionText={compareAreaReductionText}
            compareMaxChartArea={compareMaxChartArea}
            handleExportarComparativo={handleExportarComparativo}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            androidBottomInset={androidBottomInset}
            onBack={setTela}
          />
        );
      case 'Pacientes':
        return (
          <PatientsScreen
            styles={styles}
            colors={colors}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            showArchived={showArchived}
            setShowArchived={setShowArchived}
            pacientesFiltrados={pacientesFiltrados}
            pacientesArquivadosFiltrados={pacientesArquivadosFiltrados}
            onOpenNewEvaluation={paciente =>
              paciente ? abrirNovaAvaliacaoPaciente(paciente) : abrirTelaNovaAvaliacao()
            }
            onOpenNewPatientModal={abrirModalNovoPaciente}
            onOpenReport={abrirGerarRelatorio}
            onOpenCompare={abrirCompararRelatorios}
            renderPatientHeaderActions={renderPatientHeaderActions}
            renderPatientEvaluationItem={renderPatientEvaluationItem}
            headerProps={headerProps}
            bottomNavProps={bottomNavProps}
          />
        );
      case 'Agenda':
        return (
          <AgendaScreen
            styles={styles}
            colors={colors}
            totalConsultasMes={totalConsultasMes}
            mesAtivo={mesAtivo}
            diasAgenda={diasAgenda}
            selectedAgendaDate={selectedAgendaDate}
            setSelectedAgendaDate={setSelectedAgendaDate}
            infoDiaAtivo={infoDiaAtivo}
            consultasDoDia={consultasDoDia}
            getStatusStyles={getStatusStyles}
            onNavigateMonth={navegarMesAgenda}
            onEditAppointment={abrirEditarAgenda}
            onDeleteAppointment={confirmarExcluirAgenda}
            onOpenNewAppointment={() => abrirModalAgenda(selectedAgendaDate)}
            agendaScrollFooterHeight={agendaScrollFooterHeight}
            agendaFabOffsetStyle={agendaFabOffsetStyle}
            headerProps={headerProps}
            bottomNavProps={bottomNavProps}
          />
        );
      case 'Avaliacao':
        return (
          <EvaluationScreen
            styles={styles}
            colors={colors}
            form={form}
            updateField={updateField}
            toggleBool={toggleBool}
            handleTissuePercentageChange={handleTissuePercentageChange}
            expandedSection={expandedSection}
            toggleSection={toggleSection}
            pacientesAtivos={pacientesAtivos}
            onSelectExistingPatient={selecionarPacienteExistente}
            showImagePickerModal={showImagePickerModal}
            setShowImagePickerModal={setShowImagePickerModal}
            isImagePickerBusy={isImagePickerBusy}
            onOpenImagePicker={abrirImagePicker}
            onTakeWoundPhoto={tirarFotoFerida}
            onChooseWoundPhoto={escolherFotoGaleria}
            getPainColor={getPainColor}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            onSave={saveAvaliacao}
            avaliacaoPageTitle={avaliacaoPageTitle}
            avaliacaoSaveButtonLabel={avaliacaoSaveButtonLabel}
            headerProps={headerProps}
            bottomNavProps={bottomNavProps}
          />
        );
      case 'ChatBotInfo':
        return (
          <ChatBotInfoScreen
            styles={styles}
            colors={colors}
            chatInfoCards={chatInfoCards}
            onBack={setTela}
            onOpenChat={() => setTela('ChatBot')}
            onOpenPatients={() => setTela('Pacientes')}
          />
        );
      case 'ChatBot':
        return (
          <ChatBotScreen
            styles={styles}
            colors={colors}
            platformBehavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            chatScrollRef={chatScrollRef}
            messages={messages}
            isAiTyping={isAiTyping}
            userName={userName}
            chatQuickTopics={chatQuickTopics}
            chatMessage={chatMessage}
            setChatMessage={setChatMessage}
            onBackHome={voltarParaHome}
            onOpenInfo={() => setTela('ChatBotInfo')}
            onSendChat={handleSendChat}
          />
        );
      case 'EditarPerfil':
        return (
          <EditProfileScreen
            styles={styles}
            colors={colors}
            tempName={tempName}
            setTempName={setTempName}
            tempEmail={tempEmail}
            setTempEmail={setTempEmail}
            tempPhoto={tempPhoto}
            isImagePickerBusy={isImagePickerBusy}
            onOpenImagePicker={abrirImagePickerPerfil}
            onRemovePhoto={removerFotoPerfil}
            onSave={salvarEdicaoPerfil}
            onBack={setTela}
          />
        );
      case 'Perfil':
        return (
          <ProfileScreen
            styles={styles}
            colors={colors}
            isDark={isDark}
            toggleTheme={toggleTheme}
            userName={userName}
            userPhoto={userPhoto}
            previewUserEmail={previewUserEmail}
            showUserPhotoPreview={showUserPhotoPreview}
            totalAvaliacoes={totalAvaliacoes}
            pacientesAtivos={pacientesAtivos}
            isNotificacoesEnabled={isNotificacoesEnabled}
            setIsNotificacoesEnabled={setIsNotificacoesEnabled}
            onOpenPrivacy={() => setTela('Privacidade')}
            onOpenEditProfile={abrirEdicaoPerfil}
            onOpenNotifications={() => setTela('Notificacoes')}
            onOpenAbout={() => setTela('SobreApp')}
            onLogout={sairDaConta}
            bottomNavProps={bottomNavProps}
          />
        );
      case 'Notificacoes':
        return (
          <NotificationsScreen
            styles={styles}
            colors={colors}
            isNotificacoesEnabled={isNotificacoesEnabled}
            setIsNotificacoesEnabled={setIsNotificacoesEnabled}
            agendaRemindersEnabled={agendaRemindersEnabled}
            emailNotificationsEnabled={emailNotificationsEnabled}
            updateUserPreference={updateUserPreference}
            onBack={setTela}
            bottomNavProps={bottomNavProps}
          />
        );
      case 'Privacidade':
        return (
          <PrivacyScreen
            styles={styles}
            colors={colors}
            hideEmailPreviewEnabled={hideEmailPreviewEnabled}
            showProfilePhotoEnabled={showProfilePhotoEnabled}
            updateUserPreference={updateUserPreference}
            onBack={setTela}
            bottomNavProps={bottomNavProps}
          />
        );
      case 'SobreApp':
        return (
          <AboutAppScreen
            styles={styles}
            colors={colors}
            isDark={isDark}
            onOpenPrivacy={() => setTela('Privacidade')}
            onOpenChatBotInfo={() => setTela('ChatBotInfo')}
            onBack={setTela}
            bottomNavProps={bottomNavProps}
          />
        );
      case 'EsqueciSenha':
        return (
          <View style={{ flex: 1 }}>
            <View style={[styles.content, styles.contentForgot]}>
              <ForgotPasswordScreen
                styles={styles}
                colors={colors}
                onClose={() => setTela('Login')}
                onContinue={handleForgotPasswordContinue}
              />
            </View>
          </View>
        );
      case 'TrocarConta':
        return (
          <View style={{ flex: 1 }}>
            <View style={styles.headerFixoLogin}>
              <Image style={styles.logo} source={LOGO_IMAGE} resizeMode="contain" />
              <Text style={styles.logoText}>
                Heal<Text style={styles.textBlue}>+</Text>
              </Text>
            </View>
            <View style={styles.content}>
              <SwitchAccountScreen
                styles={styles}
                tempName={tempName}
                setTempName={setTempName}
                tempEmail={tempEmail}
                setTempEmail={setTempEmail}
                onSave={confirmarTroca}
                onCancel={() => setTela('Login')}
              />
            </View>
          </View>
        );
      case 'Login':
      default:
        return (
          <LoginScreen
            styles={styles}
            colors={colors}
            userName={userName}
            userPhoto={userPhoto}
            previewUserEmail={previewUserEmail}
            showUserPhotoPreview={showUserPhotoPreview}
            password={password}
            setPassword={text => {
              setPassword(text);
              setIsLoginButtonDimmed(false);
              if (isError) setIsError(false);
            }}
            isError={isError}
            isFocused={isFocused}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            activity={activity}
            isLoginButtonDisabled={isLoginButtonDisabled}
            labelStyle={labelStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onLogin={handleLogin}
            onForgotPassword={() => setTela('EsqueciSenha')}
            onSwitchAccount={prepararTroca}
          />
        );
    }
  };

  return <SafeAreaView style={styles.container}><StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
    <ProfilePhotoPickerModal
      visible={showProfileImagePickerModal}
      onClose={fecharImagePickerPerfil}
      styles={styles}
      colors={colors}
      isBusy={isImagePickerBusy}
      hasPhoto={!!tempPhoto}
      onTakePhoto={tirarFotoPerfil}
      onChooseFromLibrary={escolherFotoPerfilGaleria}
      onRemovePhoto={removerFotoPerfil}
    />
    <LoginErrorModal
      visible={modalErroVisible}
      onClose={() => setModalErroVisible(false)}
      styles={styles}
    />
    <PatientFormModal
      visible={modalPacienteVisible}
      onClose={() => setModalPacienteVisible(false)}
      styles={styles}
      colors={colors}
      isEditing={isEditingPatient}
      name={novoPacNome}
      birthDate={novoPacDataNasc}
      phone={novoPacTelefone}
      email={novoPacEmail}
      onChangeName={setNovoPacNome}
      onChangeBirthDate={setNovoPacDataNasc}
      onChangePhone={setNovoPacTelefone}
      onChangeEmail={setNovoPacEmail}
      onSubmit={salvarPaciente}
    />
    <ReportPatientSelectionModal
      visible={modalReportPatientVisible}
      onClose={() => setModalReportPatientVisible(false)}
      styles={styles}
      colors={colors}
      patients={patientsWithReports}
      onSelectPatient={patient => {
        setReportPatientId(patient.id);
        setReportSelectedEvalId(null);
        setModalReportPatientVisible(false);
      }}
    />
    <ReportEvaluationSelectionModal
      visible={modalReportEvalVisible}
      onClose={() => setModalReportEvalVisible(false)}
      styles={styles}
      colors={colors}
      evaluations={reportPatient?.avaliacoes || []}
      hasPatient={!!reportPatient}
      getEvaluationLabel={patientEvalLabel}
      onSelectEvaluation={evaluation => {
        setReportSelectedEvalId(evaluation.id);
        setModalReportEvalVisible(false);
      }}
    />
    <AgendaAppointmentModal
      visible={modalAgendaVisible}
      onClose={fecharModalAgenda}
      styles={styles}
      colors={colors}
      isEditing={isEditingAgendaAppointment}
      agendaForm={agendaForm}
      patients={pacientesAtivos}
      onChangeField={updateAgendaField}
      onSelectPatient={selecionarPacienteAgenda}
      openDropdown={openDropdown}
      setOpenDropdown={setOpenDropdown}
      agendaTypeOptions={agendaTypeOptions}
      agendaStatusOptions={agendaStatusOptions}
      onSubmit={saveAgendaAppointment}
      onDelete={() =>
        confirmarExcluirAgenda({
          id: editingAgendaAppointmentId,
          paciente: agendaForm.paciente,
        })
      }
    />

    {renderCurrentScreen()}
    {currentSkeletonConfig && (
      <Animated.View pointerEvents="none" style={[styles.skeletonScreenOverlay, { opacity: transitionSkeletonOpacity }]}>
        {renderSkeletonVariant(currentSkeletonConfig)}
      </Animated.View>
    )}
  </SafeAreaView>;
}

export default function HealPlusApp() {
  return <AppContent />;
}
