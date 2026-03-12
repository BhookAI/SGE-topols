-- LEDGERFLOW PRO - Schema para Análisis de Estudios de Suelo
-- Fecha: 2026-03-10
-- Arquitecto: Vex (OpenClaw)

-- ============================================
-- EXTENSIONES
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector"; -- Para búsqueda semántica

-- ============================================
-- TABLA: clientes (Clientes de la profesional)
-- ============================================
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Información básica
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    empresa VARCHAR(255),
    identificacion_fiscal VARCHAR(50),
    
    -- Ubicación
    direccion JSONB DEFAULT '{}',
    ciudad VARCHAR(100),
    pais VARCHAR(100) DEFAULT 'Costa Rica',
    
    -- Información financiera
    saldo_pendiente DECIMAL(12, 2) DEFAULT 0,
    credito_aprobado DECIMAL(12, 2) DEFAULT 0,
    
    -- Clasificación
    tipo_cliente VARCHAR(50) DEFAULT 'constructora' CHECK (tipo_cliente IN ('constructora', 'arquitecto', 'particular', 'gobierno')),
    prioridad VARCHAR(20) DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'vip')),
    
    -- Contactos adicionales
    contactos JSONB DEFAULT '[]',
    
    -- Metadata
    notas TEXT,
    etiquetas TEXT[],
    origen VARCHAR(50) DEFAULT 'manual',
    
    -- Timestamps
    ultimo_contacto TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(tenant_id, correo),
    CONSTRAINT chk_saldo_positivo CHECK (saldo_pendiente >= 0)
);

-- ============================================
-- TABLA: proyectos (Proyectos de construcción)
-- ============================================
CREATE TABLE proyectos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    
    -- Información del proyecto
    nombre_proyecto VARCHAR(255) NOT NULL,
    descripcion TEXT,
    ubicacion JSONB DEFAULT '{}', -- {direccion, lat, lng, map_url}
    
    -- Estado y fechas
    estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_estudio', 'cotizacion', 'aprobado', 'en_ejecucion', 'finalizado', 'cancelado')),
    fecha_inicio DATE,
    fecha_entrega DATE,
    fecha_estimada_entrega DATE,
    
    -- Tipo de trabajo
    tipo_obra VARCHAR(100) CHECK (tipo_obra IN ('residencial', 'comercial', 'industrial', 'infraestructura', 'otro')),
    tipo_suelo_detectado VARCHAR(100),
    nivel_filtracion_detectado VARCHAR(50),
    
    -- Presupuesto
    presupuesto_estimado DECIMAL(12, 2),
    presupuesto_aprobado DECIMAL(12, 2),
    costo_real DECIMAL(12, 2) DEFAULT 0,
    
    -- Responsables
    responsable_id UUID REFERENCES users(id),
    equipo_asignado JSONB DEFAULT '[]',
    
    -- Documentos asociados
    documentos_count INT DEFAULT 0,
    estudios_count INT DEFAULT 0,
    cotizaciones_count INT DEFAULT 0,
    
    -- Seguimiento
    progreso INT DEFAULT 0 CHECK (progreso >= 0 AND progreso <= 100),
    ultima_actividad TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: estudios_suelo (Análisis geotécnicos)
