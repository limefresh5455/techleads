import { useState } from 'react'
import { Database, FileUp, Globe, Cpu, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { adminImports } from '../adminApi'

export default function AdminImportPage() {
  const [techLoading, setTechLoading] = useState(false)
  const [techStatus, setTechStatus] = useState(null)
  
  const [webLoading, setWebLoading] = useState(false)
  const [webStatus, setWebStatus] = useState(null)
  
  const [csvFile, setCsvFile] = useState(null)
  const [csvLoading, setCsvLoading] = useState(false)
  const [csvStatus, setCsvStatus] = useState(null)

  const handleImportTech = async () => {
    setTechLoading(true)
    setTechStatus(null)
    try {
      await adminImports.importTechnologies()
      setTechStatus({ type: 'success', message: 'Technology import started in the background.' })
    } catch (err) {
      setTechStatus({ type: 'error', message: err.message || 'Failed to start import' })
    } finally {
      setTechLoading(false)
    }
  }

  const handleImportWeb = async () => {
    setWebLoading(true)
    setWebStatus(null)
    try {
      await adminImports.importWebsites()
      setWebStatus({ type: 'success', message: 'Websites import started in the background.' })
    } catch (err) {
      setWebStatus({ type: 'error', message: err.message || 'Failed to start import' })
    } finally {
      setWebLoading(false)
    }
  }

  const handleCsvUpload = async (e) => {
    e.preventDefault()
    if (!csvFile) return
    setCsvLoading(true)
    setCsvStatus(null)
    
    try {
      await adminImports.uploadCsv(csvFile)
      
      setCsvStatus({ type: 'success', message: 'CSV imported successfully!' })
      setCsvFile(null)
      const fileInput = document.getElementById('csv-upload')
      if (fileInput) fileInput.value = ''
    } catch (err) {
      setCsvStatus({ type: 'error', message: err.message || 'Failed to upload CSV' })
    } finally {
      setCsvLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
          <Database className="text-brand-dark shrink-0" />
          <span className="whitespace-nowrap">Data Imports</span>
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Import Technologies */}
        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-brand/10 text-brand rounded-lg">
              <Cpu size={24}  className='text-brand-dark'/>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">Import Technologies</h2>
              <p className="text-sm text-muted">Fetch and update latest technologies.</p>
            </div>
          </div>
          
          {techStatus && (
            <div className={`p-3 rounded-lg text-sm flex gap-2 items-start ${techStatus.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
              {techStatus.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
              <span>{techStatus.message}</span>
            </div>
          )}

          <button
            onClick={handleImportTech}
            disabled={techLoading}
            className="mt-auto flex items-center justify-center gap-2 w-full bg-brand text-on-brand px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand/90 transition-colors disabled:opacity-50"
          >
            {techLoading ? <Loader2 size={16} className="animate-spin" /> : 'Start Technology Import'}
          </button>
        </div>

        {/* Import Websites */}
        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-brand/10 text-brand rounded-lg">
              <Globe size={24} className='text-brand-dark' />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">Import Websites</h2>
              <p className="text-sm text-muted">Fetch and update latest websites.</p>
            </div>
          </div>

          {webStatus && (
            <div className={`p-3 rounded-lg text-sm flex gap-2 items-start ${webStatus.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
              {webStatus.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
              <span>{webStatus.message}</span>
            </div>
          )}

          <button
            onClick={handleImportWeb}
            disabled={webLoading}
            className="mt-auto flex items-center justify-center gap-2 w-full bg-brand text-on-brand px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand/90 transition-colors disabled:opacity-50"
          >
            {webLoading ? <Loader2 size={16} className="animate-spin" /> : 'Start Website Import'}
          </button>
        </div>
      </div>

      {/* CSV Upload */}
      <div className="bg-surface border border-border rounded-xl p-6 flex flex-col space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-brand/10 text-brand rounded-lg">
            <FileUp size={24} className='text-brand-dark' />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink">Upload CSV Data</h2>
            <p className="text-sm text-muted">Upload a .csv file to directly import data.</p>
          </div>
        </div>

        {csvStatus && (
          <div className={`p-3 rounded-lg text-sm flex gap-2 items-start ${csvStatus.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
            {csvStatus.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
            <span>{csvStatus.message}</span>
          </div>
        )}

        <form onSubmit={handleCsvUpload} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-ink" htmlFor="csv-upload">
              Choose CSV File
            </label>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files[0])}
              className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-sm text-ink  focus:outline-none focus:border-brand file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand/10 file:text-brand hover:file:bg-brand/20 transition-all cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={!csvFile || csvLoading}
            className="flex items-center justify-center gap-2 w-fit bg-brand text-on-brand px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand/90 transition-colors disabled:opacity-50 mt-2"
          >
            {csvLoading ? <Loader2 size={16} className="animate-spin" /> : 'Upload CSV'}
          </button>
        </form>
      </div>
    </div>
  )
}




