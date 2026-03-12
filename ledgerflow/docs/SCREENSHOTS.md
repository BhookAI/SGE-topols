# Screenshots - LedgerFlow

Descripción visual de las principales pantallas de LedgerFlow.

---

## 1. Dashboard Financiero

```
┌────────────────────────────────────────────────────────────────────────────┐
│  🦞 LedgerFlow                                              [🌙] [ES ▼] 👤 │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  💰 FINANZAS                           [📤 Subir] [⬇️ Exportar] [+ Nuevo]  │
│                                                                            │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐           │
│  │    INGRESOS      │ │     GASTOS       │ │  BALANCE NETO    │           │
│  │                  │ │                  │ │                  │           │
│  │   ₡5,000,000    │ │   ₡3,250,000    │ │   ₡1,750,000    │           │
│  │                  │ │                  │ │                  │           │
│  │   ↑ 15.5%       │ │    ↓ 5.2%       │ │   35% margen    │           │
│  │   vs mes ant.   │ │                 │ │                  │           │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘           │
│                                                                            │
│  ┌─────────────────────────────────────┐ ┌─────────────────────────────┐  │
│  │       FLUJO DE CAJA                 │ │  DISTRIBUCIÓN POR CATEGORÍA │  │
│  │                                     │ │                             │  │
│  │   ₡                                │ │         ╭──────╮            │  │
│  │ 6M ┤    ╭─╮                        │ │        ╱   35%  ╲    Serv.  │  │
│  │    │   ╱   ╲    ╭─╮               │ │       │  ┌──┐   │           │  │
│  │ 4M ┤  ╱     ╲  ╱   ╲              │ │       │  │  │   │  Productos│  │
│  │    │ ╱       ╲╱     ╲             │ │        ╲ │  │  ╱    25%    │  │
│  │ 2M ┤╱                   ╭─────────│ │         ╲│  │╱             │  │
│  │    │    Ingresos ──────│          │ │          └──┘              │  │
│  │ 0M ┼──────────────────────────────│ │         Otros 40%          │  │
│  │       Ene  Feb  Mar  Abr  May     │ │                             │  │
│  │                                     │ │                             │  │
│  └─────────────────────────────────────┘ └─────────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**Descripción**: Vista principal del dashboard financiero mostrando métricas clave, 
gráfico de área para tendencias de flujo de caja, y gráfico circular para 
distribución por categoría.

---

## 2. Tabla de Transacciones

```
┌────────────────────────────────────────────────────────────────────────────┐
│  🔍 Buscar transacciones...    [Todos ▼] [Este mes ▼] [Fecha ▼]           │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  FECHA      DESCRIPCIÓN           CATEGORÍA      MONTO        ESTADO      │
│  ────────────────────────────────────────────────────────────────────────  │
│                                                                            │
│  08/03/26   Venta servicios       Ingresos      +₡500,000     ✅ Listo    │
│             Consultoría ACME                                               │
│                                                                            │
│  07/03/26   Alquiler oficina      Operaciones   -₡250,000     ✅ Listo    │
│             Edificio Central                                               │
│                                                                            │
│  06/03/26   Compra insumos        Inventario    -₡125,000     ⏳ Revisión │
│             Proveedor XYZ                                                  │
│                                                                            │
│  05/03/26   Pago cliente          Ingresos      +₡750,000     ✅ Listo    │
│             Proyecto Alpha                                                 │
│                                                                            │
│  04/03/26   Servicios internet    Utilities     -₡45,000      ✅ Listo    │
│             Kolbi                                                          │
│                                                                            │
│  03/03/26   Material oficina      Operaciones   -₡32,000      ⏳ Revisión │
│             Librería Nacional                                              │
│                                                                            │
│                                      ┌─────────────────────────────────┐  │
│                                      │  ←  1  2  3  ...  10  →        │  │
│                                      └─────────────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**Descripción**: Tabla de transacciones con capacidad de búsqueda, filtrado por tipo 
y período, ordenamiento, e indicadores de estado (listo/revisión).

---