-- ============================================
CREATE TABLE estudios_suelo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    proyecto_id UUID REFERENCES proyectos(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    
    -- Información del estudio
    codigo_estudio VARCHAR(100) UNIQUE NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    tipo_estudio VARCHAR(50) DEFAULT 'geotecnico' CHECK (tipo_estudio IN ('geotecnico', 'mecanica_suelos', 'filtraciones', 'contaminacion', 'sismicidad')),
    
    -- Archivos
    pdf_original_url TEXT NOT NULL,
    pdf_original_path TEXT NOT NULL,
    pdf_analizado_url TEXT,
    imagenes_estudio JSONB DEFAULT '[]',
    
    -- Análisis crudo (texto extraído del PDF)
    raw_text_analysis TEXT,
    raw_text_extracted_at TIMESTAMPTZ,
    raw_text_extraction_method VARCHAR(50) DEFAULT 'pdf_parser',
    
    -- Vector embeddings para búsqueda semántica
    embedding VECTOR(1536),
    
    -- Análisis de IA
    conclusiones_ia JSONB DEFAULT '{}',
    -- Estructura esperada:
    -- {
    --   "nivel_filtracion": "alto|medio|bajo|critico",
    --   "tipo_suelo_principal": "arcilloso|arenoso|limoso|rocoso|organico",
    --   "tipos_suelo_detectados": ["arcilla", "arena", "limo"],
    --   "recomendaciones_criticas": ["impermeabilización", "drenaje"],
    --   "riesgos_identificados": ["filtraciones", "asentamiento"],
    --   "profundidad_recomendada_cimentacion": "2.5m",
    --   "capacidad_portante": "15 ton/m2",
    --   "ph_suelo": 6.8,
    --   "contenido_humedad": "25%",
    --   "recomendacion_general": "texto largo...",
    --   "puntos_criticos_mapa": [{"x": 0.3, "y": 0.7, "tipo": "filtracion"}],
    --   "resumen_ejecutivo": "texto...",
    --   "alertas": ["Presencia de agua superficial"]
    -- }
    
    conclusiones_ia_generadas_at TIMESTAMPTZ,
    conclusiones_ia_modelo VARCHAR(100) DEFAULT 'kimi-k2',
    conclusiones_ia_confianza DECIMAL(3,2) DEFAULT 0.85,
    
    -- Visualización
    panorama_visible_data JSONB DEFAULT '{}',
    -- {
    --   "heatmap_url": "...",
    --   "capas_suelo": [{"profundidad": "0-2m", "tipo": "arcilla", "color": "#8B4513"}],
    --   "zonas_riesgo": [{"coordenadas": [], "nivel": "alto"}]
    -- }
    
    -- Estado del análisis
    estado_analisis VARCHAR(50) DEFAULT 'pendiente' CHECK (estado_analisis IN ('pendiente', 'procesando', 'completado', 'error', 'revision_manual')),
    
    -- Métricas
    paginas_totales INT,
    paginas_procesadas INT DEFAULT 0,
    
    -- Notas del analista
    notas_analista TEXT,
    revisado_por UUID REFERENCES users(id),
    revisado_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: cotizaciones (Presupuestos/Cotizaciones)
-- ============================================
CREATE TABLE cotizaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    proyecto_id UUID REFERENCES proyectos(id) ON DELETE SET NULL,
    estudio_suelo_id UUID REFERENCES estudios_suelo(id) ON DELETE SET NULL,
    
    -- Código único de cotización
    codigo_cotizacion VARCHAR(100) UNIQUE NOT NULL,
    version INT DEFAULT 1,
    cotizacion_padre_id UUID REFERENCES cotizaciones(id), -- Para versiones
    
    -- Información de la cotización
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    
    -- Servicios incluidos (estructura flexible)
    servicios_json JSONB NOT NULL DEFAULT '[]',
    -- [
    --   {
    --     "id": "srv_001",
    --     "concepto": "Análisis geotécnico detallado",
    --     "descripcion": "Estudio de suelos con 3 calicatas",
    --     "cantidad": 3,
    --     "unidad": "calicata",
    --     "precio_unitario": 450000,
    --     "subtotal": 1350000,
    --     "categoria": "estudio"
    --   },
    --   {
    --     "id": "srv_002", 
    --     "concepto": "Impermeabilización recomendada",
    --     "descripcion": "Basado en hallazgos de filtración",
    --     "cantidad": 150,
    --     "unidad": "m2",
    --     "precio_unitario": 25000,
    --     "subtotal": 3750000,
    --     "categoria": "trabajo"
    --   }
    -- ]
    
    -- Desglose financiero
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    descuento_porcentaje DECIMAL(5, 2) DEFAULT 0,
    descuento_monto DECIMAL(12, 2) DEFAULT 0,
    impuestos JSONB DEFAULT '[]', -- [{"nombre": "IVA", "porcentaje": 13, "monto": 520000}]
    total_impuestos DECIMAL(12, 2) DEFAULT 0,
    total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    
    -- Moneda
    moneda VARCHAR(3) DEFAULT 'CRC', -- Costa Rica Colones
    tipo_cambio DECIMAL(10, 6) DEFAULT 1,
    
    -- Estado y seguimiento
    estado VARCHAR(50) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'enviada', 'vista', 'negociacion', 'aprobada', 'rechazada', 'vencida', 'cancelada')),
    
    -- Fechas importantes
    fecha_emision TIMESTAMPTZ DEFAULT NOW(),
    fecha_vencimiento DATE,
    fecha_aprobacion TIMESTAMPTZ,
    fecha_rechazo TIMESTAMPTZ,
    
    -- Condiciones comerciales
    validez_dias INT DEFAULT 30,
    condiciones_pago VARCHAR(255) DEFAULT '50% anticipo, 50% contra entrega',
    forma_pago VARCHAR(100) DEFAULT 'transferencia',
    plazo_entrega_dias INT,
    
    -- Documentos generados
    pdf_generado_url TEXT,
    pdf_generado_at TIMESTAMPTZ,
    
    -- Relación con el estudio
    basado_en_estudio BOOLEAN DEFAULT false,
    recomendaciones_aplicadas JSONB DEFAULT '[]',
    
    -- Notas y términos
    notas_cliente TEXT,
    terminos_condiciones TEXT,
    
    -- Seguimiento de comunicaciones
    enviada_por UUID REFERENCES users(id),
    enviada_at TIMESTAMPTZ,
    vista_por_cliente_at TIMESTAMPTZ,
    veces_vista INT DEFAULT 0,
    
    -- Relación con facturación
    factura_id UUID, -- Referencia a tabla de facturas
    facturado BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: reportes_cobro (Seguimiento de cobros)
