# 📚 Documentación LedgerFlow

Bienvenido a la documentación oficial de LedgerFlow.

---

## 📖 Guías Principales

| Documento | Descripción | Público |
|-----------|-------------|---------|
| [README](./LEDGERFLOW-README.md) | Visión general, features, instalación rápida | Todos |
| [Guía de Instalación](./INSTALLATION.md) | Instalación detallada paso a paso | Desarrolladores |
| [Guía de Usuario](./USER-GUIDE.md) | Cómo usar la aplicación | Usuarios finales |
| [API Reference](./API.md) | Documentación completa de la API | Desarrolladores |
| [Arquitectura](./ARCHITECTURE.md) | Diseño técnico del sistema | Desarrolladores |

---

## 📊 Recursos Visuales

| Documento | Descripción |
|-----------|-------------|
| [Diagramas](./DIAGRAMS.md) | Diagramas Mermaid de arquitectura y flujos |
| [Screenshots](./SCREENSHOTS.md) | Descripción visual de las pantallas |

---

## 🔄 Historial

| Documento | Descripción |
|-----------|-------------|
| [Changelog](./CHANGELOG.md) | Historial de cambios y versiones |

---

## 🎯 Por dónde empezar

### Si eres usuario final
→ [Guía de Usuario](./USER-GUIDE.md)

### Si eres desarrollador
1. [README](./LEDGERFLOW-README.md) - Visión general
2. [Guía de Instalación](./INSTALLATION.md) - Setup
3. [Arquitectura](./ARCHITECTURE.md) - Entender el sistema
4. [API Reference](./API.md) - Integrar

### Si eres DevOps
→ [Guía de Instalación](./INSTALLATION.md) + [Arquitectura](./ARCHITECTURE.md)

---

## 🏗️ Arquitectura Rápida

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION                              │
│  Next.js + React + TypeScript + Tailwind + shadcn/ui       │
├─────────────────────────────────────────────────────────────┤
│                       API                                    │
│  Route Handlers + Zod Validation                           │
├─────────────────────────────────────────────────────────────┤
│                 BUSINESS LOGIC                               │
│  Parsers (PDF/Excel/XML) + Ingest Engine + AI Processing   │
├─────────────────────────────────────────────────────────────┤
│                      DATA                                    │
│  Prisma ORM + PostgreSQL                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🆘 Soporte

¿Necesitas ayuda?

- 📧 Email: soporte@ledgerflow.com
- 🐛 Issues: [GitHub Issues](https://github.com/BhookAI/ledgerflow/issues)
- 💬 Discusiones: [GitHub Discussions](https://github.com/BhookAI/ledgerflow/discussions)

---

<div align="center">

**[← Volver al README](./LEDGERFLOW-README.md)**

</div>
