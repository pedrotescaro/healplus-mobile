import React from 'react';

import SelectionListModal from './SelectionListModal';

export default function ReportEvaluationSelectionModal({
  visible,
  onClose,
  styles,
  colors,
  evaluations,
  hasPatient,
  getEvaluationLabel,
  onSelectEvaluation,
}) {
  return (
    <SelectionListModal
      visible={visible}
      onClose={onClose}
      styles={styles}
      colors={colors}
      title="Selecionar Avaliação"
      items={hasPatient ? evaluations : []}
      emptyTitle="Nenhuma avaliação encontrada"
      emptyText="Escolha primeiro um paciente com avaliações salvas."
      getKey={evaluation => evaluation.id}
      getTitle={evaluation => getEvaluationLabel(evaluation)}
      onSelect={onSelectEvaluation}
    />
  );
}
