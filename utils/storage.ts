
/**
 * Utilitário para persistência de dados no LocalStorage
 */

const STORAGE_KEY = 'certificamaster_data';
const STORAGE_VERSION = '1.0';

export interface StorageData {
    version: string;
    timestamp: number;
    certificateData: any;
}

/**
 * Salva dados do certificado no LocalStorage
 */
export const saveCertificateData = (data: any): boolean => {
    try {
        const storageData: StorageData = {
            version: STORAGE_VERSION,
            timestamp: Date.now(),
            certificateData: data
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
        return true;
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        return false;
    }
};

/**
 * Carrega dados do certificado do LocalStorage
 */
export const loadCertificateData = (): any | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        const storageData: StorageData = JSON.parse(stored);

        // Verificar versão (para futuras migrações)
        if (storageData.version !== STORAGE_VERSION) {
            console.warn('Versão de dados incompatível');
            return null;
        }

        return storageData.certificateData;
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        return null;
    }
};

/**
 * Limpa dados salvos do LocalStorage
 */
export const clearCertificateData = (): boolean => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Erro ao limpar dados:', error);
        return false;
    }
};

/**
 * Verifica se existem dados salvos
 */
export const hasSavedData = (): boolean => {
    try {
        return localStorage.getItem(STORAGE_KEY) !== null;
    } catch (error) {
        return false;
    }
};

/**
 * Obtém informações sobre os dados salvos
 */
export const getSavedDataInfo = (): { timestamp: number; version: string } | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        const storageData: StorageData = JSON.parse(stored);
        return {
            timestamp: storageData.timestamp,
            version: storageData.version
        };
    } catch (error) {
        return null;
    }
};
