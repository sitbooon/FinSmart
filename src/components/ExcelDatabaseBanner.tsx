import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  RefreshCw,
  FolderSync,
  HardDrive,
  Database,
  ExternalLink,
} from 'lucide-react';
import { ExcelDatabaseData, exportExcelDatabase } from '../utils/excelDatabaseEngine';

interface ExcelDatabaseBannerProps {
  appData: ExcelDatabaseData;
  transactionsCount: number;
  lastSyncedAt?: Date | null;
  isSyncing?: boolean;
  excelSaveStatus?: 'saved' | 'saving' | 'error';
  localFileName?: string | null;
  serverFileName?: string | null;
  onOpenExcelModal: () => void;
  onConnectLocalFile?: () => Promise<void>;
  onManualSync?: () => Promise<void>;
}

export const ExcelDatabaseBanner: React.FC<ExcelDatabaseBannerProps> = ({
  appData,
  transactionsCount,
  lastSyncedAt,
  isSyncing = false,
  excelSaveStatus = 'saved',
  localFileName = null,
  serverFileName = 'finos_database.xlsx',
  onOpenExcelModal,
  onConnectLocalFile,
  onManualSync,
}) => {
  const [downloading, setDownloading] = useState(false);

  const handleQuickDownload = () => {
    try {
      setDownloading(true);
      // Download directly from server endpoint so it is the exact file on the server
      window.location.href = '/api/database/download';
      setTimeout(() => setDownloading(false), 2000);
    } catch (err) {
      console.error('Quick download error:', err);
      setDownloading(false);
    }
  };

  return (
    <div
      id="excel-database-active-bar"
      className="w-full bg-gradient-to-r from-emerald-900/10 via-emerald-800/5 to-teal-900/10 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/40 border-b border-emerald-200/80 dark:border-emerald-800/40 px-3 py-2 text-xs transition-colors"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Left/Start side: Database status */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/60 rounded-lg text-emerald-800 dark:text-emerald-200 font-bold text-xs shadow-2xs border border-emerald-300 dark:border-emerald-700">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>קובץ אקסל בשרת</span>
          </div>

          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-xs">
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-spin' : 'bg-emerald-500 animate-pulse'}`} />
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                {isSyncing ? 'מסנכרן מהשרת...' : 'פעיל ומסונכרן (data/finos_database.xlsx)'}
              </span>
            </span>

            <span className="text-gray-400 dark:text-gray-600">|</span>

            <span className="font-medium text-gray-600 dark:text-gray-300">
              <strong className="font-bold text-gray-900 dark:text-white">{transactionsCount}</strong> תנועות רשומות
            </span>

            {localFileName ? (
              <>
                <span className="text-gray-400 dark:text-gray-600 hidden sm:inline">|</span>
                <span className="hidden sm:flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-medium">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>קובץ מקושר: {localFileName}</span>
                </span>
              </>
            ) : null}

            {lastSyncedAt && (
              <>
                <span className="text-gray-400 dark:text-gray-600 hidden md:inline">|</span>
                <span className="hidden md:inline text-gray-500 dark:text-gray-400">
                  סונכרן לאחרונה: {lastSyncedAt.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right/End side: Quick Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onManualSync && (
            <button
              id="excel-refresh-server-btn"
              onClick={() => onManualSync()}
              disabled={isSyncing}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 font-medium text-xs shadow-2xs transition-all active:scale-95"
              title="שלוף נתונים עדכניים ישירות מקובץ האקסל שבשרת"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-600' : 'text-emerald-600 dark:text-emerald-400'}`} />
              <span>שלוף מקובץ השרת</span>
            </button>
          )}

          <button
            id="excel-quick-download-btn"
            onClick={handleQuickDownload}
            disabled={downloading}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-[#1E2526] hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/80 font-medium text-xs shadow-2xs hover:shadow-xs transition-all active:scale-95"
            title="הורדת קובץ אקסל (.xlsx) של מסד הנתונים ישירות מהשרת"
          >
            {downloading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            ) : (
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>הורד קובץ מהשרת</span>
          </button>

          {onConnectLocalFile && (
            <button
              id="excel-connect-file-btn"
              onClick={onConnectLocalFile}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-[#1E2526] hover:bg-teal-50 dark:hover:bg-teal-950/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800/80 font-medium text-xs shadow-2xs transition-all active:scale-95"
              title="חבר לקובץ Excel במחשב או ב-Google Drive / OneDrive לשמירה אוטומטית ישירה"
            >
              <FolderSync className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{localFileName ? 'שנה קובץ מקושר' : 'חבר לקובץ במחשב'}</span>
            </button>
          )}

          <button
            id="excel-open-manager-btn"
            onClick={onOpenExcelModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs hover:shadow-xs transition-all active:scale-95"
            title="פתח ניהול מסד נתונים אקסל מלא (טעינה, שחזור, מבנה הגיליונות)"
          >
            <Database className="w-3.5 h-3.5" />
            <span>ניהול אקסל</span>
          </button>
        </div>
      </div>
    </div>
  );
};