-- ============================================
CREATE TABLE reportes_cobro (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    proyecto_id UUID REFERENCES proyectos(id) ON DELETE SET NULL,
    cotizacion_id UUID REFERENCES cotizaciones(id) ON DELETE SET NULL,
    
    -- Tipo de cobro
    tipo_cobro VARCHAR(50) DEFAULT 'cuota' CHECK (tipo_cobro IN ('anticipo', 'cuota', 'entrega', 'garantia', 'extraordinario')),
    
    -- Información del cobro
    concepto VARCHAR(255) NOT NULL,
    descripcion TEXT,
    
    -- Montos
    monto_esperado DECIMAL(12, 2) NOT NULL,
    monto_pagado DECIMAL(12, 2) DEFAULT 0,
    monto_pendiente DECIMAL(12, 2) GENERATED ALWAYS AS (monto_esperado - monto_pagado) STORED,
    
    -- Fechas
    fecha_esperada DATE NOT NULL,
    fecha_recordatorio DATE,
    fecha_pago TIMESTAMPTZ,
    
    -- Estado
    estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'recordatorio_enviado', 'vencido', 'parcial', 'pagado', 'incobrable', 'perdonado')),
    
    -- Método de pago
    metodo_pago VARCHAR(50) CHECK (metodo_pago IN ('efectivo', 'transferencia', 'cheque', 'tarjeta', 'sinpe', 'otro')),
    referencia_pago VARCHAR(100),
    comprobante_url TEXT,
    
    -- Recordatorios automáticos
    recordatorios_enviados INT DEFAULT 0,
    ultimo_recordatorio_at TIMESTAMPTZ,
    proximo_recordatorio_at TIMESTAMPTZ,
    
    -- Alertas
    dias_mora INT DEFAULT 0,
    nivel_alerta VARCHAR(20) DEFAULT 'normal' CHECK (nivel_alerta IN ('normal', 'amarilla', 'naranja', 'roja', 'critica')),
    
    -- Acciones de cobro
    acciones_cobro JSONB DEFAULT '[]',
    -- [
    --   {"tipo": "llamada", "fecha": "2026-03-01", "resultado": "promesa_pago", "notas": "..."},
    --   {"tipo": "email", "fecha": "2026-03-05", "resultado": "sin_respuesta"}
    -- ]
    
    -- Notas internas
    notas_cobranza TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: workflow_logs (Logs de ejecución n8n)
