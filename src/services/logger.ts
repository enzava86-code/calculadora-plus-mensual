/**
 * Servicio de logging para capturar y exportar logs de cálculos
 */
class LoggerService {
  private logs: string[] = [];
  private originalConsoleLog: typeof console.log;

  constructor() {
    this.originalConsoleLog = console.log;
  }

  /**
   * Inicia la captura de logs
   */
  startCapture(label: string = 'Cálculo') {
    this.logs = [];
    this.logs.push(`=== INICIO DE LOGS: ${label} - ${new Date().toLocaleString()} ===\n`);
    
    // Interceptar console.log
    console.log = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      this.logs.push(message);
      this.originalConsoleLog(...args); // Mantener funcionalidad original
    };
  }

  /**
   * Detiene la captura de logs
   */
  stopCapture() {
    this.logs.push(`\n=== FIN DE LOGS - ${new Date().toLocaleString()} ===`);
    console.log = this.originalConsoleLog; // Restaurar console.log original
  }

  /**
   * Obtiene todos los logs capturados
   */
  getLogs(): string {
    return this.logs.join('\n');
  }

  /**
   * Copia los logs al portapapeles
   */
  async copyLogsToClipboard(): Promise<boolean> {
    try {
      const logsText = this.getLogs();
      await navigator.clipboard.writeText(logsText);
      return true;
    } catch (error) {
      console.error('Error copiando logs al portapapeles:', error);
      
      // Fallback: crear un textarea temporal
      try {
        const textarea = document.createElement('textarea');
        textarea.value = this.getLogs();
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
      } catch (fallbackError) {
        console.error('Error en fallback de copia:', fallbackError);
        return false;
      }
    }
  }

  /**
   * Descarga los logs como archivo de texto
   */
  downloadLogs(filename: string = 'logs-calculo') {
    const logsText = this.getLogs();
    const blob = new Blob([logsText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Limpia los logs actuales
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Obtiene estadísticas de los logs
   */
  getStats() {
    const logsText = this.getLogs();
    return {
      totalLines: this.logs.length,
      totalCharacters: logsText.length,
      hasErrors: logsText.includes('ERROR') || logsText.includes('🚨'),
      hasCritical: logsText.includes('CRÍTICO') || logsText.includes('CRITICAL'),
      hasWarnings: logsText.includes('⚠️') || logsText.includes('WARNING')
    };
  }
}

// Singleton instance
export const logger = new LoggerService();

// Tipos para componentes
export interface LoggingButtonProps {
  onCopyLogs?: () => void;
  onDownloadLogs?: () => void;
  disabled?: boolean;
  calculationType?: 'individual' | 'masivo';
}