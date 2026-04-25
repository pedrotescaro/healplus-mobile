import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export function makeReport(paciente, selectedEval) {
  if (!paciente || !paciente.avaliacoes?.length) return null;

  const avaliacoes = paciente.avaliacoes;
  const ultima = selectedEval || avaliacoes[0];
  const primeira = avaliacoes[avaliacoes.length - 1];
  const form = ultima.form || {};

  const tecidos = [
    `Granulacao: ${form.percentual_granulacao_leito || 0}%`,
    `Epitelizacao: ${form.percentual_epitelizacao_leito || 0}%`,
    `Esfacelo: ${form.percentual_esfacelo_leito || 0}%`,
    `Necrose seca: ${form.percentual_necrose_seca_leito || 0}%`,
  ];

  const infeccao = [
    form.infeccao_eritema_perilesional && 'Eritema perilesional',
    form.infeccao_calor_local && 'Calor local',
    form.infeccao_edema && 'Edema',
    form.infeccao_dor_local && 'Dor local',
    form.infeccao_exsudato && 'Exsudato purulento',
    form.infeccao_odor && 'Odor',
    form.infeccao_retardo_cicatrizacao && 'Retardo na cicatrizacao',
  ].filter(Boolean);

  const pele = [
    form.pele_perilesional_integra && 'Integra',
    form.pele_perilesional_eritematosa && 'Eritematosa',
    form.pele_perilesional_macerada && 'Macerada',
    form.pele_perilesional_seca_descamativa && 'Seca/descamativa',
    form.pele_perilesional_eczematosa && 'Eczematosa',
    form.pele_perilesional_hiperpigmentada && 'Hiperpigmentada',
    form.pele_perilesional_hipopigmentada && 'Hipopigmentada',
    form.pele_perilesional_indurada && 'Indurada',
    form.pele_perilesional_sensivel && 'Sensivel',
    form.pele_perilesional_edema && 'Edema',
  ].filter(Boolean);

  return {
    paciente,
    totalAvaliacoes: avaliacoes.length,
    ultimaData: ultima.data,
    primeiraData: primeira.data,
    localizacao: form.localizacao_ferida || ultima.regiao || '-',
    etiologia:
      form.etiologia_ferida === 'Outra'
        ? form.etiologia_outra || 'Outra'
        : form.etiologia_ferida || ultima.tipo || '-',
    dor: form.dor_escala || '0',
    exsudato:
      [form.quantidade_exsudato, form.tipo_exsudato, form.consistencia_exsudato]
        .filter(Boolean)
        .join(' • ') || 'Nao informado',
    tecido: tecidos.join(' | '),
    infeccao: infeccao.length
      ? infeccao.join(', ')
      : 'Sem sinais marcados na ultima avaliacao',
    bordas:
      [form.bordas_caracteristicas, form.fixacao_bordas].filter(Boolean).join(' • ') ||
      'Nao informado',
    regeneracao: form.velocidade_cicatrizacao || 'Nao informado',
    pele: pele.length ? pele.join(', ') : 'Nao informado',
    observacoes: form.observacoes || 'Sem observacoes registradas.',
    retorno: form.data_retorno || 'Nao informado',
    profissional: form.profissional_responsavel || 'Nao informado',
  };
}

