'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Upload, FileText, Loader2, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

export default function UploadEstudioPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthStore()
  
  const [file, setFile] = useState<File | null>(null)
  const [proyectoId, setProyectoId] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [proyectos, setProyectos] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)

  // Cargar proyectos y clientes al montar
  useState(() => {
    cargarDatos()
  })

  const cargarDatos = async () => {
    try {
      const res = await fetch('/api/proyectos-clientes')
      if (res.ok) {
        const data = await res.json()
        setProyectos(data.proyectos || [])
        setClientes(data.clientes || [])
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
    } else {
      toast({
        title: 'Archivo no válido',
        description: 'Por favor selecciona un archivo PDF',
        variant: 'destructive'
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file || !proyectoId || !clienteId) {
      toast({
        title: 'Datos incompletos',
        description: 'Selecciona un archivo PDF, proyecto y cliente',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('pdf', file)
      formData.append('proyecto_id', proyectoId)
      formData.append('cliente_id', clienteId)
      formData.append('tenant_id', user?.tenant_id || '')

      const res = await fetch('/api/analizar-estudio', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setResultado(data)
        toast({
          title: '¡Análisis completado!',
          description: `Estudio ${data.codigo_estudio} procesado correctamente`,
        })
      } else {
        throw new Error(data.error || 'Error en el análisis')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error procesando el estudio',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Análisis de Estudios de Suelo</h1>
      <p className="text-muted-foreground mb-8">
        Sube un estudio geotécnico en PDF y nuestro sistema con IA lo analizará automáticamente
      </p>

      <div className="grid gap-6">
        {/* Formulario de Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Subir Nuevo Estudio
            </CardTitle>
            <CardDescription>
              El PDF será analizado por IA para extraer información geotécnica relevante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente</Label>
                  <Select value={clienteId} onValueChange={setClienteId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proyecto">Proyecto</Label>
                  <Select value={proyectoId} onValueChange={setProyectoId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                      {proyectos.map((proyecto) => (
                        <SelectItem key={proyecto.id} value={proyecto.id}>
                          {proyecto.nombre_proyecto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pdf">Archivo PDF del Estudio</Label>
                <Input
                  id="pdf"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {file && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={loading || !file || !proyectoId || !clienteId}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analizando con IA...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir y Analizar
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resultados */}
        {resultado && (
          <Card className="border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Análisis Completado
              </CardTitle>
              <CardDescription>
                Código: {resultado.codigo_estudio}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Nivel de Filtración</p>
                  <p className="text-2xl font-bold capitalize">{resultado.analisis.nivel_filtracion}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Tipo de Suelo</p>
                  <p className="text-2xl font-bold capitalize">{resultado.analisis.tipo_suelo_principal}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Recomendaciones Críticas</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {resultado.analisis.recomendaciones_criticas?.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Resumen Ejecutivo</h4>
                <p className="text-sm text-muted-foreground">
                  {resultado.analisis.resumen_ejecutivo}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/dashboard/estudios/${resultado.estudio_id}`)}
                >
                  Ver Detalles Completos
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push(`/dashboard/cotizaciones/${resultado.cotizacion_id}`)}
                >
                  Ver Cotización
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instrucciones */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm">¿Qué sucede al subir un estudio?</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>El PDF se procesa para extraer el texto</li>
              <li>Nuestra IA (Kimi) analiza el contenido geotécnico</li>
              <li>Se detecta el nivel de filtración y tipo de suelo</li>
              <li>Se genera automáticamente una cotización</li>
              <li>Se crea un reporte de cobro para seguimiento</li>
              <li>Se envía email de notificación al cliente</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
