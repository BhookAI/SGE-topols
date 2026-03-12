# Diagramas del Sistema - LedgerFlow

Colección de diagramas Mermaid para visualizar la arquitectura y flujos de LedgerFlow.

---

## 1. Arquitectura General

```mermaid
graph TB
    subgraph "Presentation Layer"
        A[Next.js App Router]
        B[React Components]
        C[Tailwind CSS]
        D[shadcn/ui]
    end

    subgraph "API Layer"
        E[Route Handlers]
        F[Zod Validation]
    end

    subgraph "Business Logic"
        G[Ingest Engine]
        H[PDF Parser]
        I[Excel Parser]
        J[XML Parser]
        K[AI Processing]
    end

    subgraph "Data Layer"
        L[Prisma ORM]
        M[PostgreSQL]
    end

    A --> E
    B --> E
    E --> F
    F --> G
    G --> H
    G --> I
    G --> J
    H --> K
    I --> K
    J --> K
    K --> L
    L --> M
```

---

## 2. Flujo de Ingesta de Documentos

```mermaid
sequenceDiagram
    participant U as Usuario
    participant API as API /ingest
    participant IE as Ingest Engine
    participant CL as Clasificador
    participant PA as Parser
    participant DB as Base de Datos

    U->>API: POST /api/ingest
    API->>IE: trigger(clientId, folderPath)
    IE->>IE: scanDirectory(folderPath)
    
    loop Por cada archivo
        IE->>CL: detectFileType(file)
        CL-->>IE: fileType: PDF/Excel/XML
        
        alt PDF
            IE->>PA: PDFParser.parse(file)
        else Excel
            IE->>PA: ExcelParser.parse(file)
        else XML
            IE->>PA: XMLInvoiceParser.parse(file)
        end
        
        PA-->>IE: extractedData
        IE->>IE: validateData(extractedData)
        IE->>DB: saveTransaction(data)
        DB-->>IE: saved
    end
    
    IE-->>API: results
    API-->>U: {processedFiles, errors}
```

---

## 3. Modelo de Datos (Entidad-Relación)

```mermaid
erDiagram
    CLIENT ||--o{ TRANSACTION : has
    CLIENT ||--o{ INVOICE : has
    CLIENT ||--o{ CLIENT_DOCUMENT : has
    CLIENT ||--o{ PROJECT : has
    CLIENT ||--o{ AUDIT_LOG : generates
    
    CLIENT {
        string id PK
        string code UK
        string name
        string email
        string phone
        string company
        string taxId
        string address
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }
    
    TRANSACTION {
        string id PK
        string clientId FK
        enum type
        decimal amount
        string currency
        string description
        string category
        string subcategory
        datetime date
        string vendorName
        string reference
        boolean isReconciled
        enum status
        string source
        json metadata
        datetime createdAt
        datetime updatedAt
    }
    
    INVOICE {
        string id PK
        string clientId FK
        string uuid UK
        string folio
        string series
        string issuerName
        string issuerTaxId
        string receiverName
        string receiverTaxId
        decimal subtotal
        decimal taxAmount
        decimal total
        string currency
        datetime issueDate
        datetime certificationDate
        enum status
        string xmlContent
        string pdfPath
        datetime createdAt
        datetime updatedAt
    }
    
    CLIENT_DOCUMENT {
        string id PK
        string clientId FK
        string filename
        enum fileType
        string filePath
        int fileSize
        string extractedText
        json extractedData
        enum extractionStatus
        datetime uploadedAt
        datetime processedAt
        string errors
    }
    
    PROJECT {
        string id PK
        string clientId FK
        string name
        string description
        decimal budget
        enum status
        datetime startDate
        datetime endDate
        datetime createdAt
        datetime updatedAt
    }
    
    AUDIT_LOG {
        string id PK
        string clientId FK
        string action
        string entity
        string entityId
        json oldData
        json newData
        string performedBy
        datetime createdAt
    }
```

---

## 4. Dashboard Financiero - Flujo de Datos

```mermaid
flowchart TD
    A[Usuario abre Dashboard] --> B[Request a /api/transactions]
    B --> C{Cache disponible?}
    
    C -->|Sí| D[Retornar datos cacheados]
    C -->|No| E[Query a PostgreSQL]
    
    E --> F[Prisma ORM]
    F --> G[Base de Datos]
    G --> F
    F --> H[Calcular métricas]
    
    H --> I[Income Total]
    H --> J[Expenses Total]
    H --> K[Balance]
    H --> L[Tendencias]
    H --> M[Categorías]
    
    I --> N[API Response]
    J --> N
    K --> N
    L --> N
    M --> N
    D --> N
    
    N --> O[React Components]
    O --> P[Recharts]
    
    P --> Q[Area Chart - Flujo]
    P --> R[Pie Chart - Categorías]
    
    Q --> S[Render UI]
    R --> S
```

---

## 5. Autenticación y Autorización (Futuro)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant APP as Next.js App
    participant AUTH as NextAuth.js
    participant JWT as JWT Service
    participant API as API Routes
    participant DB as Database

    U->>APP: Login con credenciales
    APP->>AUTH: signIn(credentials)
    AUTH->>DB: verifyUser(email, password)
    DB-->>AUTH: user + clientId
    AUTH->>JWT: createToken(user)
    JWT-->>AUTH: JWT Token
    AUTH-->>APP: Session + Token
    APP-->>U: Autenticado

    U->>API: Request con Bearer Token
    API->>JWT: verifyToken(token)
    JWT-->>API: {userId, clientId}
    API->>DB: query({where: {clientId}})
    DB-->>API: Data filtrada
    API-->>U: Response