-- ============================================
CREATE TABLE workflow_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Identificación del workflow
    workflow_name VARCHAR(100) NOT NULL,
    workflow_id VARCHAR(100),
    execution_id VARCHAR(100),
    
    -- Tipo de evento
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('trigger', 'process', 'analyze', 'generate', 'notify', 'error', 'complete')),
    
    -- Entidad relacionada
    entity_type VARCHAR(50) CHECK (entity_type IN ('estudio_suelo', 'cotizacion', 'reporte_cobro', 'proyecto', 'cliente')),
    entity_id UUID,
    
    -- Detalles
    payload JSONB DEFAULT '{}',
    resultado JSONB DEFAULT '{}',
    
    -- Estado
    status VARCHAR(50) DEFAULT 'running' CHECK (status IN ('running', 'success', 'error', 'warning', 'retry')),
    error_message TEXT,
    
    -- Métricas
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX idx_clientes_tenant ON clientes(tenant_id);
CREATE INDEX idx_clientes_correo ON clientes(correo);
CREATE INDEX idx_clientes_saldo ON clientes(tenant_id, saldo_pendiente DESC);
CREATE INDEX idx_clientes_prioridad ON clientes(tenant_id, prioridad);

CREATE INDEX idx_proyectos_tenant ON proyectos(tenant_id);
CREATE INDEX idx_proyectos_cliente ON proyectos(cliente_id);
CREATE INDEX idx_proyectos_estado ON proyectos(tenant_id, estado);
CREATE INDEX idx_proyectos_fecha_entrega ON proyectos(fecha_entrega);

CREATE INDEX idx_estudios_tenant ON estudios_suelo(tenant_id);
CREATE INDEX idx_estudios_proyecto ON estudios_suelo(proyecto_id);
CREATE INDEX idx_estudios_estado ON estudios_suelo(estado_analisis);
CREATE INDEX idx_estudios_embedding ON estudios_suelo USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX idx_cotizaciones_tenant ON cotizaciones(tenant_id);
CREATE INDEX idx_cotizaciones_cliente ON cotizaciones(cliente_id);
CREATE INDEX idx_cotizaciones_estado ON cotizaciones(tenant_id, estado);
CREATE INDEX idx_cotizaciones_estudio ON cotizaciones(estudio_suelo_id);

CREATE INDEX idx_reportes_cobro_tenant ON reportes_cobro(tenant_id);
CREATE INDEX idx_reportes_cobro_cliente ON reportes_cobro(cliente_id);
CREATE INDEX idx_reportes_cobro_estado ON reportes_cobro(estado);
CREATE INDEX idx_reportes_cobro_fecha ON reportes_cobro(fecha_esperada);
CREATE INDEX idx_reportes_cobro_mora ON reportes_cobro(dias_mora DESC);

CREATE INDEX idx_workflow_logs_tenant ON workflow_logs(tenant_id);
CREATE INDEX idx_workflow_logs_workflow ON workflow_logs(workflow_name);
CREATE INDEX idx_workflow_logs_status ON workflow_logs(status);
CREATE INDEX idx_workflow_logs_entity ON workflow_logs(entity_type, entity_id);

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Dashboard de Cobros
CREATE VIEW vista_cobros_dashboard AS
SELECT 
    rc.*,
    c.nombre as cliente_nombre,
    c.correo as cliente_correo,
    c.empresa as cliente_empresa,
    p.nombre_proyecto,
    CASE 
        WHEN rc.dias_mora > 30 THEN 'critica'
        WHEN rc.dias_mora > 15 THEN 'roja'
        WHEN rc.dias_mora > 7 THEN 'naranja'
        WHEN rc.dias_mora > 0 THEN 'amarilla'
        ELSE 'normal'
    END as alerta_actual