## 3. Modal Nueva Transacción

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │  NUEVA TRANSACCIÓN                                          [X]   │   │
│  ├────────────────────────────────────────────────────────────────────┤   │
│  │                                                                    │   │
│  │    ┌───────────────┐      ┌───────────────┐                       │   │
│  │    │  📈           │      │  📉           │                       │   │
│  │    │  INGRESO      │      │  GASTO        │                       │   │
│  │    │               │      │               │                       │   │
│  │    │  ✓ Activo     │      │               │                       │   │
│  │    └───────────────┘      └───────────────┘                       │   │
│  │                                                                    │   │
│  │  Descripción *                                                     │   │
│  │  ┌────────────────────────────────────────────────────────────┐   │   │
│  │  │ Venta de servicios de consultoría                         │   │   │
│  │  └────────────────────────────────────────────────────────────┘   │   │
│  │                                                                    │   │
│  │  Monto (₡) *                Fecha *                               │   │
│  │  ┌──────────────────┐      ┌──────────────────┐                  │   │
│  │  │ ₡ 500,000        │      │ 2026-03-08       │                  │   │
│  │  └──────────────────┘      └──────────────────┘                  │   │
│  │                                                                    │   │
│  │  Categoría                  Proveedor/Cliente                     │   │
│  │  ┌──────────────────┐      ┌──────────────────┐                  │   │
│  │  │ Ingresos    [▼]  │      │ ACME Corp        │                  │   │
│  │  └──────────────────┘      └──────────────────┘                  │   │
│  │                                                                    │   │
│  │  Notas                                                             │   │
│  │  ┌────────────────────────────────────────────────────────────┐   │   │
│  │  │ Pago recibido por transferencia bancaria                  │   │   │
│  │  └────────────────────────────────────────────────────────────┘   │   │
│  │                                                                    │   │
│  │                                          [Cancelar]  [💾 Guardar] │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**Descripción**: Modal para crear nueva transacción con selector de tipo 
(ingreso/gasto), campos de formulario validados, y diseño glassmorphism.

---

## 4. Upload de Documentos

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │  PROCESAR CON IA                                              [X]  │   │
│  ├────────────────────────────────────────────────────────────────────┤   │
│  │                                                                    │   │
│  │  ┌────────────────────────────────────────────────────────────┐   │   │
│  │  │                                                            │   │   │
│  │  │              📤                                            │   │   │
│  │  │                                                            │   │   │
│  │  │         Arrastra archivos aquí                            │   │   │
│  │  │         o haz clic para seleccionar                       │   │   │
│  │  │                                                            │   │   │
│  │  │    [PDF] [XLSX] [JPG/PNG] [XML]                          │   │   │
│  │  │                                                            │   │   │
│  │  └────────────────────────────────────────────────────────────┘   │   │
│  │                                                                    │   │
│  │  ───────────── O CONECTAR CON EMAIL ─────────────                 │   │
│  │                                                                    │   │
│  │  ┌────────────────────┐    ┌────────────────────┐                 │   │
│  │  │         G          │    │          O         │                 │   │
│  │  │       Gmail        │    │       Outlook      │                 │   │
│  │  │                    │    │                    │                 │   │
│  │  │  Extracción auto   │    │  Sync en tiempo    │                 │   │
│  │  └────────────────────┘    └────────────────────┘                 │   │
│  │                                                                    │   │
│  │                                                                    │   │
│  │                                          [Cerrar]                │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**Descripción**: Modal para subir documentos con área de drag-and-drop, 
indicadores de formatos soportados, e integraciones con Gmail y Outlook.

---

## 5. Sidebar Navigation

```
┌──────────────────────────────────────┐
│                                      │
│  🦞 LedgerFlow                       │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  📊 Dashboard                  │  │
│  ├────────────────────────────────┤  │
│  │  💰 Finanzas        ← Activo   │  │
│  ├────────────────────────────────┤  │
│  │  👥 Clientes                   │  │
│  ├────────────────────────────────┤  │
│  │  📄 Documentos                 │  │
│  ├────────────────────────────────┤  │
│  │  📊 Reportes                   │  │
│  ├────────────────────────────────┤  │
│  │  ⚙️ Configuración              │  │
│  └────────────────────────────────┘  │
│                                      │
│  ──────────────────────────────────  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  👤 Mi Empresa                 │  │
│  │     admin@empresa.com          │  │
│  └────────────────────────────────┘  │
│                                      │
└──────────────────────────────────────┘
```

**Descripción**: Sidebar de navegación con menú principal, indicador de 
sección activa, y perfil de usuario al final.

---

## 6. Vista Móvil (Responsive)

