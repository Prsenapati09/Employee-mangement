# Folder structure

```text
.
├── backend/
│   ├── src/
│   │   ├── config/                 # Environment, database, and CORS
│   │   ├── modules/
│   │   │   ├── auth/               # Routes, controller, service, validation (planned)
│   │   │   ├── employees/          # Routes, controller, service, model, validation (planned)
│   │   │   ├── departments/ attendance/ leave-management/
│   │   │   ├── reports/ documents/ notifications/
│   │   │   └── organization/ users/
│   │   ├── middleware/             # Error, 404, and request logging
│   │   ├── routes/                 # API v1 and health routes
│   │   ├── utils/ types/ constants/
│   │   └── app.ts, server.ts
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   ├── postman/ bruno/
│   └── package.json
├── frontend/
│   ├── public/                      # images/, icons/, assets/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (marketing)/         # Home, features, solutions, about, contact
│   │   │   ├── (auth)/              # Login, register, forgot/reset password
│   │   │   └── (dashboard)/         # Dashboard placeholder
│   │   ├── components/              # ui/, layout/, forms/, shared/
│   │   ├── features/                # employees, departments, attendance,
│   │   │                             # leave-management, reports, documents,
│   │   │                             # notifications, organization
│   │   ├── hooks/
│   │   ├── lib/                     # api/, constants/, utils/, validations/
│   │   ├── services/ types/ config/
│   │   └── package.json
├── docs/
└── package.json
```

Frontend route groups are organizational only and do not appear in URLs. Current route entry points are placeholders; the only implemented API behavior is the health check. Empty reserved directories are created locally and can be populated as features are planned. Planned feature files are intentionally not stubbed out so there is no implication that those features exist.