export function buildClinicalReportHtml({
  reportInfo,
  includeTimers,
  includeNotes,
}) {
  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #333; }
          h1 { color: #3B82F6; text-align: center; font-size: 24px; margin-bottom: 24px; }
          .section { margin-top: 20px; border-bottom: 1px solid #E5E5EA; padding-bottom: 15px; }
          .title { font-weight: bold; font-size: 18px; color: #1C1C1E; margin-bottom: 12px; }
          .item { margin-bottom: 6px; font-size: 14px; line-height: 1.4; }
          .label { font-weight: bold; color: #6B6B70; }
          .footer { text-align: center; font-size: 10px; color: #A0A0A5; margin-top: 40px; }
        </style>
      </head>
      <body>
        <h1>Relatorio de Avaliacao Clinica - Heal+</h1>

        <div class="section">
          <div class="title">Identificacao</div>
          <div class="item"><span class="label">Paciente:</span> ${reportInfo.paciente.nome}</div>
          <div class="item"><span class="label">Data de Nascimento:</span> ${reportInfo.paciente.dataNasc || 'Nao informado'}</div>
          <div class="item"><span class="label">Avaliacao Referencia:</span> ${reportInfo.ultimaData}</div>
          <div class="item"><span class="label">Profissional:</span> ${reportInfo.profissional}</div>
        </div>

        <div class="section">
          <div class="title">Resumo Clinico da Lesao</div>
          <div class="item"><span class="label">Localizacao:</span> ${reportInfo.localizacao}</div>
          <div class="item"><span class="label">Etiologia:</span> ${reportInfo.etiologia}</div>
          <div class="item"><span class="label">Dor (0-10):</span> ${reportInfo.dor}</div>
          <div class="item"><span class="label">Exsudato:</span> ${reportInfo.exsudato}</div>
        </div>

        ${
          includeTimers
            ? `
          <div class="section">
            <div class="title">Metodologia TIMERS</div>
            <div class="item"><span class="label">T - Tecido:</span> ${reportInfo.tecido}</div>
            <div class="item"><span class="label">I - Infeccao/Infl:</span> ${reportInfo.infeccao}</div>
            <div class="item"><span class="label">M - Moisture:</span> Ver Exsudato</div>
            <div class="item"><span class="label">E - Edge (Bordas):</span> ${reportInfo.bordas}</div>
            <div class="item"><span class="label">R - Regeneracao:</span> ${reportInfo.regeneracao}</div>
            <div class="item"><span class="label">S - Social/Pele:</span> ${reportInfo.pele}</div>
          </div>`
            : ''
        }

        ${
          includeNotes
            ? `
          <div class="section">
            <div class="title">Notas e Observacoes</div>
            <div class="item">${reportInfo.observacoes}</div>
            <div class="item"><span class="label">Retorno Sugerido:</span> ${reportInfo.retorno}</div>
          </div>`
            : ''
        }

        <div class="footer">Gerado por Heal+ App • Confidencial</div>
      </body>
    </html>
  `;
}

export function buildComparisonReportHtml({
  comparePatient,
  compareEvalA,
  compareEvalB,
}) {
  const getVal = (ev, key) => (ev?.form?.[key] ? String(ev.form[key]) : '—');

  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #333; }
          h1 { color: #3B82F6; text-align: center; font-size: 24px; margin-bottom: 24px; }
          .section { margin-top: 20px; border-bottom: 1px solid #E5E5EA; padding-bottom: 15px; }
          .title { font-weight: bold; font-size: 18px; color: #1C1C1E; margin-bottom: 12px; }
          .item { margin-bottom: 6px; font-size: 14px; line-height: 1.4; }
          .label { font-weight: bold; color: #6B6B70; }
          .footer { text-align: center; font-size: 10px; color: #A0A0A5; margin-top: 40px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #E5E5EA; padding: 8px; text-align: left; }
          th { background-color: #F2F2F7; color: #1C1C1E; }
        </style>
      </head>
      <body>
        <h1>Relatorio Comparativo - Heal+</h1>

        <div class="section">
          <div class="title">Identificacao do Paciente</div>
          <div class="item"><span class="label">Nome:</span> ${comparePatient.nome}</div>
          <div class="item"><span class="label">Telefone:</span> ${comparePatient.telefone || 'Nao informado'}</div>
          <div class="item"><span class="label">Email:</span> ${comparePatient.email || 'Nao informado'}</div>
        </div>

        <div class="section">
          <div class="title">Comparativo Clinico TIMERS</div>
          <table>
            <thead>
              <tr>
                <th>Parametro</th>
                <th>Avaliacao A (${compareEvalA.data || '-'})</th>
                <th>Avaliacao B (${compareEvalB.data || '-'})</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>T - Granulacao</td>
                <td>${getVal(compareEvalA, 'percentual_granulacao_leito')}%</td>
                <td>${getVal(compareEvalB, 'percentual_granulacao_leito')}%</td>
              </tr>
              <tr>
                <td>T - Esfacelo</td>
                <td>${getVal(compareEvalA, 'percentual_esfacelo_leito')}%</td>
                <td>${getVal(compareEvalB, 'percentual_esfacelo_leito')}%</td>
              </tr>
              <tr>
                <td>T - Necrose Seca</td>
                <td>${getVal(compareEvalA, 'percentual_necrose_seca_leito')}%</td>
                <td>${getVal(compareEvalB, 'percentual_necrose_seca_leito')}%</td>
              </tr>
              <tr>
                <td>M - Umidade</td>
                <td>${getVal(compareEvalA, 'quantidade_exsudato')}</td>
                <td>${getVal(compareEvalB, 'quantidade_exsudato')}</td>
              </tr>
              <tr>
                <td>E - Bordas</td>
                <td>${getVal(compareEvalA, 'bordas_caracteristicas')}</td>
                <td>${getVal(compareEvalB, 'bordas_caracteristicas')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="footer">Gerado por Heal+ App • Confidencial</div>
      </body>
    </html>
  `;
}

export async function exportHtmlToPdf(html) {
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });
  const isSharingAvailable = await Sharing.isAvailableAsync();

  if (!isSharingAvailable) {
    throw new Error('O compartilhamento nao esta disponivel no seu dispositivo.');
  }

  await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
}
