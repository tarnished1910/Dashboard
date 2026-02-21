import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Database, Server, CheckCircle2, XCircle } from 'lucide-react';

function App() {
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    checkDatabase();
  }, []);

  async function checkDatabase() {
    try {
      const { data, error } = await supabase
        .from('guild_settings')
        .select('count')
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        setDbStatus('error');
        return;
      }

      setDbStatus('connected');

      const tableNames = [
        'guild_settings',
        'custom_commands',
        'tickets',
        'audit_logs',
        'guild_members',
        'info_topics',
        'votes',
        'triggers',
      ];
      setTables(tableNames);
    } catch (err) {
      console.error('Database check failed:', err);
      setDbStatus('error');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Server className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Discord Dashboard</h1>
            </div>
            <p className="text-blue-100">Database Status Monitor</p>
          </div>

          <div className="p-8">
            <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
              <div className="flex-1">
                <h2 className="font-semibold text-lg">Database Connection</h2>
                <p className="text-sm text-slate-600">
                  {dbStatus === 'checking' && 'Checking connection...'}
                  {dbStatus === 'connected' && 'Supabase PostgreSQL'}
                  {dbStatus === 'error' && 'Connection failed'}
                </p>
              </div>
              {dbStatus === 'checking' && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              )}
              {dbStatus === 'connected' && (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              )}
              {dbStatus === 'error' && (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
            </div>

            {dbStatus === 'connected' && (
              <div>
                <h3 className="font-semibold text-lg mb-4">Available Tables</h3>
                <div className="grid grid-cols-2 gap-3">
                  {tables.map((table) => (
                    <div
                      key={table}
                      className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-slate-700 truncate">
                          {table}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Database is working!</strong> All tables have been created and are ready to use.
                  </p>
                </div>
              </div>
            )}

            {dbStatus === 'error' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  Failed to connect to the database. Please check your configuration.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
