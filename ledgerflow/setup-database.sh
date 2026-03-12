#!/bin/bash
# setup-database.sh - Configurar base de datos LedgerFlow en Supabase

echo "🔧 Configurando base de datos LedgerFlow..."

# Variables de Supabase
SUPABASE_URL="https://esouimxqetamqbolaaie.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzb3VpbXhxZXRhbXFib2xhYWllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU4NzU2NiwiZXhwIjoyMDg4MTYzNTY2fQ.2NMyyfKaFtISLVSZ6tUEXYchMM7gJtzQTZUPe5UcFT0"

# Verificar conexión
echo "📡 Verificando conexión a Supabase..."
curl -s -X GET "${SUPABASE_URL}/rest/v1/" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" > /dev/null && echo "✅ Conexión exitosa" || echo "⚠️ Error de conexión"

echo ""
echo "📋 Instrucciones para configurar la base de datos:"
echo "1. Ir a: ${SUPABASE_URL}/project/sql"
echo "2. Copiar el contenido de packages/database/schema.sql"
echo "3. Ejecutar el SQL"
echo ""
echo "O usar la CLI de Supabase:"
echo "supabase db push"
