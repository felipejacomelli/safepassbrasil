/**
 * Extrai a sigla do estado (UF) de um venue_id que pode conter diferentes formatos
 * @param venueId - O ID do local que pode ser "Cidade - UF" ou apenas um ID
 * @returns A sigla do estado ou string vazia se não encontrada
 */
export function extractUFFromVenueId(venueId: string | null | undefined): string {
  if (!venueId) return '';
  
  // Verifica se o venue_id contém o padrão "Cidade - UF"
  const match = venueId.match(/\s-\s([A-Z]{2})$/);
  
  if (match) {
    return match[1]; // Retorna apenas a UF (ex: "SP", "RJ", "MG")
  }
  
  // Se não encontrar o padrão, retorna string vazia
  return '';
}

/**
 * Formata o local para exibição nos cards
 * Prioriza a UF extraída do venue_id, senão usa venue_name
 * @param venueId - O ID do local
 * @param venueName - O nome do local
 * @returns String formatada para exibição
 */
export function formatLocationForCard(
  venueId: string | null | undefined, 
  venueName: string | null | undefined
): string {
  const uf = extractUFFromVenueId(venueId);
  
  if (uf) {
    return uf;
  }
  
  // Fallback para venue_name se não conseguir extrair UF
  return venueName || "Local a definir";
}

/**
 * Formata múltiplas UFs para exibição nos cards
 * Extrai todas as UFs únicas das ocorrências de um evento
 * @param occurrences - Array de ocorrências do evento
 * @returns String formatada com UFs separadas por vírgula
 */
export function formatMultipleUFsForCard(occurrences: any[]): string {
  if (!occurrences || occurrences.length === 0) {
    return "Local a definir";
  }
  
  // Extrair UFs únicas de todas as ocorrências
  const ufs = new Set<string>();
  
  occurrences.forEach(occurrence => {
    const uf = extractUFFromVenueId(occurrence?.venue_id?.toString());
    if (uf) {
      ufs.add(uf);
    }
  });
  
  // Converter para array e ordenar
  const sortedUFs = Array.from(ufs).sort();
  
  if (sortedUFs.length === 0) {
    // Fallback para venue_name da primeira ocorrência
    return occurrences[0]?.venue_name || "Local a definir";
  }
  
  // Retornar UFs separadas por vírgula
  return sortedUFs.join(", ");
}