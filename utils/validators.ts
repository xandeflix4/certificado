
/**
 * Validadores para campos do sistema de certificados
 */

/**
 * Valida CPF (formato: 000.000.000-00 ou 00000000000)
 */
export const isValidCPF = (cpf: string): boolean => {
    if (!cpf) return false;

    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');

    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) return false;

    // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    // Validação dos dígitos verificadores
    let sum = 0;
    let remainder;

    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

    // Segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

    return true;
};

/**
 * Valida CNPJ (formato: 00.000.000/0000-00 ou 00000000000000)
 */
export const isValidCNPJ = (cnpj: string): boolean => {
    if (!cnpj) return false;

    // Remove caracteres não numéricos
    const cleanCNPJ = cnpj.replace(/\D/g, '');

    // Verifica se tem 14 dígitos
    if (cleanCNPJ.length !== 14) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

    // Validação dos dígitos verificadores
    let length = cleanCNPJ.length - 2;
    let numbers = cleanCNPJ.substring(0, length);
    const digits = cleanCNPJ.substring(length);
    let sum = 0;
    let pos = length - 7;

    // Primeiro dígito verificador
    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    // Segundo dígito verificador
    length = length + 1;
    numbers = cleanCNPJ.substring(0, length);
    sum = 0;
    pos = length - 7;
    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
};

/**
 * Valida campos obrigatórios para gerar certificado
 */
export interface ValidationError {
    field: string;
    message: string;
}

export const validateCertificateData = (data: {
    students: any[];
    courseName: string;
    companyName: string;
    instructors: any[];
    baseText: string;
}): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!data.students || data.students.length === 0) {
        errors.push({ field: 'students', message: 'Adicione pelo menos um aluno' });
    }

    if (!data.courseName || data.courseName.trim() === '') {
        errors.push({ field: 'courseName', message: 'Nome do curso é obrigatório' });
    }

    if (!data.companyName || data.companyName.trim() === '') {
        errors.push({ field: 'companyName', message: 'Razão Social da empresa é obrigatória' });
    }

    if (!data.instructors || data.instructors.length === 0) {
        errors.push({ field: 'instructors', message: 'Adicione pelo menos um instrutor' });
    }

    if (!data.baseText || data.baseText.trim() === '') {
        errors.push({ field: 'baseText', message: 'Texto do certificado é obrigatório' });
    }

    return errors;
};

/**
 * Formata mensagens de erro para exibição
 */
export const formatValidationErrors = (errors: ValidationError[]): string => {
    if (errors.length === 0) return '';

    return '⚠️ Campos obrigatórios faltando:\n\n' +
        errors.map(err => `• ${err.message}`).join('\n');
};
