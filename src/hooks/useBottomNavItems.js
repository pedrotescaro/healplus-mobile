import { BOTTOM_NAV_CONFIG } from '../navigation/bottomNavConfig';

const navActionMap = {
  Home: 'onGoHome',
  Pacientes: 'onGoPatients',
  Avaliacao: 'onGoEvaluation',
  Agenda: 'onGoAgenda',
  Perfil: 'onGoProfile',
};

export default function useBottomNavItems(actions) {
  return BOTTOM_NAV_CONFIG.map(item => ({
    ...item,
    onPress: actions[navActionMap[item.key]],
  }));
}
