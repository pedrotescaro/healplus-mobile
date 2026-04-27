import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const ROI_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

const escapeHtml = value =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const normalizeRoiPoints = points =>
  Array.isArray(points)
    ? points
        .map(point => ({
          x: Math.min(Math.max(Number(point?.x) || 0, 0), 1),
          y: Math.min(Math.max(Number(point?.y) || 0, 0), 1),
        }))
        .filter(point => Number.isFinite(point.x) && Number.isFinite(point.y))
    : [];

const normalizeRois = rois =>
  Array.isArray(rois)
    ? rois
        .map((roi, index) => ({
          id: roi?.id || `roi-${index + 1}`,
          label: roi?.label || `ROI ${index + 1}`,
          mode: roi?.mode === 'pen' ? 'pen' : 'points',
          color: roi?.color || ROI_COLORS[index % ROI_COLORS.length],
          points: normalizeRoiPoints(roi?.points),
        }))
        .filter(roi => roi.points.length > 0)
    : [];

const getEvaluationImageUri = evaluation =>
  evaluation?.imageUri ||
  evaluation?.imagemOriginalUri ||
  evaluation?.woundImageUri ||
  evaluation?.form?.imageUri ||
  evaluation?.form?.imagemOriginalUri ||
  evaluation?.form?.woundImageUri ||
  '';

const getEvaluationImageBase64 = evaluation =>
  evaluation?.imageBase64 || evaluation?.form?.imageBase64 || '';

const getEvaluationImageMimeType = evaluation =>
  evaluation?.imageMimeType || evaluation?.form?.imageMimeType || getReportImageMimeType(getEvaluationImageUri(evaluation));

const getEvaluationRoiPoints = evaluation =>
  normalizeRoiPoints(evaluation?.roiPoints || evaluation?.form?.roiPoints);

const getEvaluationRois = evaluation => {
  const rois = normalizeRois(evaluation?.rois || evaluation?.form?.rois);
  if (rois.length) return rois;

  const legacyPoints = getEvaluationRoiPoints(evaluation);
  return legacyPoints.length
    ? normalizeRois([
        {
          id: 'roi-legacy',
          label: 'ROI 1',
          mode: 'points',
          color: ROI_COLORS[0],
          points: legacyPoints,
        },
      ])
    : [];
};

const getReportImageMimeType = uri => {
  const lowerUri = String(uri || '').toLowerCase();
  if (lowerUri.includes('.png')) return 'image/png';
  if (lowerUri.includes('.webp')) return 'image/webp';
  return 'image/jpeg';
};

const base64ToReportSrc = (base64, mimeType = 'image/jpeg') => {
  if (!base64) return '';
  if (/^data:/i.test(base64)) return base64;
  return `data:${mimeType || 'image/jpeg'};base64,${base64}`;
};

