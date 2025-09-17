/**
 * Utilitários para manipulação e validação de CPF
 * Consolidação das funções de formatação e validação
 */

/**
 * Remove formatação do CPF, mantendo apenas dígitos
 * @param cpf - CPF com ou sem formatação
 * @returns CPF apenas com dígitos
 */
export function normalizeCpf(cpf: string): string {
  if (!cpf) return cpf;
  return cpf.replace(/\D/g, '');
}

/**
 * Remove formatação do CPF, mantendo apenas os dígitos
 * Alias para normalizeCpf para manter compatibilidade
 * @param cpf - CPF formatado
 * @returns CPF apenas com dígitos
 */
export function unformatCpf(cpf: string): string {
  return normalizeCpf(cpf);
}

/**
 * Formata um CPF para exibição no formato 000.000.000-00
 * @param cpf - CPF em formato string (com ou sem formatação)
 * @returns CPF formatado ou string vazia se inválido
 */
export function formatCpf(cpf: string | undefined | null): string {
  if (!cpf) return "";
  
  // Remove todos os caracteres não numéricos
  const digitsOnly = normalizeCpf(cpf);
  
  // Verifica se tem 11 dígitos
  if (digitsOnly.length !== 11) return cpf; // Retorna original se não tiver 11 dígitos
  
  // Formata como 000.000.000-00
  return `${digitsOnly.substring(0, 3)}.${digitsOnly.substring(3, 6)}.${digitsOnly.substring(6, 9)}-${digitsOnly.substring(9)}`;
}

/**
 * Valida CPF usando o algoritmo oficial
 * @param cpf - CPF com ou sem formatação
 * @returns true se CPF é válido, false caso contrário
 */
export function validateCpfAlgorithm(cpf: string): boolean {
  // Normaliza o CPF
  const cpfClean = normalizeCpf(cpf);
  
  // Verifica se tem 11 dígitos
  if (cpfClean.length !== 11) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (cpfClean === cpfClean[0].repeat(11)) {
    return false;
  }
  
  // Função para calcular dígito verificador
  const calcularDigito = (cpfParcial: string, pesoInicial: number): string => {
    const soma = cpfParcial
      .split('')
      .reduce((acc, digit, index) => acc + parseInt(digit) * (pesoInicial - index), 0);
    const resto = soma % 11;
    return resto < 2 ? '0' : (11 - resto).toString();
  };
  
  // Valida primeiro dígito verificador
  if (cpfClean[9] !== calcularDigito(cpfClean.substring(0, 9), 10)) {
    return false;
  }
  
  // Valida segundo dígito verificador
  if (cpfClean[10] !== calcularDigito(cpfClean.substring(0, 10), 11)) {
    return false;
  }
  
  return true;
}

/**
 * Verifica se CPF é válido (alias para validateCpfAlgorithm)
 * @param cpf - CPF com ou sem formatação
 * @returns true se CPF é válido, false caso contrário
 */
export function isValidCpf(cpf: string): boolean {
  return validateCpfAlgorithm(cpf);
}

/**
 * Valida CPF e retorna mensagem de erro específica
 * @param cpf - CPF com ou sem formatação
 * @returns objeto com status de validação e mensagem de erro
 */
export function validateCpfWithMessage(cpf: string): { isValid: boolean; message: string } {
  if (!cpf || !cpf.trim()) {
    return { isValid: false, message: "CPF é obrigatório" };
  }
  
  const cpfClean = normalizeCpf(cpf);
  
  if (cpfClean.length === 0) {
    return { isValid: false, message: "CPF é obrigatório" };
  }
  
  if (cpfClean.length < 11) {
    return { isValid: false, message: "CPF deve ter 11 dígitos" };
  }
  
  if (cpfClean.length > 11) {
    return { isValid: false, message: "CPF deve ter apenas 11 dígitos" };
  }
  
  if (!validateCpfAlgorithm(cpf)) {
    return { isValid: false, message: "CPF inválido" };
  }
  
  return { isValid: true, message: "" };
}