/**
 * Formata um CPF para exibição no formato 000.000.000-00
 * @param cpf - CPF em formato string (com ou sem formatação)
 * @returns CPF formatado ou string vazia se inválido
 */
export function formatCpf(cpf: string | undefined | null): string {
  if (!cpf) return "";
  
  // Remove todos os caracteres não numéricos
  const digitsOnly = cpf.replace(/\D/g, "");
  
  // Verifica se tem 11 dígitos
  if (digitsOnly.length !== 11) return cpf; // Retorna original se não tiver 11 dígitos
  
  // Formata como 000.000.000-00
  return `${digitsOnly.substring(0, 3)}.${digitsOnly.substring(3, 6)}.${digitsOnly.substring(6, 9)}-${digitsOnly.substring(9)}`;
}

/**
 * Remove formatação do CPF, mantendo apenas os dígitos
 * @param cpf - CPF formatado
 * @returns CPF apenas com dígitos
 */
export function unformatCpf(cpf: string): string {
  return cpf.replace(/\D/g, "");
}