FROM reportes_cobro rc
JOIN clientes c ON rc.cliente_id = c.id
LEFT JOIN proyectos p ON rc.proyecto_id = p.id
WHERE rc.estado NOT IN ('pagado', 'perdonado');

-- Vista: Pipeline de Proyectos
CREATE VIEW vista_pipeline_proyectos AS
SELECT 
    p.*,
    c.nombre as cliente_nombre,
    COUNT(es.id) as total_estudios,
    COUNT(CASE WHEN es.estado_analisis = 'completado' THEN 1 END) as estudios_completados,
    COUNT(cot.id) as total_cotizaciones,
    SUM(CASE WHEN cot.estado = 'aprobada' THEN cot.total ELSE 0 END) as monto_cotizado_aprobado
FROM proyectos p
JOIN clientes c ON p.cliente_id = c.id
LEFT JOIN estudios_suelo es ON p.id = es.proyecto_id
LEFT JOIN cotizaciones cot ON p.id = cot.proyecto_id
GROUP BY p.id, c.nombre;

-- ============================================
-- FUNCIONES AUXILIARES
-- ============================================

-- Generar código de estudio
CREATE OR REPLACE FUNCTION generar_codigo_estudio()
RETURNS TRIGGER AS $$
DECLARE
    v_prefijo TEXT;
    v_anio TEXT;
    v_secuencia INT;
    v_codigo TEXT;
BEGIN
    v_prefijo := 'EST';
    v_anio := EXTRACT(YEAR FROM NOW())::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(codigo_estudio FROM '[0-9]+$') AS INT)), 0) + 1
    INTO v_secuencia
    FROM estudios_suelo
    WHERE codigo_estudio LIKE v_prefijo || '-' || v_anio || '-%';
    
    v_codigo := v_prefijo || '-' || v_anio || '-' || LPAD(v_secuencia::TEXT, 4, '0');
    NEW.codigo_estudio := v_codigo;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_codigo_estudio
    BEFORE INSERT ON estudios_suelo
    FOR EACH ROW
    WHEN (NEW.codigo_estudio IS NULL)
    EXECUTE FUNCTION generar_codigo_estudio();

-- Generar código de cotización
CREATE OR REPLACE FUNCTION generar_codigo_cotizacion()
RETURNS TRIGGER AS $$
DECLARE
    v_prefijo TEXT;
    v_anio TEXT;
    v_secuencia INT;
    v_codigo TEXT;
BEGIN
    v_prefijo := 'COT';
    v_anio := EXTRACT(YEAR FROM NOW())::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(codigo_cotizacion FROM '[0-9]+$') AS INT)), 0) + 1
    INTO v_secuencia
    FROM cotizaciones
    WHERE codigo_cotizacion LIKE v_prefijo || '-' || v_anio || '-%';
    
    v_codigo := v_prefijo || '-' || v_anio || '-' || LPAD(v_secuencia::TEXT, 4, '0');
    NEW.codigo_cotizacion := v_codigo;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generar_codigo_cotizacion
    BEFORE INSERT ON cotizaciones
    FOR EACH ROW
    WHEN (NEW.codigo_cotizacion IS NULL)
    EXECUTE FUNCTION generar_codigo_cotizacion();

-- Calcular totales de cotización
CREATE OR REPLACE FUNCTION calcular_totales_cotizacion()
RETURNS TRIGGER AS $$
DECLARE
    v_subtotal DECIMAL(12,2) := 0;
    v_descuento DECIMAL(12,2) := 0;
    v_impuestos DECIMAL(12,2) := 0;
    v_total DECIMAL(12,2) := 0;
    servicio JSONB;
    impuesto JSONB;
