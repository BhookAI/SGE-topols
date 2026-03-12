-- LEDGERFLOW - Schema de Base de Datos
-- Supabase PostgreSQL con RLS
-- Fecha: 2026-03-03
-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- ============================================
-- 1. TABLAS PRINCIPALES
-- ============================================
-- TENANTS (Empresas/Agencias que usan el SaaS)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    invitation_code VARCHAR(20) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    max_clients INT DEFAULT 5,
    max_projects INT DEFAULT 3,
    max_storage_mb INT DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- USERS (Admins y empleados del tenant)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(20) DEFAULT 'member' CHECK (
        role IN ('superadmin', 'admin', 'accountant', 'viewer')
    ),
    full_name VARCHAR(255),
    avatar_url TEXT,
    preferences JSONB DEFAULT '{"theme": "dark", "language": "es"}',
    last_login TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);
-- CLIENTS (Clientes externos, acceden por código)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    access_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company_name VARCHAR(255),
    tax_id VARCHAR(50),
    address JSONB,
    preferences JSONB DEFAULT '{"notifications": true, "language": "es", "channels": ["whatsapp", "email"]}',
    metadata JSONB DEFAULT '{}',
    last_access TIMESTAMPTZ,
    access_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- PROJECTS (Proyectos vinculados a clientes)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE
    SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'planning' CHECK (
            status IN (
                'planning',
                'active',
                'paused',
                'completed',
                'cancelled'
            )
        ),
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        budget DECIMAL(12, 2),
        spent DECIMAL(12, 2) DEFAULT 0,
        estimated_hours INT,
        logged_hours INT DEFAULT 0,
        progress INT DEFAULT 0 CHECK (
            progress >= 0
            AND progress <= 100
        ),
        start_date DATE,
        end_date DATE,
        due_date DATE,
        tags TEXT [],
        metadata JSONB DEFAULT '{}',
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- TASKS (Tareas dentro de proyectos)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo' CHECK (
        status IN (
            'backlog',
            'todo',
            'in_progress',
            'review',
            'done'
        )
    ),
    priority VARCHAR(20) DEFAULT 'medium',
    assignee_id UUID REFERENCES users(id) ON DELETE
    SET NULL,
        estimated_hours DECIMAL(5, 2),
        logged_hours DECIMAL(5, 2) DEFAULT 0,
        due_date DATE,
        completed_at TIMESTAMPTZ,
        position INT DEFAULT 0,
        tags TEXT [],
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- DOCUMENTS (Facturas, recibos, archivos)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE
    SET NULL,
        project_id UUID REFERENCES projects(id) ON DELETE
    SET NULL,
        task_id UUID REFERENCES tasks(id) ON DELETE
    SET NULL,
        file_name VARCHAR(500) NOT NULL,
        file_type VARCHAR(100) NOT NULL,
        file_size INT NOT NULL,
        mime_type VARCHAR(100),
        storage_path TEXT NOT NULL,
        storage_url TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'processing' CHECK (
            status IN (
                'uploaded',
                'processing',
                'processed',
                'verified',
                'error'
            )
        ),
        document_type VARCHAR(50),
        extracted_data JSONB,
        raw_text TEXT,
        confidence DECIMAL(3, 2),
        processing_metadata JSONB,
        is_verified BOOLEAN DEFAULT false,
        verified_by UUID REFERENCES users(id),
        verified_at TIMESTAMPTZ,
        notes TEXT,
        tags TEXT [],
        uploaded_by UUID REFERENCES users(id),
        processed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- TRANSACTIONS (Contabilidad)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE
    SET NULL,
        document_id UUID REFERENCES documents(id) ON DELETE
    SET NULL,
        client_id UUID REFERENCES clients(id) ON DELETE
    SET NULL,
        type VARCHAR(50) NOT NULL CHECK (
            type IN ('income', 'expense', 'transfer', 'refund')
        ),
        category VARCHAR(100),
        subcategory VARCHAR(100),
        amount DECIMAL(12, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'EUR',
        exchange_rate DECIMAL(10, 6) DEFAULT 1,
        amount_eur DECIMAL(12, 2),
        date DATE NOT NULL,
        description TEXT,
        vendor_name VARCHAR(255),
        vendor_tax_id VARCHAR(50),
        invoice_number VARCHAR(100),
        is_recurring BOOLEAN DEFAULT false,
        recurring_frequency VARCHAR(20),
        is_reconciled BOOLEAN DEFAULT false,
        reconciled_at TIMESTAMPTZ,
        reconciled_by UUID REFERENCES users(id),
        source VARCHAR(50) DEFAULT 'manual' CHECK (
            source IN ('manual', 'email', 'upload', 'bank_sync', 'api')
        ),
        metadata JSONB,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- ACTIVITIES (Timeline de eventos)
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE
    SET NULL,
        document_id UUID REFERENCES documents(id) ON DELETE
    SET NULL,
        transaction_id UUID REFERENCES transactions(id) ON DELETE
    SET NULL,
        type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        metadata JSONB,
        is_visible_to_client BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
);
-- MESSAGES (Comunicación agente-cliente)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE
    SET NULL,
        sender_type VARCHAR(20) NOT NULL CHECK (
            sender_type IN ('user', 'client', 'agent', 'system')
        ),
        sender_id UUID,
        channel VARCHAR(20) DEFAULT 'dashboard' CHECK (
            channel IN ('dashboard', 'whatsapp', 'email', 'sms')
        ),
        content TEXT NOT NULL,
        attachments JSONB,
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMPTZ,
        sent_at TIMESTAMPTZ,
        delivered_at TIMESTAMPTZ,
        external_id VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
);
-- NOTIFICATIONS (Sistema de notificaciones)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB,
    channel VARCHAR(20) DEFAULT 'in_app',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- WEBHOOKS (Configuración de webhooks por tenant)
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    event VARCHAR(100) NOT NULL,
    url TEXT NOT NULL,
    secret VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- AUDIT LOGS (Registro de auditoría)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE
    SET NULL,
        client_id UUID REFERENCES clients(id) ON DELETE
    SET NULL,
        table_name VARCHAR(100) NOT NULL,
        record_id UUID,
        action VARCHAR(50) NOT NULL CHECK (
            action IN ('INSERT', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT')
        ),
        old_data JSONB,
        new_data JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
);
-- ============================================
-- 2. ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_clients_tenant ON clients(tenant_id);
CREATE INDEX idx_clients_code ON clients(access_code);
CREATE INDEX idx_projects_tenant ON projects(tenant_id);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(tenant_id, status);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_documents_tenant ON documents(tenant_id);
CREATE INDEX idx_documents_client ON documents(client_id);
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_documents_status ON documents(tenant_id, status);
CREATE INDEX idx_documents_created ON documents(tenant_id, created_at);
CREATE INDEX idx_transactions_tenant ON transactions(tenant_id);
CREATE INDEX idx_transactions_project ON transactions(project_id);
CREATE INDEX idx_transactions_date ON transactions(tenant_id, date);
CREATE INDEX idx_transactions_type ON transactions(tenant_id, type, date);
CREATE INDEX idx_activities_tenant ON activities(tenant_id);
CREATE INDEX idx_activities_project ON activities(project_id);
CREATE INDEX idx_activities_created ON activities(created_at);
CREATE INDEX idx_messages_client ON messages(client_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
-- ============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================
-- Habilitar RLS en todas las tablas
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- Políticas para TENANTS
CREATE POLICY tenant_isolation ON tenants FOR ALL USING (
    id = current_setting('app.current_tenant', true)::UUID
);
-- Políticas para USERS
CREATE POLICY user_tenant_isolation ON users FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::UUID
);
-- Políticas para CLIENTS
CREATE POLICY client_tenant_isolation ON clients FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::UUID
    OR id = current_setting('app.current_client', true)::UUID
);
-- Políticas para PROJECTS
CREATE POLICY project_tenant_isolation ON projects FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::UUID
);
-- Políticas para TASKS
CREATE POLICY task_tenant_isolation ON tasks FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::UUID
);
-- Políticas para DOCUMENTS
CREATE POLICY document_tenant_isolation ON documents FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::UUID
    OR client_id = current_setting('app.current_client', true)::UUID
);
-- Políticas para TRANSACTIONS
CREATE POLICY transaction_tenant_isolation ON transactions FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::UUID
    OR client_id = current_setting('app.current_client', true)::UUID
);
-- Políticas para ACTIVITIES
CREATE POLICY activity_tenant_isolation ON activities FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::UUID
    OR (
        client_id = current_setting('app.current_client', true)::UUID
        AND is_visible_to_client = true
    )
);
-- Políticas para MESSAGES
CREATE POLICY message_tenant_isolation ON messages FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::UUID
    OR client_id = current_setting('app.current_client', true)::UUID
);
-- Políticas para NOTIFICATIONS
CREATE POLICY notification_user_isolation ON notifications FOR ALL USING (
    user_id = current_setting('app.current_user', true)::UUID
    OR client_id = current_setting('app.current_client', true)::UUID
);
-- Políticas para WEBHOOKS
CREATE POLICY webhook_tenant_isolation ON webhooks FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::UUID
);
-- Políticas para AUDIT_LOGS
CREATE POLICY audit_log_tenant_isolation ON audit_logs FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::UUID
);
-- ============================================
-- 4. FUNCIONES AUXILIARES
-- ============================================
-- Función para setear contexto de tenant
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id UUID) RETURNS void AS $$ BEGIN PERFORM set_config('app.current_tenant', tenant_id::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Función para setear contexto de cliente
CREATE OR REPLACE FUNCTION set_client_context(client_id UUID) RETURNS void AS $$ BEGIN PERFORM set_config('app.current_client', client_id::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Función para setear contexto de usuario
CREATE OR REPLACE FUNCTION set_user_context(user_id UUID) RETURNS void AS $$ BEGIN PERFORM set_config('app.current_user', user_id::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Triggers para updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE
UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE
UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE
UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE
UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE
UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE
UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Función para generar código de acceso
CREATE OR REPLACE FUNCTION generate_access_code(p_tenant_id UUID, p_client_id UUID DEFAULT NULL) RETURNS TEXT AS $$
DECLARE v_prefix TEXT;
v_year TEXT;
v_random TEXT;
v_code TEXT;
v_exists BOOLEAN;
BEGIN
SELECT UPPER(LEFT(slug, 4)) INTO v_prefix
FROM tenants
WHERE id = p_tenant_id;
v_year := EXTRACT(
    YEAR
    FROM NOW()
)::TEXT;
v_random := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 3));
IF p_client_id IS NOT NULL THEN v_code := v_prefix || '-' || LEFT(p_client_id::TEXT, 3) || '-' || v_year || '-' || v_random;
ELSE v_code := v_prefix || '-' || v_year || '-' || v_random;
END IF;
SELECT EXISTS(
        SELECT 1
        FROM clients
        WHERE access_code = v_code
    ) INTO v_exists;
IF v_exists THEN RETURN generate_access_code(p_tenant_id, p_client_id);
END IF;
RETURN v_code;
END;
$$ LANGUAGE plpgsql;
-- Función para calcular progreso de proyecto
CREATE OR REPLACE FUNCTION calculate_project_progress(p_project_id UUID) RETURNS INTEGER AS $$
DECLARE v_total_tasks INTEGER;
v_completed_tasks INTEGER;
v_progress INTEGER;
BEGIN
SELECT COUNT(*),
    COUNT(
        CASE
            WHEN status = 'done' THEN 1
        END
    ) INTO v_total_tasks,
    v_completed_tasks
FROM tasks
WHERE project_id = p_project_id;
IF v_total_tasks = 0 THEN RETURN 0;
END IF;
v_progress := (v_completed_tasks * 100) / v_total_tasks;
UPDATE projects
SET progress = v_progress
WHERE id = p_project_id;
RETURN v_progress;
END;
$$ LANGUAGE plpgsql;
-- ============================================
-- 5. VISTAS ÚTILES
-- ============================================
-- Vista de resumen por proyecto
CREATE VIEW project_summary AS
SELECT p.*,
    c.full_name as client_name,
    c.email as client_email,
    COUNT(t.id) as total_tasks,
    COUNT(
        CASE
            WHEN t.status = 'done' THEN 1
        END
    ) as completed_tasks,
    COALESCE(SUM(tr.amount_eur), 0) as total_transactions,
    COALESCE(
        SUM(
            CASE
                WHEN tr.type = 'income' THEN tr.amount_eur
                ELSE 0
            END
        ),
        0
    ) as total_income,
    COALESCE(
        SUM(
            CASE
                WHEN tr.type = 'expense' THEN tr.amount_eur
                ELSE 0
            END
        ),
        0
    ) as total_expenses
FROM projects p
    LEFT JOIN clients c ON p.client_id = c.id
    LEFT JOIN tasks t ON p.id = t.project_id
    LEFT JOIN transactions tr ON p.id = tr.project_id
GROUP BY p.id,
    c.full_name,
    c.email;
-- Vista de dashboard por tenant
CREATE VIEW tenant_dashboard AS
SELECT t.id as tenant_id,
    COUNT(DISTINCT c.id) as total_clients,
    COUNT(DISTINCT p.id) as total_projects,
    COUNT(
        DISTINCT CASE
            WHEN p.status = 'active' THEN p.id
        END
    ) as active_projects,
    COUNT(DISTINCT d.id) as total_documents,
    COUNT(
        DISTINCT CASE
            WHEN d.status = 'processing' THEN d.id
        END
    ) as pending_documents,
    COALESCE(
        SUM(
            CASE
                WHEN tr.type = 'income' THEN tr.amount_eur
                ELSE 0
            END
        ),
        0
    ) as total_income,
    COALESCE(
        SUM(
            CASE
                WHEN tr.type = 'expense' THEN tr.amount_eur
                ELSE 0
            END
        ),
        0
    ) as total_expenses,
    COALESCE(
        SUM(
            CASE
                WHEN tr.type = 'income' THEN tr.amount_eur
                ELSE - tr.amount_eur
            END
        ),
        0
    ) as balance
FROM tenants t
    LEFT JOIN clients c ON t.id = c.tenant_id
    LEFT JOIN projects p ON t.id = p.tenant_id
    LEFT JOIN documents d ON t.id = d.tenant_id
    LEFT JOIN transactions tr ON t.id = tr.tenant_id
    AND tr.date >= DATE_TRUNC('month', NOW())
GROUP BY t.id;
-- ============================================
-- 6. DATOS INICIALES
-- ============================================
-- No se insertan datos de demo.
-- Los tenants y usuarios se crean automáticamente
-- en el primer inicio de sesión del administrador
-- a través del endpoint /api/auth/setup-tenant.