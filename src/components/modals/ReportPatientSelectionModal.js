import React from 'react';

import SelectionListModal from './SelectionListModal';

export default function ReportPatientSelectionModal({
  visible,
  onClose,
  styles,
  colors,
  patients,
  onSelectPatient,
}) {
  return (
    <SelectionListModal
      visible={visible}
      onClose={onClose}
      styles={styles}
      colors={colors}
      title="Selecionar Paciente"
      items={patients}
      emptyTitle="Nenhum paciente com avaliações"
      emptyText="Salve ao menos uma avaliação para gerar relatórios."
      getKey={patient => patient.id}
      getTitle={patient => patient.nome}
      getSubtitle={patient => `${(patient.avaliacoes || []).length} avaliações salvas`}
      onSelect={onSelectPatient}
    />
  );
}