```

---

## 6. Pipeline de Procesamiento de Documentos

```mermaid
flowchart LR
    A[Archivo Subido] --> B{Clasificar Tipo}
    
    B -->|PDF| C[PDF Parser]
    B -->|Excel| D[Excel Parser]
    B -->|XML| E[XML Parser]
    B -->|Imagen| F[OCR Engine]
    
    C --> G[Extraer Texto]
    D --> H[Leer Filas/Cols]
    E --> I[Parse XML]
    F --> J[Reconocer Texto]
    
    G --> K[IA NLP]
    H --> K
    I --> L[Validar Schema]
    J --> K
    
    K --> M{Datos Válidos?}
    L --> M
    
    M -->|Sí| N[Crear Transacción]
    M -->|No| O[Marcar Error]
    
    N --> P[Guardar en DB]
    O --> Q[Log de Error]
    
    P --> R[Retornar Éxito]
    Q --> R
```

---

## 7. Estructura del Proyecto

```mermaid
graph TD
    Root[ledgerflow/] --> Apps[apps/]
    Root --> ClientData[client-data/]
    Root --> Config[Config files]
    
    Apps --> Web[web/]
    Web --> App[app/]
    Web --> Components[components/]
    Web --> Lib[lib/]
    Web --> Prisma[prisma/]
    Web --> Scripts[scripts/]
    
    App --> Api[api/]
    App --> Dashboard[dashboard/]
    App --> Layout[layout.tsx]
    
    Api --> Transactions[transactions/]
    Api --> Clients[clients/]
    Api --> Ingest[ingest/]
    
    Dashboard --> Finances[finances/]
    
    Components --> UI[ui/]
    Components --> LayoutC[layout/]
    
    Lib --> Utils[utils.ts]
    Lib --> I18N[i18n/]
    
    Scripts --> IngestS[ingest.ts]
    Scripts --> Parsers[parsers/]
    
    Parsers --> PDF[pdf-parser.ts]
    Parsers --> Excel[excel-parser.ts]
    Parsers --> XML[xml-invoice-parser.ts]
    
    ClientData --> Client1[[client-1/]]
    ClientData --> Client2[[client-2/]]
```

---

## 8. Escalabilidad - Roadmap Arquitectura

```mermaid
graph TB
    subgraph "Fase 1: Actual"
        F1_A[Next.js Monolito]
        F1_B[PostgreSQL]
        F1_A --> F1_B
    end

    subgraph "Fase 2: Caching"
        F2_A[Next.js]
        F2_B[Redis Cache]
        F2_C[PostgreSQL]
        F2_A --> F2_B
        F2_B --> F2_C
        F2_A -.-> F2_C
    end

    subgraph "Fase 3: Colas"
        F3_A[Next.js]
        F3_B[Redis Queue]
        F3_C[Workers]
        F3_D[PostgreSQL]
        F3_A --> F3_B
        F3_B --> F3_C
        F3_C --> F3_D
    end

    subgraph "Fase 4: Microservicios"
        F4_A[API Gateway]
        F4_B[Auth Service]
        F4_C[Ingest Service]
        F4_D[Finance Service]
        F4_E[(PostgreSQL)]
        F4_F[(Redis)]
        
        F4_A --> F4_B
        F4_A --> F4_C
        F4_A --> F4_D
        F4_B --> F4_E
        F4_C --> F4_E
        F4_D --> F4_E
        F4_C --> F4_F
    end

    F1_A -.-> F2_A
    F2_A -.-> F3_A
    F3_A -.-> F4_A
```

---

## 9. Seguridad - Multi-tenancy

```mermaid
flowchart TD
    subgraph "Request"
        A[Usuario] --> B[API Request]
        B --> C[Headers: clientId]
    end

    subgraph "Validation"
        C --> D{Validar Cliente}
        D -->|Existe| E[Cliente Válido]
        D -->|No Existe| F[Error 404]
    end

    subgraph "Query"
        E --> G[Prisma Query]
        G --> H["WHERE clientId = 'xxx'"]
    end

    subgraph "Isolation"
        H --> I[Cliente A]
        H --> J[Cliente B]
        H --> K[Cliente C]
        
        I --> L[Datos A]
        J --> M[Datos B]
        K --> N[Datos C]
    end

    subgraph "Response"
        L --> O[Solo datos del cliente]
        M --> O
        N --> O
    end

    style F fill:#ff6b6b
    style O fill:#51cf66
```

---

## Cómo Ver estos Diagramas

Estos diagramas usan la sintaxis **Mermaid**. Para visualizarlos:

1. **VS Code**: Instalar extensión "Markdown Preview Mermaid Support"
2. **GitHub**: Se renderizan automáticamente en archivos .md
3. **Mermaid Live Editor**: https://mermaid.live
4. **Obsidian**: Soporte nativo con plugin Mermaid

---

<div align="center">

**[← Volver al README](./LEDGERFLOW-README.md)**

</div>
