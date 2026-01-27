# Sistema de Permisos - Diagramas de Flujo

## Tabla de Contenidos

1. [Jerarquía de Niveles](#1-jerarquía-de-niveles)
2. [Flujo de Creación de Usuarios](#2-flujo-de-creación-de-usuarios)
3. [Flujo de Gestión de Usuarios](#3-flujo-de-gestión-de-usuarios)
4. [Flujo de Visibilidad de Datos](#4-flujo-de-visibilidad-de-datos)
5. [Flujo de Permisos de Contactos](#5-flujo-de-permisos-de-contactos)
6. [Flujo de Gestión de Equipos](#6-flujo-de-gestión-de-equipos)
7. [Matriz de Referencia Rápida](#7-matriz-de-referencia-rápida)

---

## 1. Jerarquía de Niveles

### 1.1 Estructura de Niveles

```mermaid
flowchart TD
    L1[Level 1: Super Admin]
    L2[Level 2: Team Leader]
    L3[Level 3: Supervisor]
    L4[Level 4: Sales Representative]

    L1 -->|Puede crear| L2
    L1 -->|Puede crear| L3
    L1 -->|Puede crear| L4
    L2 -->|Puede crear| L3
    L2 -->|Puede crear| L4
    L3 -->|Puede crear| L4

    style L1 fill:#10b981,stroke:#059669,color:#fff
    style L2 fill:#3b82f6,stroke:#2563eb,color:#fff
    style L3 fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style L4 fill:#f59e0b,stroke:#d97706,color:#fff
```

### 1.2 Relaciones de Reporte Permitidas

```mermaid
flowchart TD
    Start([Usuario nuevo])
    CheckLevel{Nivel del<br/>usuario?}

    Start --> CheckLevel

    CheckLevel -->|Level 1| NoManager[❌ NO puede tener manager]
    CheckLevel -->|Level 2| NoManagerOpt[❌ NO puede tener manager]
    CheckLevel -->|Level 3| MustL2[✅ DEBE tener manager Level 2]
    CheckLevel -->|Level 4| MustL2L3[✅ DEBE tener manager Level 2 o 3]

    NoManager --> NoTeam[❌ NO puede tener team]
    NoManagerOpt --> OptTeam[⚠️ Team opcional]
    MustL2 --> MustTeam[✅ DEBE tener team]
    MustL2L3 --> MustTeamSame[✅ DEBE tener team<br/>mismo que manager]

    style NoManager fill:#ef4444,stroke:#dc2626,color:#fff
    style NoManagerOpt fill:#ef4444,stroke:#dc2626,color:#fff
    style MustL2 fill:#10b981,stroke:#059669,color:#fff
    style MustL2L3 fill:#10b981,stroke:#059669,color:#fff
    style NoTeam fill:#ef4444,stroke:#dc2626,color:#fff
    style OptTeam fill:#f59e0b,stroke:#d97706,color:#fff
    style MustTeam fill:#10b981,stroke:#059669,color:#fff
    style MustTeamSame fill:#10b981,stroke:#059669,color:#fff
```

---

## 2. Flujo de Creación de Usuarios

### 2.1 ¿Puede crear usuario de nivel X?

```mermaid
flowchart TD
    Start([Usuario quiere crear<br/>nuevo usuario])
    CheckCreator{Nivel del<br/>creador?}

    Start --> CheckCreator

    CheckCreator -->|Level 1| CanCreateAll{Nivel a<br/>crear?}
    CheckCreator -->|Level 2| CanCreate34{Nivel a<br/>crear?}
    CheckCreator -->|Level 3| CanCreate4{Nivel a<br/>crear?}
    CheckCreator -->|Level 4| Denied1[❌ DENEGADO<br/>No puede crear usuarios]

    CanCreateAll -->|1, 2, 3, 4| Allowed1[✅ PERMITIDO]

    CanCreate34 -->|3 o 4| Allowed2[✅ PERMITIDO]
    CanCreate34 -->|1 o 2| Denied2[❌ DENEGADO<br/>Solo puede crear 3 y 4]

    CanCreate4 -->|4| Allowed3[✅ PERMITIDO]
    CanCreate4 -->|1, 2, 3| Denied3[❌ DENEGADO<br/>Solo puede crear 4]

    Allowed1 --> ValidateManager[Validar manager assignment]
    Allowed2 --> ValidateManager
    Allowed3 --> ValidateManager

    style Denied1 fill:#ef4444,stroke:#dc2626,color:#fff
    style Denied2 fill:#ef4444,stroke:#dc2626,color:#fff
    style Denied3 fill:#ef4444,stroke:#dc2626,color:#fff
    style Allowed1 fill:#10b981,stroke:#059669,color:#fff
    style Allowed2 fill:#10b981,stroke:#059669,color:#fff
    style Allowed3 fill:#10b981,stroke:#059669,color:#fff
```

### 2.2 Validación de Manager Assignment

```mermaid
flowchart TD
    Start([Validar manager<br/>assignment])
    CheckLevel{Nivel del<br/>nuevo usuario?}

    Start --> CheckLevel

    CheckLevel -->|Level 1| HasManager1{Tiene<br/>manager?}
    CheckLevel -->|Level 2| HasManager2{Tiene<br/>manager?}
    CheckLevel -->|Level 3| HasManager3{Tiene<br/>manager?}
    CheckLevel -->|Level 4| HasManager4{Tiene<br/>manager?}

    HasManager1 -->|Sí| Error1[❌ ERROR<br/>Level 1 NO debe tener manager]
    HasManager1 -->|No| ValidateTeam1[Validar team assignment]

    HasManager2 -->|Sí| Error2[❌ ERROR<br/>Level 2 NO debe tener manager]
    HasManager2 -->|No| ValidateTeam2[Validar team assignment]

    HasManager3 -->|No| Error3[❌ ERROR<br/>Level 3 DEBE tener manager]
    HasManager3 -->|Sí| CheckManagerLevel3{Manager es<br/>Level 2?}

    HasManager4 -->|No| Error4[❌ ERROR<br/>Level 4 DEBE tener manager]
    HasManager4 -->|Sí| CheckManagerLevel4{Manager es<br/>Level 2 o 3?}

    CheckManagerLevel3 -->|Sí| CheckNotSelf3{Manager es<br/>el mismo?}
    CheckManagerLevel3 -->|No| Error5[❌ ERROR<br/>Manager debe ser Level 2]

    CheckManagerLevel4 -->|Sí| CheckSameTeam4{Manager tiene<br/>mismo team?}
    CheckManagerLevel4 -->|No| Error6[❌ ERROR<br/>Manager debe ser Level 2 o 3]

    CheckNotSelf3 -->|No| ValidateTeam3[Validar team assignment]
    CheckNotSelf3 -->|Sí| Error7[❌ ERROR<br/>No puede ser su propio manager]

    CheckSameTeam4 -->|Sí| CheckNotSelf4{Manager es<br/>el mismo?}
    CheckSameTeam4 -->|No| Error8[❌ ERROR<br/>Manager debe tener mismo team]

    CheckNotSelf4 -->|No| ValidateTeam4[Validar team assignment]
    CheckNotSelf4 -->|Sí| Error9[❌ ERROR<br/>No puede ser su propio manager]

    style Error1 fill:#ef4444,stroke:#dc2626,color:#fff
    style Error2 fill:#ef4444,stroke:#dc2626,color:#fff
    style Error3 fill:#ef4444,stroke:#dc2626,color:#fff
    style Error4 fill:#ef4444,stroke:#dc2626,color:#fff
    style Error5 fill:#ef4444,stroke:#dc2626,color:#fff
    style Error6 fill:#ef4444,stroke:#dc2626,color:#fff
    style Error7 fill:#ef4444,stroke:#dc2626,color:#fff
    style Error8 fill:#ef4444,stroke:#dc2626,color:#fff
    style Error9 fill:#ef4444,stroke:#dc2626,color:#fff
```

### 2.3 Validación de Team Assignment

```mermaid
flowchart TD
    Start([Validar team<br/>assignment])
    CheckLevel{Nivel del<br/>nuevo usuario?}

    Start --> CheckLevel

    CheckLevel -->|Level 1| HasTeam1{Tiene<br/>team?}
    CheckLevel -->|Level 2| Success2[✅ VÁLIDO<br/>Team opcional]
    CheckLevel -->|Level 3| HasTeam3{Tiene<br/>team?}
    CheckLevel -->|Level 4| HasTeam4{Tiene<br/>team?}

    HasTeam1 -->|Sí| Error1[❌ ERROR<br/>Level 1 NO debe tener team]
    HasTeam1 -->|No| Success1[✅ VÁLIDO<br/>Usuario creado]

    HasTeam3 -->|No| Error3[❌ ERROR<br/>Level 3 DEBE tener team]
    HasTeam3 -->|Sí| Success3[✅ VÁLIDO<br/>Usuario creado]

    HasTeam4 -->|No| Error4[❌ ERROR<br/>Level 4 DEBE tener team]
    HasTeam4 -->|Sí| Success4[✅ VÁLIDO<br/>Usuario creado]

    style Error1 fill:#ef4444,stroke:#dc2626,color:#fff
    style Error3 fill:#ef4444,stroke:#dc2626,color:#fff
    style Error4 fill:#ef4444,stroke:#dc2626,color:#fff
    style Success1 fill:#10b981,stroke:#059669,color:#fff
    style Success2 fill:#10b981,stroke:#059669,color:#fff
    style Success3 fill:#10b981,stroke:#059669,color:#fff
    style Success4 fill:#10b981,stroke:#059669,color:#fff
```

---

## 3. Flujo de Gestión de Usuarios

### 3.1 ¿Puede editar usuario?

```mermaid
flowchart TD
    Start([Usuario quiere<br/>editar otro usuario])
    IsSelf{Es el<br/>mismo usuario?}

    Start --> IsSelf

    IsSelf -->|Sí| CanEdit1[✅ PERMITIDO<br/>Puede editar sus propios datos]
    IsSelf -->|No| CheckEditor{Nivel del<br/>editor?}

    CheckEditor -->|Level 1| CanEdit2[✅ PERMITIDO<br/>Super Admin puede editar a todos]
    CheckEditor -->|Level 2| CheckTarget2{Usuario objetivo<br/>es Level 3 o 4?}
    CheckEditor -->|Level 3| Denied1[❌ DENEGADO<br/>Level 3 no puede editar otros]
    CheckEditor -->|Level 4| Denied2[❌ DENEGADO<br/>Level 4 no puede editar otros]

    CheckTarget2 -->|Sí| IsSubordinate{Es su<br/>subordinado?}
    CheckTarget2 -->|No| Denied3[❌ DENEGADO<br/>Solo puede editar Level 3 y 4]

    IsSubordinate -->|Sí| CanEdit3[✅ PERMITIDO<br/>Puede editar subordinados]
    IsSubordinate -->|No| Denied4[❌ DENEGADO<br/>Solo puede editar sus subordinados]

    style CanEdit1 fill:#10b981,stroke:#059669,color:#fff
    style CanEdit2 fill:#10b981,stroke:#059669,color:#fff
    style CanEdit3 fill:#10b981,stroke:#059669,color:#fff
    style Denied1 fill:#ef4444,stroke:#dc2626,color:#fff
    style Denied2 fill:#ef4444,stroke:#dc2626,color:#fff
    style Denied3 fill:#ef4444,stroke:#dc2626,color:#fff
    style Denied4 fill:#ef4444,stroke:#dc2626,color:#fff
```

### 3.2 ¿Puede eliminar usuario?

```mermaid
flowchart TD
    Start([Usuario quiere<br/>eliminar otro usuario])
    CheckDeleter{Nivel del<br/>que elimina?}

    Start --> CheckDeleter

    CheckDeleter -->|Level 1| CanDelete1[✅ PERMITIDO<br/>Super Admin puede eliminar a todos]
    CheckDeleter -->|Level 2| CheckTarget2{Usuario objetivo<br/>es Level 3 o 4?}
    CheckDeleter -->|Level 3| Denied1[❌ DENEGADO<br/>No puede eliminar usuarios]
    CheckDeleter -->|Level 4| Denied2[❌ DENEGADO<br/>No puede eliminar usuarios]

    CheckTarget2 -->|Sí| IsSubordinate{Es su<br/>subordinado?}
    CheckTarget2 -->|No| Denied3[❌ DENEGADO<br/>Solo puede eliminar Level 3 y 4]

    IsSubordinate -->|Sí| CanDelete2[✅ PERMITIDO<br/>Puede eliminar subordinados]
    IsSubordinate -->|No| Denied4[❌ DENEGADO<br/>Solo puede eliminar sus subordinados]

    style CanDelete1 fill:#10b981,stroke:#059669,color:#fff
    style CanDelete2 fill:#10b981,stroke:#059669,color:#fff
    style Denied1 fill:#ef4444,stroke:#dc2626,color:#fff
    style Denied2 fill:#ef4444,stroke:#dc2626,color:#fff
    style Denied3 fill:#ef4444,stroke:#dc2626,color:#fff
    style Denied4 fill:#ef4444,stroke:#dc2626,color:#fff
```

### 3.3 Función canManageUser()

```mermaid
flowchart TD
    Start([canManageUser<br/>currentUser, targetLevel])
    CheckCurrent{currentUser.level?}

    Start --> CheckCurrent

    CheckCurrent -->|Level 1| Return1[✅ return true<br/>Puede gestionar cualquier nivel]
    CheckCurrent -->|Level 2| CheckTarget{targetLevel es<br/>3 o 4?}
    CheckCurrent -->|Level 3| Return2[❌ return false<br/>No puede gestionar]
    CheckCurrent -->|Level 4| Return3[❌ return false<br/>No puede gestionar]

    CheckTarget -->|Sí| Return4[✅ return true<br/>Puede gestionar 3 y 4]
    CheckTarget -->|No| Return5[❌ return false<br/>No puede gestionar 1 y 2]

    style Return1 fill:#10b981,stroke:#059669,color:#fff
    style Return4 fill:#10b981,stroke:#059669,color:#fff
    style Return2 fill:#ef4444,stroke:#dc2626,color:#fff
    style Return3 fill:#ef4444,stroke:#dc2626,color:#fff
    style Return5 fill:#ef4444,stroke:#dc2626,color:#fff
```

---

## 4. Flujo de Visibilidad de Datos

### 4.1 Visibilidad de Usuarios

```mermaid
flowchart TD
    Start([getUsersByLevel<br/>currentUser])
    CheckLevel{currentUser.level?}

    Start --> CheckLevel

    CheckLevel -->|Level 1| AllUsers[📋 Ver TODOS los usuarios<br/>Sin restricciones]
    CheckLevel -->|Level 2| TeamView[📋 Ver:<br/>- Sí mismo<br/>- Todos sus subordinados recursivos<br/>- Usuarios del mismo team]
    CheckLevel -->|Level 3| SelfSubs[📋 Ver:<br/>- Sí mismo<br/>- Sus subordinados directos Level 4]
    CheckLevel -->|Level 4| OnlySelf[📋 Ver:<br/>- Solo sí mismo]

    AllUsers --> Result1[🟢 Lista completa]
    TeamView --> Result2[🟡 Lista filtrada por team/jerarquía]
    SelfSubs --> Result3[🟡 Lista filtrada: self + Level 4]
    OnlySelf --> Result4[🔵 Solo registro propio]

    style AllUsers fill:#10b981,stroke:#059669,color:#fff
    style TeamView fill:#3b82f6,stroke:#2563eb,color:#fff
    style SelfSubs fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style OnlySelf fill:#f59e0b,stroke:#d97706,color:#fff
```

### 4.2 Visibilidad de Deals

```mermaid
flowchart TD
    Start([GET /api/deals<br/>currentUser])
    CheckLevel{currentUser.level?}

    Start --> CheckLevel

    CheckLevel -->|Level 1| HasFilter1{Query param<br/>teamId?}
    CheckLevel -->|Level 2| TeamDeals[📊 Ver deals de:<br/>- Miembros de su team<br/>- Subordinados]
    CheckLevel -->|Level 3| OwnDeals1[📊 Ver solo:<br/>- Sus propios deals]
    CheckLevel -->|Level 4| OwnDeals2[📊 Ver solo:<br/>- Sus propios deals]

    HasFilter1 -->|Sí| FilteredDeals[📊 Ver deals del team especificado]
    HasFilter1 -->|No| AllDeals[📊 Ver TODOS los deals]

    AllDeals --> Result1[🟢 Lista completa sin filtro]
    FilteredDeals --> Result2[🟢 Lista filtrada por team]
    TeamDeals --> Result3[🟡 Lista filtrada por team]
    OwnDeals1 --> Result4[🔵 Solo deals propios]
    OwnDeals2 --> Result5[🔵 Solo deals propios]

    style AllDeals fill:#10b981,stroke:#059669,color:#fff
    style FilteredDeals fill:#10b981,stroke:#059669,color:#fff
    style TeamDeals fill:#3b82f6,stroke:#2563eb,color:#fff
    style OwnDeals1 fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style OwnDeals2 fill:#f59e0b,stroke:#d97706,color:#fff
```

### 4.3 Visibilidad de Contactos - Datos Sensibles

```mermaid
flowchart TD
    Start([GET /api/contacts/:id<br/>currentUser])
    CheckLevel{currentUser.level?}

    Start --> CheckLevel

    CheckLevel -->|Level 1| ShowAll[🔓 Mostrar TODOS los campos<br/>Acceso implícito]
    CheckLevel -->|Level 2-4| CheckPerm{Existe permiso en<br/>contactPermissions?}

    CheckPerm -->|Sí| ShowAll2[🔓 Mostrar todos los campos:<br/>- email<br/>- phone<br/>- position<br/>- notes]
    CheckPerm -->|No| MaskFields[🔒 Enmascarar campos sensibles:<br/>- email: ***<br/>- phone: ***<br/>- position: ***<br/>- notes: ***]

    ShowAll --> Result1[🟢 Contacto completo]
    ShowAll2 --> Result2[🟢 Contacto completo]
    MaskFields --> Result3[⚠️ Contacto parcial<br/>+ Opción de solicitar acceso]

    style ShowAll fill:#10b981,stroke:#059669,color:#fff
    style ShowAll2 fill:#10b981,stroke:#059669,color:#fff
    style MaskFields fill:#f59e0b,stroke:#d97706,color:#fff
```

---

## 5. Flujo de Permisos de Contactos

### 5.1 Ciclo Completo de Solicitud de Acceso

```mermaid
flowchart TD
    Start([Usuario Level 2-4<br/>intenta ver contacto])
    CheckPerm{Tiene permiso<br/>en DB?}

    Start --> CheckPerm

    CheckPerm -->|Sí| ShowFull[🟢 Mostrar contacto completo]
    CheckPerm -->|No| ShowMasked[⚠️ Mostrar contacto enmascarado]

    ShowMasked --> UserAction{Usuario<br/>hace click en<br/>"Solicitar acceso"}

    UserAction -->|Sí| CreateRequest[📝 POST /api/contact-access-requests<br/>Crear solicitud]
    UserAction -->|No| End1[Fin - Sin acceso]

    CreateRequest --> SaveRequest[(Guardar en DB:<br/>contactAccessRequests<br/>status: pending)]

    SaveRequest --> Notification[🔔 Notificar a Super Admins<br/>Level 1]

    Notification --> AdminReview[👤 Super Admin revisa solicitud<br/>en página /solicitudes]

    AdminReview --> AdminDecision{Decisión del<br/>Admin?}

    AdminDecision -->|Aprobar| Approve[✅ PATCH request<br/>status: approved]
    AdminDecision -->|Rechazar| Reject[❌ PATCH request<br/>status: rejected]

    Approve --> CreatePermission[(Crear registro en:<br/>contactPermissions<br/>userId + contactId)]

    CreatePermission --> NotifyApproved[🔔 Notificar al usuario<br/>Acceso concedido]

    Reject --> NotifyRejected[🔔 Notificar al usuario<br/>Acceso denegado]

    NotifyApproved --> UserRefresh[Usuario recarga contacto]

    UserRefresh --> ShowFull2[🟢 Mostrar contacto completo<br/>email, phone, position, notes]

    NotifyRejected --> End2[Fin - Sin acceso]

    style ShowFull fill:#10b981,stroke:#059669,color:#fff
    style ShowFull2 fill:#10b981,stroke:#059669,color:#fff
    style ShowMasked fill:#f59e0b,stroke:#d97706,color:#fff
    style CreatePermission fill:#10b981,stroke:#059669,color:#fff
    style Approve fill:#10b981,stroke:#059669,color:#fff
    style Reject fill:#ef4444,stroke:#dc2626,color:#fff
```

### 5.2 Verificación de Permisos en API

```mermaid
flowchart TD
    Start([API recibe request<br/>GET /api/contacts/:id])
    GetUser[Obtener currentUser<br/>de sesión]

    Start --> GetUser

    GetUser --> CheckLevel{currentUser.level?}

    CheckLevel -->|Level 1| QueryContact[📊 Query contact<br/>de base de datos]
    CheckLevel -->|Level 2-4| QueryPermission{Buscar en<br/>contactPermissions<br/>userId + contactId?}

    QueryPermission -->|Encontrado| QueryContact
    QueryPermission -->|No encontrado| QueryContact

    QueryContact --> ApplyMask{currentUser.level === 1<br/>OR<br/>existe permiso?}

    ApplyMask -->|Sí| ReturnFull[return {<br/>  email: actual<br/>  phone: actual<br/>  position: actual<br/>  notes: actual<br/>}]

    ApplyMask -->|No| ReturnMasked[return {<br/>  email: '***'<br/>  phone: '***'<br/>  position: '***'<br/>  notes: '***'<br/>}]

    style ReturnFull fill:#10b981,stroke:#059669,color:#fff
    style ReturnMasked fill:#f59e0b,stroke:#d97706,color:#fff
```

---

## 6. Flujo de Gestión de Equipos

### 6.1 ¿Puede crear teams?

```mermaid
flowchart TD
    Start([Usuario quiere<br/>crear nuevo team])
    CheckCreator{Nivel del<br/>usuario?}

    Start --> CheckCreator

    CheckCreator -->|Level 1| CanCreate1[✅ PERMITIDO<br/>Super Admin puede crear teams]
    CheckCreator -->|Level 2| CanCreate2[✅ PERMITIDO<br/>Team Leader puede crear teams]
    CheckCreator -->|Level 3| Denied1[❌ DENEGADO<br/>Level 3 no puede crear teams]
    CheckCreator -->|Level 4| Denied2[❌ DENEGADO<br/>Level 4 no puede crear teams]

    CanCreate1 --> CreateTeam[POST /api/teams<br/>Crear team en DB]
    CanCreate2 --> CreateTeam

    CreateTeam --> Success[🟢 Team creado exitosamente]

    style CanCreate1 fill:#10b981,stroke:#059669,color:#fff
    style CanCreate2 fill:#10b981,stroke:#059669,color:#fff
    style Denied1 fill:#ef4444,stroke:#dc2626,color:#fff
    style Denied2 fill:#ef4444,stroke:#dc2626,color:#fff
    style Success fill:#10b981,stroke:#059669,color:#fff
```

### 6.2 Asignación de Equipos a Usuarios

```mermaid
flowchart TD
    Start([Asignar team<br/>a usuario])
    CheckUserLevel{Nivel del<br/>usuario?}

    Start --> CheckUserLevel

    CheckUserLevel -->|Level 1| Prohibited1[❌ PROHIBIDO<br/>Level 1 NO puede tener team]
    CheckUserLevel -->|Level 2| Optional[⚠️ OPCIONAL<br/>Puede o no tener team]
    CheckUserLevel -->|Level 3| Required1[✅ REQUERIDO<br/>DEBE tener team]
    CheckUserLevel -->|Level 4| Required2[✅ REQUERIDO<br/>DEBE tener team]

    Required1 --> ValidateManagerTeam{Manager tiene<br/>team asignado?}
    Required2 --> ValidateManagerTeam2{Manager tiene<br/>team asignado?}

    ValidateManagerTeam -->|Sí| SameTeam{Team es el mismo<br/>que el manager?}
    ValidateManagerTeam -->|No| Error1[❌ ERROR<br/>Manager debe tener team]

    ValidateManagerTeam2 -->|Sí| SameTeam2{Team es el mismo<br/>que el manager?}
    ValidateManagerTeam2 -->|No| Error2[❌ ERROR<br/>Manager debe tener team]

    SameTeam -->|Sí| Success1[✅ VÁLIDO<br/>Team asignado]
    SameTeam -->|No| Error3[❌ ERROR<br/>Team debe coincidir con manager]

    SameTeam2 -->|Sí| Success2[✅ VÁLIDO<br/>Team asignado]
    SameTeam2 -->|No| Error4[❌ ERROR<br/>Team debe coincidir con manager]

    Optional --> Success3[✅ VÁLIDO<br/>Team asignado]

    style Prohibited1 fill:#ef4444,stroke:#dc2626,color:#fff
    style Optional fill:#f59e0b,stroke:#d97706,color:#fff
    style Required1 fill:#10b981,stroke:#059669,color:#fff
    style Required2 fill:#10b981,stroke:#059669,color:#fff
    style Success1 fill:#10b981,stroke:#059669,color:#fff
    style Success2 fill:#10b981,stroke:#059669,color:#fff
    style Success3 fill:#10b981,stroke:#059669,color:#fff
    style Error1 fill:#ef4444,stroke:#dc2626,color:#fff
    style Error2 fill:#ef4444,stroke:#dc2626,color:#fff
    style Error3 fill:#ef4444,stroke:#dc2626,color:#fff
    style Error4 fill:#ef4444,stroke:#dc2626,color:#fff
```

---

## 7. Matriz de Referencia Rápida

### 7.1 Capacidades por Nivel

| Capacidad | Level 1<br/>Super Admin | Level 2<br/>Team Leader | Level 3<br/>Supervisor | Level 4<br/>Sales Rep |
|-----------|------------------------|------------------------|----------------------|---------------------|
| **Creación de Usuarios** |
| Crear Level 1 | ✅ Sí | ❌ No | ❌ No | ❌ No |
| Crear Level 2 | ✅ Sí | ❌ No | ❌ No | ❌ No |
| Crear Level 3 | ✅ Sí | ✅ Sí | ❌ No | ❌ No |
| Crear Level 4 | ✅ Sí | ✅ Sí | ✅ Sí | ❌ No |
| **Gestión de Usuarios** |
| Editar cualquier usuario | ✅ Sí | ❌ No | ❌ No | ❌ No |
| Editar subordinados | ✅ Sí | ✅ Sí (L3/L4) | ❌ No | ❌ No |
| Editar propios datos | ✅ Sí | ✅ Sí | ✅ Sí | ✅ Sí |
| Eliminar usuarios | ✅ Sí | ✅ Sí (L3/L4) | ❌ No | ❌ No |
| **Visibilidad de Usuarios** |
| Ver todos los usuarios | ✅ Sí | ❌ No | ❌ No | ❌ No |
| Ver team + subordinados | ✅ Sí | ✅ Sí | ❌ No | ❌ No |
| Ver subordinados directos | ✅ Sí | ✅ Sí | ✅ Sí (L4) | ❌ No |
| Ver solo a sí mismo | ✅ Sí | ✅ Sí | ✅ Sí | ✅ Sí |
| **Visibilidad de Deals** |
| Ver todos los deals | ✅ Sí | ❌ No | ❌ No | ❌ No |
| Ver deals por team | ✅ Sí (filtrable) | ✅ Sí (su team) | ❌ No | ❌ No |
| Ver solo propios deals | ✅ Sí | ✅ Sí | ✅ Sí | ✅ Sí |
| **Permisos de Contactos** |
| Acceso implícito a todos | ✅ Sí | ❌ No | ❌ No | ❌ No |
| Requiere permiso explícito | ❌ No | ✅ Sí | ✅ Sí | ✅ Sí |
| Solicitar acceso a contacto | ❌ N/A | ✅ Sí | ✅ Sí | ✅ Sí |
| Aprobar solicitudes acceso | ✅ Sí | ❌ No | ❌ No | ❌ No |
| Ver contactos enmascarados | ❌ No | ✅ Sí | ✅ Sí | ✅ Sí |
| **Gestión de Equipos** |
| Crear teams | ✅ Sí | ✅ Sí | ❌ No | ❌ No |
| Editar teams | ✅ Sí | ✅ Sí | ❌ No | ❌ No |
| Ver todos los teams | ✅ Sí | ✅ Sí | ⚠️ Limitado | ⚠️ Limitado |
| **Restricciones de Estructura** |
| Debe tener manager | ❌ No | ❌ No | ✅ Sí (L2) | ✅ Sí (L2/L3) |
| Debe tener team | ❌ No | ⚠️ Opcional | ✅ Sí | ✅ Sí |
| Puede tener subordinados | ✅ Sí | ✅ Sí | ✅ Sí (L4) | ❌ No |
| **Funcionalidades Especiales** |
| Acceso a /solicitudes | ✅ Sí | ❌ No | ❌ No | ❌ No |
| Gestión de branding | ✅ Sí | ❌ No | ❌ No | ❌ No |
| Gestión de currency | ✅ Sí | ❌ No | ❌ No | ❌ No |
| Impersonation | ✅ Sí | ❌ No | ❌ No | ❌ No |

### 7.2 Función de Referencia Rápida: getAvailableLevels()

| Nivel del Usuario | Niveles que Puede Crear | Retorno de Función |
|------------------|------------------------|-------------------|
| Level 1 | 2, 3, 4 | `[2, 3, 4]` |
| Level 2 | 3, 4 | `[3, 4]` |
| Level 3 | 4 | `[4]` |
| Level 4 | Ninguno | `[]` |

### 7.3 Campos Enmascarados en Contactos

| Campo | Sin Permiso | Con Permiso |
|-------|------------|-------------|
| email | `***` | `usuario@example.com` |
| phone | `***` | `+1234567890` |
| position | `***` | `CEO` |
| notes | `***` | `Notas completas...` |
| name | ✅ Visible | ✅ Visible |
| company | ✅ Visible | ✅ Visible |
| createdAt | ✅ Visible | ✅ Visible |
| updatedAt | ✅ Visible | ✅ Visible |

---

## Referencias de Código

### Archivos Principales

- **Schema de DB**: `src/lib/db/schema.ts`
- **Utilidades de Permisos**: `src/lib/utils.ts`
  - `canManageUser()`
  - `getAvailableLevels()`
- **Servicio de Usuarios**: `src/lib/services/user.service.ts`
  - `getUsersByLevel()`
  - Validaciones de manager/team
- **Servicio de Permisos de Contactos**: `src/lib/services/contact-permission.service.ts`
  - `maskContactFields()`
  - `checkContactPermission()`
- **API de Usuarios**: `src/app/api/users/route.ts`
- **API de Deals**: `src/app/api/deals/route.ts`
- **API de Teams**: `src/app/api/teams/route.ts`
- **API de Contact Access Requests**: `src/app/api/contact-access-requests/route.ts`

### Schemas de Validación

- **User Schema**: `src/lib/schemas/user.ts`
- **Auth Config**: `src/lib/auth.ts`

---

**Última actualización**: 2026-01-23