```
┌──────────────────────┐
│  🦞    LedgerFlow ☰ │
├──────────────────────┤
│                      │
│  💰 FINANZAS      +  │
│                      │
│  ┌────────────────┐  │
│  │   INGRESOS     │  │
│  │                │  │
│  │  ₡5,000,000   │  │
│  │    ↑ 15.5%    │  │
│  └────────────────┘  │
│                      │
│  ┌────────────────┐  │
│  │    GASTOS      │  │
│  │                │  │
│  │  ₡3,250,000   │  │
│  │    ↓ 5.2%     │  │
│  └────────────────┘  │
│                      │
│  ┌────────────────┐  │
│  │  BALANCE NETO  │  │
│  │                │  │
│  │  ₡1,750,000   │  │
│  │   35% margen  │  │
│  └────────────────┘  │
│                      │
│  ┌────────────────┐  │
│  │ [===========]  │  │
│  │ [========]     │  │
│  │ [=]            │  │
│  │ Gráfico simpl. │  │
│  └────────────────┘  │
│                      │
│  ──────────────────  │
│  Transacciones ▼     │
│  ──────────────────  │
│  Venta...    +₡500K │
│  Alquiler    -₡250K │
│  Compra...   -₡125K │
│                      │
└──────────────────────┘
```

**Descripción**: Vista adaptada para dispositivos móviles con tarjetas 
apiladas, gráficos simplificados, y menú hamburguesa.

---

## 7. Prisma Studio - Base de Datos

```
┌────────────────────────────────────────────────────────────────────────────┐
│  ◀  Prisma Studio                                      localhost:5555   X │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────┐  ┌────────────────────────────────────────────────────┐  │
│  │  Models      │  │  Transaction                      [+ Add record]   │  │
│  │              │  │                                                                    │
│  │  ▶ Client    │  │  id          │ clientId  │ type    │ amount    │ date       │  │
│  │  ▶ Transaction│  │  ─────────────────────────────────────────────────────────  │  │
│  │  ▶ Invoice   │  │  clwxyz...   │ clabc...  │ income  │ 500000.00 │ 2026-03-08 │  │
│  │  ▶ ClientDoc │  │  clwxyz...   │ clabc...  │ expense │ 250000.00 │ 2026-03-07 │  │
│  │  ▶ Project   │  │  clwxyz...   │ clabc...  │ income  │ 750000.00 │ 2026-03-05 │  │
│  │  ▶ AuditLog  │  │  clwxyz...   │ clabc...  │ expense │  45000.00 │ 2026-03-04 │  │
│  │              │  │  clwxyz...   │ clabc...  │ expense │  32000.00 │ 2026-03-03 │  │
│  │              │  │                                                                    │  │
│  │              │  │  50 records total                        [1] [2] [3] ...        │  │
│  │              │  └───────────────────────────────────────────────────────────────────┘  │
│  └──────────────┘                                                          │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**Descripción**: Interfaz de Prisma Studio para visualizar y editar datos 
directamente en la base de datos.

---

## 8. Landing Page (Futura)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│  🦞 LedgerFlow                                     [Features] [Pricing] [Login]│
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│                                                                            │
│     ┌─────────────────────────────────────────────────────────────────┐   │
│     │                                                                 │   │
│     │   🚀 LedgerFlow                                                 │   │
│     │                                                                 │   │
│     │   Sistema de Gestión Empresarial con IA                        │   │
│     │                                                                 │   │
│     │   Automatiza tu contabilidad con procesamiento                 │   │
│     │   inteligente de documentos y dashboards en tiempo real.       │   │
│     │                                                                 │   │
│     │   [🚀 Comenzar Gratis]  [📊 Ver Demo]                          │   │
│     │                                                                 │   │
│     └─────────────────────────────────────────────────────────────────┘   │
│                                                                            │
│     ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│     │    🤖      │  │    📄      │  │    🌍      │  │    🔒      │   │
│     │             │  │             │  │             │  │             │   │
│     │  IA Integrada│  │  Documentos │  │ Multi-idioma│  │  Seguro    │   │
│     │             │  │  Automáticos│  │  ES/EN/FR   │  │  Enterprise│   │
│     └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                            │
│     ─────────────────────────────────────────────────────────────────     │
│                                                                            │
│     💰 Dashboard Financiero Inteligente                                   │
│                                                                            │
│     ┌─────────────────────────────────┐  ┌─────────────────────────────┐ │
│     │                                 │  │                             │ │
│     │     [GRÁFICO ANIMADO]           │  │   Métricas en tiempo real   │ │
│     │                                 │  │                             │ │
│     │     Ingresos vs Gastos          │  │   • Ingresos: ₡5M          │ │
│     │     tendencias mensuales        │  │   • Gastos: ₡3.2M          │ │
│     │                                 │  │   • Balance: +₡1.8M        │ │
│     │                                 │  │   • Crecimiento: +15%      │ │
│     └─────────────────────────────────┘  └─────────────────────────────┘ │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**Descripción**: Landing page para marketing del producto con hero section, 
features, y preview del dashboard.

---

<div align="center">

**[← Volver al README](./LEDGERFLOW-README.md)**

</div>
