// app/debug/page.tsx
// Halaman debug untuk memeriksa environment variable

export default function DebugPage() {
  const envVars = {
    NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL: process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL,
    NODE_ENV: process.env.NODE_ENV,
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🔍 Debug Environment Variables</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Environment Variables</h2>
          
          <div className="space-y-4">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="border rounded-lg p-4">
                <div className="font-mono text-sm text-gray-600 mb-2">{key}</div>
                <div className={`font-mono text-lg p-3 rounded ${
                  value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {value || '❌ NOT SET'}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">📝 Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-700">
              <li>Buat file <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code> di root project</li>
              <li>Tambahkan: <code className="bg-blue-100 px-2 py-1 rounded">NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec</code></li>
              <li>Ganti <code className="bg-blue-100 px-2 py-1 rounded">YOUR_SCRIPT_ID</code> dengan ID script yang sudah di-deploy</li>
              <li>Restart development server</li>
              <li>Refresh halaman ini</li>
            </ol>
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Troubleshooting</h3>
            <ul className="list-disc list-inside space-y-2 text-yellow-700">
              <li>Pastikan file <code className="bg-yellow-100 px-2 py-1 rounded">.env.local</code> ada di root project (bukan di folder app)</li>
              <li>Pastikan tidak ada spasi di sekitar tanda <code className="bg-yellow-100 px-2 py-1 rounded">=</code></li>
              <li>Pastikan Google Apps Script sudah di-deploy sebagai web app</li>
              <li>Pastikan permission script set ke "Anyone"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