const imageUriToReportSrc = async ({ uri, base64, mimeType }) => {
  const base64Src = base64ToReportSrc(base64, mimeType);
  if (base64Src) return base64Src;

  if (!uri) return '';
  if (/^data:/i.test(uri)) return uri;
  if (/^https?:/i.test(uri)) return uri;

  try {
    const localBase64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:${mimeType || getReportImageMimeType(uri)};base64,${localBase64}`;
  } catch (error) {
    console.warn('[report] Não foi possível converter imagem local para o PDF', error);
    return '';
  }
};

const roiToSvgPoints = points =>
  normalizeRoiPoints(points)
    .map(point => `${Math.round(point.x * 1000)},${Math.round(point.y * 1000)}`)
    .join(' ');

const roisToHtmlSvg = rois => {
  const normalizedRois = normalizeRois(rois).filter(roi => roi.points.length >= 2);
  if (!normalizedRois.length) return '';

  return `
    <svg class="roi-svg" viewBox="0 0 1000 1000" preserveAspectRatio="none">
      ${normalizedRois
        .map(roi => {
          const svgPoints = roiToSvgPoints(roi.points);
          const strokeWidth = roi.mode === 'pen' ? 6 : 8;
          const circleRadius = roi.mode === 'pen' ? 0 : 8;

          return `
            ${
              roi.points.length >= 3
                ? `<polygon points="${svgPoints}" fill="rgba(59, 130, 246, 0.12)" stroke="${roi.color}" stroke-width="${strokeWidth}"></polygon>`
                : ''
            }
            <polyline points="${svgPoints}" fill="none" stroke="${roi.color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"></polyline>
            ${
              circleRadius
                ? roi.points
                    .map(point => `<circle cx="${Math.round(point.x * 1000)}" cy="${Math.round(point.y * 1000)}" r="${circleRadius}" fill="#FFFFFF" stroke="${roi.color}" stroke-width="4"></circle>`)
                    .join('')
                : ''
            }
          `;
        })
        .join('')}
    </svg>
  `;
};

const buildRoiListHtml = rois => {
  const validRois = normalizeRois(rois).filter(roi => roi.points.length >= 3);
  if (!validRois.length) return '';

  return `
    <div class="roi-list">
      ${validRois
        .map(
          roi =>
            `<span class="roi-pill"><span class="roi-dot" style="background:${roi.color}"></span>${escapeHtml(roi.label)} • ${roi.mode === 'pen' ? 'Caneta fina' : 'Pontos'}</span>`,
        )
        .join('')}
    </div>
  `;
};

const buildImageCardsHtml = async ({ title, imageUri, imageBase64, imageMimeType, rois, roiPoints }) => {
  const normalizedRois = normalizeRois(rois).length
    ? normalizeRois(rois)
    : normalizeRois([{ id: 'roi-legacy', label: 'ROI 1', mode: 'points', color: ROI_COLORS[0], points: roiPoints }]);
  const validRois = normalizedRois.filter(roi => roi.points.length >= 3);
  const imageSrc = await imageUriToReportSrc({
    uri: imageUri,
    base64: imageBase64,
    mimeType: imageMimeType,
  });

  if (!imageSrc) {
    return `
      <div class="section">
        <div class="title">${title}</div>
        <div class="photo-grid">
          <div class="photo-card photo-card-wide">
            <div class="photo-label">Registro fotográfico</div>
            <div class="photo-frame photo-empty">Imagem não registrada</div>
          </div>
        </div>
      </div>
    `;
  }

  const roiSvg = validRois.length ? roisToHtmlSvg(validRois) : '';

  return `
    <div class="section">
      <div class="title">${title}</div>
      <div class="photo-grid">
        <div class="photo-card">
          <div class="photo-label">Imagem original</div>
          <div class="photo-frame">
            <img src="${imageSrc}" alt="Imagem original da ferida" />
          </div>
        </div>
        <div class="photo-card">
          <div class="photo-label">Imagem com ROI</div>
          <div class="photo-frame">
            <img src="${imageSrc}" alt="Imagem da ferida com ROI" />
            ${roiSvg}
            ${validRois.length ? '' : '<div class="photo-note">Sem ROI marcada</div>'}
          </div>
        </div>
      </div>
      ${buildRoiListHtml(validRois)}
    </div>
  `;
};

export function makeReport(paciente, selectedEval) {
  if (!paciente || !paciente.avaliacoes?.length) return null;

  const avaliacoes = paciente.avaliacoes;
  const ultima = selectedEval || avaliacoes[0];
  const primeira = avaliacoes[avaliacoes.length - 1];
  const form = ultima.form || {};

  const tecidos = [
    `Granulação: ${form.percentual_granulacao_leito || 0}%`,
    `Epitelização: ${form.percentual_epitelizacao_leito || 0}%`,
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
    form.infeccao_retardo_cicatrizacao && 'Retardo na cicatrização',
  ].filter(Boolean);

  const pele = [
    form.pele_perilesional_integra && 'Íntegra',
    form.pele_perilesional_eritematosa && 'Eritematosa',
    form.pele_perilesional_macerada && 'Macerada',
    form.pele_perilesional_seca_descamativa && 'Seca/descamativa',
    form.pele_perilesional_eczematosa && 'Eczematosa',
    form.pele_perilesional_hiperpigmentada && 'Hiperpigmentada',
    form.pele_perilesional_hipopigmentada && 'Hipopigmentada',
    form.pele_perilesional_indurada && 'Indurada',
    form.pele_perilesional_sensivel && 'Sensível',
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
        .join(' • ') || 'Não informado',
    tecido: tecidos.join(' | '),
    infeccao: infeccao.length
      ? infeccao.join(', ')
      : 'Sem sinais marcados na última avaliação',
    bordas:
      [form.bordas_caracteristicas, form.fixacao_bordas].filter(Boolean).join(' • ') ||
      'Não informado',
    regeneracao: form.velocidade_cicatrizacao || 'Não informado',
    pele: pele.length ? pele.join(', ') : 'Não informado',
    observacoes: form.observacoes || 'Sem observações registradas.',
    retorno: form.data_retorno || 'Não informado',
    profissional: form.profissional_responsavel || 'Não informado',
    imagemOriginalUri: getEvaluationImageUri(ultima),
    imageUri: getEvaluationImageUri(ultima),
    imageBase64: getEvaluationImageBase64(ultima),
    imageMimeType: getEvaluationImageMimeType(ultima),
    rois: getEvaluationRois(ultima),
    roiPoints: getEvaluationRoiPoints(ultima),
  };
}

export async function buildClinicalReportHtml({
  reportInfo,
  includeTimers,
  includePhotos = true,
  includeNotes,
}) {
  const imageSection = includePhotos
    ? await buildImageCardsHtml({
        title: 'Registro Fotográfico da Ferida',
        imageUri: reportInfo.imageUri || reportInfo.imagemOriginalUri,
        imageBase64: reportInfo.imageBase64,
        imageMimeType: reportInfo.imageMimeType,
        rois: reportInfo.rois,
        roiPoints: reportInfo.roiPoints,
      })
    : '';

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
          .photo-grid { display: flex; gap: 12px; flex-wrap: wrap; }
          .photo-card { width: 48%; min-width: 240px; }
          .photo-label { font-weight: bold; font-size: 13px; color: #6B6B70; margin-bottom: 8px; }
          .photo-frame { height: 240px; border: 1px solid #E5E5EA; border-radius: 12px; overflow: hidden; position: relative; background: #F2F2F7; }
          .photo-frame img { width: 100%; height: 100%; object-fit: contain; display: block; }
          .photo-card-wide { width: 100%; }
          .photo-empty { display: flex; align-items: center; justify-content: center; color: #6B6B70; font-weight: bold; }
          .photo-note { position: absolute; left: 10px; bottom: 10px; padding: 5px 8px; border-radius: 999px; background: rgba(28, 28, 30, 0.72); color: #FFF; font-size: 11px; font-weight: bold; }
          .roi-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
          .roi-list { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
          .roi-pill { display: inline-flex; align-items: center; gap: 5px; padding: 5px 8px; border-radius: 999px; background: #F2F2F7; color: #3A3A3C; font-size: 11px; font-weight: bold; }
          .roi-dot { width: 8px; height: 8px; border-radius: 4px; display: inline-block; }
        </style>
      </head>
      <body>
        <h1>Relatório de Avaliação Clínica - Heal+</h1>

        <div class="section">
          <div class="title">Identificação</div>
          <div class="item"><span class="label">Paciente:</span> ${reportInfo.paciente.nome}</div>
          <div class="item"><span class="label">Data de Nascimento:</span> ${reportInfo.paciente.dataNasc || 'Não informado'}</div>
          <div class="item"><span class="label">Avaliação Referência:</span> ${reportInfo.ultimaData}</div>
          <div class="item"><span class="label">Profissional:</span> ${reportInfo.profissional}</div>
        </div>

        <div class="section">
          <div class="title">Resumo Clínico da Lesão</div>
          <div class="item"><span class="label">Localização:</span> ${reportInfo.localizacao}</div>
          <div class="item"><span class="label">Etiologia:</span> ${reportInfo.etiologia}</div>
          <div class="item"><span class="label">Dor (0-10):</span> ${reportInfo.dor}</div>
          <div class="item"><span class="label">Exsudato:</span> ${reportInfo.exsudato}</div>
        </div>

        ${imageSection}

        ${
          includeTimers
            ? `
          <div class="section">
            <div class="title">Metodologia TIMERS</div>
            <div class="item"><span class="label">T - Tecido:</span> ${reportInfo.tecido}</div>
            <div class="item"><span class="label">I - Infecção/Infl.:</span> ${reportInfo.infeccao}</div>
            <div class="item"><span class="label">M - Moisture:</span> Ver Exsudato</div>
            <div class="item"><span class="label">E - Edge (Bordas):</span> ${reportInfo.bordas}</div>
            <div class="item"><span class="label">R - Regeneração:</span> ${reportInfo.regeneracao}</div>
            <div class="item"><span class="label">S - Social/Pele:</span> ${reportInfo.pele}</div>
          </div>`
            : ''
        }

        ${
          includeNotes
            ? `
          <div class="section">
            <div class="title">Notas e Observações</div>
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

export async function buildComparisonReportHtml({
  comparePatient,
  compareEvalA,
  compareEvalB,
}) {
  const getVal = (ev, key) => (ev?.form?.[key] ? String(ev.form[key]) : '—');
  const comparisonImageSection = await buildImageCardsHtml({
    title: 'Comparativo Visual',
    imageUri: getEvaluationImageUri(compareEvalA),
    imageBase64: getEvaluationImageBase64(compareEvalA),
    imageMimeType: getEvaluationImageMimeType(compareEvalA),
    rois: getEvaluationRois(compareEvalA),
    roiPoints: getEvaluationRoiPoints(compareEvalA),
  });
  const recentImageSection = await buildImageCardsHtml({
    title: 'Imagem Mais Recente',
    imageUri: getEvaluationImageUri(compareEvalB),
    imageBase64: getEvaluationImageBase64(compareEvalB),
    imageMimeType: getEvaluationImageMimeType(compareEvalB),
    rois: getEvaluationRois(compareEvalB),
    roiPoints: getEvaluationRoiPoints(compareEvalB),
  });

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
          .photo-grid { display: flex; gap: 12px; flex-wrap: wrap; }
          .photo-card { width: 48%; min-width: 240px; }
          .photo-label { font-weight: bold; font-size: 13px; color: #6B6B70; margin-bottom: 8px; }
          .photo-frame { height: 220px; border: 1px solid #E5E5EA; border-radius: 12px; overflow: hidden; position: relative; background: #F2F2F7; }
          .photo-frame img { width: 100%; height: 100%; object-fit: contain; display: block; }
          .photo-card-wide { width: 100%; }
          .photo-empty { display: flex; align-items: center; justify-content: center; color: #6B6B70; font-weight: bold; }
          .photo-note { position: absolute; left: 10px; bottom: 10px; padding: 5px 8px; border-radius: 999px; background: rgba(28, 28, 30, 0.72); color: #FFF; font-size: 11px; font-weight: bold; }
          .roi-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
          .roi-list { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
          .roi-pill { display: inline-flex; align-items: center; gap: 5px; padding: 5px 8px; border-radius: 999px; background: #F2F2F7; color: #3A3A3C; font-size: 11px; font-weight: bold; }
          .roi-dot { width: 8px; height: 8px; border-radius: 4px; display: inline-block; }
        </style>
      </head>
      <body>
        <h1>Relatório Comparativo - Heal+</h1>

        <div class="section">
          <div class="title">Identificação do Paciente</div>
          <div class="item"><span class="label">Nome:</span> ${comparePatient.nome}</div>
          <div class="item"><span class="label">Telefone:</span> ${comparePatient.telefone || 'Não informado'}</div>
          <div class="item"><span class="label">E-mail:</span> ${comparePatient.email || 'Não informado'}</div>
        </div>

        ${comparisonImageSection}
        ${recentImageSection}

        <div class="section">
          <div class="title">Comparativo Clínico TIMERS</div>
          <table>
            <thead>
              <tr>
                <th>Parâmetro</th>
                <th>Avaliação A (${compareEvalA.data || '-'})</th>
                <th>Avaliação B (${compareEvalB.data || '-'})</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>T - Granulação</td>
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
    throw new Error('O compartilhamento não está disponível no seu dispositivo.');
  }

  await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
}
