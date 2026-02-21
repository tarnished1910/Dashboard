import { useEffect, useState } from 'react';
import { runDashboardHealthCheck } from './lib/neon';
import { Database, Server, CheckCircle2, XCircle } from 'lucide-react';

type Status = 'checking' | 'connected' | 'error';

function App() {
  const [dbStatus, setDbStatus] = useState<Status>('checking');
  const [readStatus, setReadStatus] = useState<Status>('checking');
  const [writeStatus, setWriteStatus] = useState<Status>('checking');
  const [tables, setTables] = useState<string[]>([]);
  const [missingTables, setMissingTables] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    checkDatabase();
  }, []);

  async function checkDatabase() {
    try {
      const health = await runDashboardHealthCheck();

      setTables(health.tables);
      setReadStatus(health.readOk ? 'connected' : 'error');
      setWriteStatus(health.writeOk ? 'connected' : 'error');
      setDbStatus(health.readOk && health.writeOk ? 'connected' : 'error');
    } catch (err) {
      console.error('Database check failed:', err);
      setDbStatus('error');
      setReadStatus('error');
      setWriteStatus('error');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Server className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Discord Dashboard</h1>
            </div>
            <p className="text-blue-100">NeonDB Status Monitor</p>
          </div>

          <div className="p-8">
            <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
              <div className="flex-1">
                <h2 className="font-semibold text-lg">Database Connection</h2>
                <p className="text-sm text-slate-600">
                  {dbStatus === 'checking' && 'Checking connection...'}
                  {dbStatus === 'connected' && 'Neon PostgreSQL (read + write)'}
                  {dbStatus === 'error' && 'Connection failed'}
                </p>
              </div>
              {dbStatus === 'checking' && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              )}
              {dbStatus === 'connected' && <CheckCircle2 className="w-6 h-6 text-green-600" />}
              {dbStatus === 'error' && <XCircle className="w-6 h-6 text-red-600" />}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-500">Read check</p>
                <p className="font-medium text-slate-900">{readStatus === 'connected' ? 'Pass' : readStatus === 'error' ? 'Fail' : 'Checking...'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-500">Write check</p>
                <p className="font-medium text-slate-900">{writeStatus === 'connected' ? 'Pass' : writeStatus === 'error' ? 'Fail' : 'Checking...'}</p>
              </div>
            </div>

            {dbStatus === 'connected' && (
              <div>
                <h3 className="font-semibold text-lg mb-4">Detected Tables</h3>
                <div className="grid grid-cols-2 gap-3">
                  {tables.map((table) => (
                    <div
                      key={table}
                      className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-slate-700 truncate">{table}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {missingTables.length > 0 && (
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Missing expected tables: {missingTables.join(', ')}
                    </p>
                  </div>
                )}

                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Database is working!</strong> Read and write checks passed.
                  </p>
                </div>
              </div>
            )}

            {dbStatus === 'error' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
                <p className="text-sm text-red-800">
                  Failed to connect to NeonDB. Ensure <code>VITE_DATABASE_URL</code> is set correctly.
                </p>
                {errorMessage && (
                  <p className="text-xs text-red-700 break-all">
                    <strong>Error:</strong> {errorMessage}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={checkDatabase}
              className="mt-6 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Re-check Database
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