BEGIN
    -- Calcular subtotal de servicios
    FOR servicio IN SELECT * FROM jsonb_array_elements(NEW.servicios_json)
    LOOP
        v_subtotal := v_subtotal + COALESCE((servicio->>'subtotal')::DECIMAL, 0);
    END LOOP;
    
    -- Calcular descuento
    IF NEW.descuento_porcentaje > 0 THEN
        v_descuento := (v_subtotal * NEW.descuento_porcentaje / 100);
    ELSE
        v_descuento := COALESCE(NEW.descuento_monto, 0);
    END IF;
    
    -- Calcular impuestos
    FOR impuesto IN SELECT * FROM jsonb_array_elements(NEW.impuestos)
    LOOP
        v_impuestos := v_impuestos + ((v_subtotal - v_descuento) * (impuesto->>'porcentaje')::DECIMAL / 100);
    END LOOP;
    
    -- Total
    v_total := v_subtotal - v_descuento + v_impuestos;
    
    -- Actualizar campos
    NEW.subtotal := v_subtotal;
    NEW.descuento_monto := v_descuento;
    NEW.total_impuestos := v_impuestos;
    NEW.total := v_total;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_totales_cotizacion
    BEFORE INSERT OR UPDATE ON cotizaciones
    FOR EACH ROW
    EXECUTE FUNCTION calcular_totales_cotizacion();

-- Actualizar saldo del cliente
CREATE OR REPLACE FUNCTION actualizar_saldo_cliente()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE clientes 
        SET saldo_pendiente = saldo_pendiente + NEW.monto_pendiente
        WHERE id = NEW.cliente_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE clientes 
        SET saldo_pendiente = saldo_pendiente - OLD.monto_pendiente + NEW.monto_pendiente
        WHERE id = NEW.cliente_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE clientes 
        SET saldo_pendiente = saldo_pendiente - OLD.monto_pendiente
        WHERE id = OLD.cliente_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_saldo_cliente
    AFTER INSERT OR UPDATE OR DELETE ON reportes_cobro
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_saldo_cliente();

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudios_suelo ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_cobro ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para clientes
CREATE POLICY clientes_tenant_isolation ON clientes 
    FOR ALL USING (tenant_id = current_setting('app.current_tenant', true)::UUID);

-- Políticas para proyectos  
CREATE POLICY proyectos_tenant_isolation ON proyectos 
    FOR ALL USING (tenant_id = current_setting('app.current_tenant', true)::UUID);

-- Políticas para estudios
CREATE POLICY estudios_tenant_isolation ON estudios_suelo 
    FOR ALL USING (tenant_id = current_setting('app.current_tenant', true)::UUID);

-- Políticas para cotizaciones
CREATE POLICY cotizaciones_tenant_isolation ON cotizaciones 
    FOR ALL USING (tenant_id = current_setting('app.current_tenant', true)::UUID);

-- Políticas para reportes de cobro
CREATE POLICY reportes_cobro_tenant_isolation ON reportes_cobro 
    FOR ALL USING (tenant_id = current_setting('app.current_tenant', true)::UUID);

-- ============================================
-- DATOS INICIALES DE PRUEBA (Opcional)
-- ============================================
-- Comentar en producción

-- INSERT INTO clientes (tenant_id, nombre, correo, empresa, saldo_pendiente, tipo_cliente, prioridad)
-- SELECT 
--     id as tenant_id,
--     'Constructora El Progreso',
--     'proyectos@elprogreso.com',
--     'Constructora El Progreso S.A.',
--     2500000,
--     'constructora',
--     'alta'
-- FROM tenants LIMIT 1;

-- INSERT INTO proyectos (tenant_id, cliente_id, nombre_proyecto, estado, fecha_entrega, presupuesto_estimado)
-- SELECT 
--     c.tenant_id,
--     c.id as cliente_id,
--     'Edificio Residencial Torre Norte',
--     'en_estudio',
--     '2026-12-15',
--     150000000
-- FROM clientes c LIMIT 1;

-- SELECT 'Schema LedgerFlow Pro instalado correctamente' as status;
