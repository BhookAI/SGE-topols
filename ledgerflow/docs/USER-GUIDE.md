# Guía de Usuario - LedgerFlow

Guía completa para usuarios finales del sistema LedgerFlow.

---

## 📚 Índice

- [Primeros Pasos](#primeros-pasos)
- [Dashboard Financiero](#dashboard-financiero)
- [Gestión de Transacciones](#gestión-de-transacciones)
- [Ingesta de Documentos](#ingesta-de-documentos)
- [Gestión de Clientes](#gestión-de-clientes)
- [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 🚀 Primeros Pasos

### Acceso al Sistema

1. Abre tu navegador y ve a `http://localhost:3000` (desarrollo)
2. Selecciona tu idioma preferido (ES/EN/FR)
3. Navega al Dashboard desde el menú lateral

### Navegación

```
┌─────────────────────────────────────────────────────────────┐
│  🦞 LedgerFlow                                    [ES ▼]    │
├─────────────────────────────────────────────────────────────┤
│  📊 Dashboard                                               │
│  💰 Finanzas        ←── Dashboard Financiero               │
│  👥 Clientes                                                │
│  📄 Documentos                                              │
│  ⚙️ Configuración                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Dashboard Financiero

### Vista General

El dashboard financiero te permite visualizar el estado de tus finanzas en tiempo real.

```
┌─────────────────────────────────────────────────────────────┐
│  DASHBOARD FINANCIERO                              [+ Nuevo]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │  INGRESOS    │ │   GASTOS     │ │ BALANCE NETO │        │
│  │  ₡5,000,000  │ │  ₡3,250,000  │ │  ₡1,750,000  │        │
│  │  ↑ 15.5%     │ │   ↓ 5.2%     │ │              │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                             │
│  ┌─────────────────────────────┐ ┌──────────────────────┐  │
│  │      FLUJO DE CAJA          │ │  POR CATEGORÍA       │  │
│  │                             │ │                      │  │
│  │    📈 Gráfico de Área       │ │    🥧 Pie Chart      │  │
│  │                             │ │                      │  │
│  └─────────────────────────────┘ └──────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              TRANSACCIONES RECIENTES                │   │
│  ├──────────┬──────────────┬──────────┬────────┬───────┤   │
│  │ Fecha    │ Descripción  │ Categoría│ Monto  │ Estado│   │
│  ├──────────┼──────────────┼──────────┼────────┼───────┤   │
│  │ 08/03    │ Venta serv.  │ Ingresos │+₡500K │  ✅   │   │
│  │ 07/03    │ Alquiler     │ Operac.  │-₡250K │  ✅   │   │
│  └──────────┴──────────────┴──────────┴────────┴───────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Tarjetas de Métricas

| Métrica | Descripción | Indicador |
|---------|-------------|-----------|
| **Ingresos** | Total de ingresos en el período seleccionado | Verde ↑ |
| **Gastos** | Total de gastos en el período seleccionado | Rojo ↓ |
| **Balance Neto** | Ingresos - Gastos | Azul = |
| **Pendientes** | Documentos que requieren revisión | Amarillo ⚠️ |

### Gráficos

#### Flujo de Caja (Área)

Muestra la evolución de ingresos vs gastos en el tiempo:
- **Línea verde**: Ingresos
- **Línea roja**: Gastos
- **Gradientes**: Visualización de volumen

#### Distribución por Categoría (Pie)

Muestra cómo se distribuyen tus ingresos/gastos:
- Cada color representa una categoría
- Porcentaje del total
- Top 6 categorías principales

### Filtros

```
┌──────────────────────────────────────────────────────┐
│  🔍 Buscar...    [Todos ▼] [Este mes ▼] [Asc ▼]     │
└──────────────────────────────────────────────────────┘
```

| Filtro | Opciones |
|--------|----------|
| **Búsqueda** | Texto libre en descripción, categoría, proveedor |
| **Tipo** | Todos, Ingresos, Gastos |
| **Período** | Esta semana, Este mes, Este trimestre, Este año, Todo |
| **Orden** | Fecha ↑↓, Monto ↑↓, Categoría ↑↓ |

---

## 💰 Gestión de Transacciones

### Crear Transacción Manual

1. Haz clic en **"+ Nueva Transacción"**
2. Selecciona el tipo: **Ingreso** o **Gasto**
3. Completa los campos:

```
┌─────────────────────────────────────────────────────────────┐
│  NUEVA TRANSACCIÓN                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────┐ ┌───────────────┐                       │
│  │  📈 INGRESO   │ │  📉 GASTO     │  ← Selecciona tipo   │
│  │   (Activo)    │ │               │                       │
│  └───────────────┘ └───────────────┘                       │
│                                                             │
│  Descripción *                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Venta de servicios de consultoría                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Monto (₡) *          Fecha *                              │
│  ┌──────────────────┐ ┌──────────────────┐                │
│  │ ₡ 500,000        │ │ 2026-03-08       │                │
│  └──────────────────┘ └──────────────────┘                │
│                                                             │
│  Categoría            Proveedor/Cliente                    │
│  ┌──────────────────┐ ┌──────────────────┐                │
│  │ Ingresos         │ │ Cliente ABC      │                │
│  └──────────────────┘ └──────────────────┘                │
│                                                             │
│  Notas                                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Pago recibido por transferencia bancaria            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                                    [Cancelar] [💾 Guardar] │
└─────────────────────────────────────────────────────────────┘
```

**Campos obligatorios** (*):
- Descripción
- Monto
- Fecha

### Importar desde Archivo

1. Haz clic en **"📤 Subir"**
2. Arrastra o selecciona el archivo:

```
┌─────────────────────────────────────────────────────────────┐
│  PROCESAR CON IA                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │           📤 Arrastra archivos aquí                │   │
│  │              o haz clic para seleccionar           │   │
│  │                                                     │   │
│  │         [PDF] [JPG/PNG] [XLSX]                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ──────── O CONECTAR CON EMAIL ────────                    │
│                                                             │
│  ┌──────────────┐ ┌──────────────┐                         │
│  │     G        │ │      O       │                         │
│  │   Gmail      │ │   Outlook    │                         │
│  └──────────────┘ └──────────────┘                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Soportado**:
- 📄 PDF (Facturas, Recibos)
- 📊 Excel (.xlsx, .xls)
- 🖼️ Imágenes (JPG, PNG)
- 🧾 XML (Facturas electrónicas)

### Estados de Transacción

| Estado | Icono | Significado |
|--------|-------|-------------|
| **Listo** | ✅ | Transacción aprobada y reconciliada |
| **Revisión** | ⏳ | Pendiente de revisión humana |
| **Rechazado** | ❌ | Transacción rechazada |

### Acciones por Transacción

Pasa el mouse sobre una transacción para ver acciones:

```
┌────────────────────────────────────────────────────────────┐
│ 08/03 │ Venta serv. │ Ingresos │ +₡500K │  ✅  │ 👁 ✏️ 🗑️│
└────────────────────────────────────────────────────────────┘
```

| Acción | Descripción |
|--------|-------------|
| 👁️ Ver | Ver detalles completos |
| ✏️ Editar | Modificar transacción |
| 🗑️ Eliminar | Borrar transacción (⚠️ irreversible) |

---

## 📄 Ingesta de Documentos

### Preparar Archivos del Cliente

Organiza los archivos del cliente en una carpeta:

```
client-data/
└── mi-empresa/
    ├── facturas/
    │   ├── fac-001.pdf
    │   ├── fac-002.pdf
    │   └── fac-003.xml
    ├── bancos/
    │   ├── enero-2026.xlsx
    │   └── febrero-2026.xlsx
    └── recibos/
        └── recibo-luz.jpg
```

### Proceso de Ingesta

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   PASO 1    │────▶│   PASO 2    │────▶│   PASO 3    │
│   Subir     │     │   Procesar  │     │   Revisar   │
│  Archivos   │     │  con IA     │     │  Datos      │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Paso 1**: Subir archivos
- Arrastra archivos al área de carga
- O selecciona desde tu computadora

**Paso 2**: Procesamiento IA
- El sistema extrae datos automáticamente
- Reconoce fechas, montos, proveedores
- Clasifica por categoría

**Paso 3**: Revisión
- Verifica los datos extraídos
- Corrige si es necesario
- Confirma para guardar

### Tipos de Documentos Procesables

| Tipo | Extensión | Datos Extraídos |
|------|-----------|-----------------|
| **PDF** | .pdf | Texto completo, tablas, facturas |
| **Excel** | .xlsx, .xls | Filas, columnas, fórmulas |
| **CSV** | .csv | Datos tabulares |
| **XML** | .xml | Facturas electrónicas (CFDI, UBL) |
| **Imagen** | .jpg, .png | OCR de texto visible |

---

## 👥 Gestión de Clientes

### Estructura Multi-tenant

Cada cliente tiene:
- **Código único**: Ej. `ACME-2026-001`
- **Datos aislados**: Solo ve sus transacciones
- **Documentos propios**: Carpeta separada

### Crear Nuevo Cliente

```
┌─────────────────────────────────────────────────────────────┐
│  NUEVO CLIENTE                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Nombre *                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ACME Corporation                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Email                    Teléfono                         │
│  ┌──────────────────┐ ┌──────────────────┐                │
│  │ info@acme.com    │ │ +506 8888-8888   │                │
│  └──────────────────┘ └──────────────────┘                │
│                                                             │
│  Empresa                  Cédula Jurídica                  │
│  ┌──────────────────┐ ┌──────────────────┐                │
│  │ ACME Corp        │ │ 3-101-123456     │                │
│  └──────────────────┘ └──────────────────┘                │
│                                                             │
│  Dirección                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ San José, Costa Rica                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                                    [Cancelar] [💾 Guardar] │
└─────────────────────────────────────────────────────────────┘
```

### Código de Cliente

El código se genera automáticamente:

```
Formato: {PREFIX}-{AÑO}-{SECUENCIA}
Ejemplo: ACME-2026-001
```

**Usos del código**:
- Acceso al portal del cliente
- Referencia en facturas
- Organización de carpetas

---

## ❓ Preguntas Frecuentes

### General

**¿Puedo cambiar el idioma?**
> Sí, usa el selector en la esquina superior derecha (ES/EN/FR).

**¿Los datos están seguros?**
> Sí, cada cliente tiene sus datos completamente aislados.

**¿Puedo exportar mis datos?**
> Próximamente: exportación a Excel y PDF.

### Transacciones

**¿Qué es "Reconciliado"?**
> Significa que la transacción fue verificada y coincide con tu estado de cuenta bancario.

**¿Puedo editar una transacción ya creada?**
> Sí, busca la transacción y haz clic en ✏️ Editar.

**¿Qué pasa si borro una transacción?**
> Se elimina permanentemente. Se recomienda cambiar el estado a "rechazado" en lugar de borrar.

### Documentos

**¿Qué formatos de archivo soporta?**
> PDF, Excel (.xlsx, .xls), CSV, XML de facturas, imágenes (JPG, PNG).

**¿La IA siempre extrae los datos correctamente?**
> No siempre. Los documentos con buena calidad tienen mejor precisión. Siempre revisa antes de confirmar.

**¿Cuánto tiempo tarda el procesamiento?**
> Depende del tamaño y cantidad de archivos. Generalmente segundos por archivo.

### Técnico

**¿Funciona en móvil?**
> Sí, el diseño es responsive y funciona en cualquier dispositivo.

**¿Necesito instalar algo?**
> No, LedgerFlow es una aplicación web. Solo necesitas un navegador moderno.

**¿Puedo integrarlo con mi sistema actual?**
> Sí, LedgerFlow tiene API REST completa. Ver documentación técnica.

---

## 📞 Soporte

¿Necesitas ayuda adicional?

- 📧 Email: soporte@ledgerflow.com
- 💬 Chat: Disponible en la aplicación
- 📚 Docs: [Documentación completa](../README.md)

---

<div align="center">

**[← Volver al README](./LEDGERFLOW-README.md)**

</div>
