import React, { useState } from 'react';
import { logger, LoggingButtonProps } from '../../services/logger';

export const LoggingButtons: React.FC<LoggingButtonProps> = ({
  onCopyLogs,
  onDownloadLogs,
  disabled = false,
  calculationType = 'individual'
}) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success' | 'error'>('idle');

  const handleCopyLogs = async () => {
    setCopyStatus('copying');
    
    try {
      const success = await logger.copyLogsToClipboard();
      if (success) {
        setCopyStatus('success');
        onCopyLogs?.();
        
        // Reset status after 2 seconds
        setTimeout(() => setCopyStatus('idle'), 2000);
      } else {
        setCopyStatus('error');
        setTimeout(() => setCopyStatus('idle'), 2000);
      }
    } catch (error) {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const handleDownloadLogs = () => {
    const filename = `logs-${calculationType}-calculo`;
    logger.downloadLogs(filename);
    onDownloadLogs?.();
  };

  const stats = logger.getStats();

  const getCopyButtonText = () => {
    switch (copyStatus) {
      case 'copying': return '📋 Copiando...';
      case 'success': return '✅ ¡Copiado!';
      case 'error': return '❌ Error';
      default: return '📋 Copiar Logs';
    }
  };

  const getCopyButtonClass = () => {
    const baseClass = "px-4 py-2 rounded-lg font-medium transition-all duration-200 ";
    switch (copyStatus) {
      case 'copying':
        return baseClass + "bg-blue-100 text-blue-700 cursor-wait";
      case 'success':
        return baseClass + "bg-green-100 text-green-700";
      case 'error':
        return baseClass + "bg-red-100 text-red-700";
      default:
        return baseClass + (disabled 
          ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
          : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
        );
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg border">
      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        🔍 Debug - Logs del Cálculo {calculationType === 'masivo' ? 'Masivo' : 'Individual'}
      </h3>
      
      {/* Estadísticas de logs */}
      {stats.totalLines > 0 && (
        <div className="text-xs text-gray-600 bg-white p-2 rounded border">
          <div className="flex flex-wrap gap-4">
            <span>📝 {stats.totalLines} líneas</span>
            <span>📊 {(stats.totalCharacters / 1024).toFixed(1)}KB</span>
            {stats.hasErrors && <span className="text-red-600">🚨 Errores detectados</span>}
            {stats.hasCritical && <span className="text-orange-600">⚠️ Situaciones críticas</span>}
            {stats.hasWarnings && <span className="text-yellow-600">⚠️ Advertencias</span>}
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-2">
        <button
          onClick={handleCopyLogs}
          disabled={disabled || copyStatus === 'copying'}
          className={getCopyButtonClass()}
          title="Copia todos los logs del cálculo al portapapeles"
        >
          {getCopyButtonText()}
        </button>

        <button
          onClick={handleDownloadLogs}
          disabled={disabled}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            disabled 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
          }`}
          title="Descarga los logs como archivo de texto"
        >
          💾 Descargar
        </button>

        <button
          onClick={() => logger.clearLogs()}
          disabled={disabled}
          className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
            disabled 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-gray-500 text-white hover:bg-gray-600 cursor-pointer'
          }`}
          title="Limpia los logs actuales"
        >
          🗑️
        </button>
      </div>

      {/* Mensaje explicativo */}
      <p className="text-xs text-gray-500">
        Los logs contienen información detallada del proceso de cálculo, 
        incluyendo cada iteración del algoritmo de alternancia.
        {stats.totalLines === 0 && " (Ejecuta un cálculo para ver los logs)"}
      </p>
    </div>
  );
};

export default LoggingButtons;