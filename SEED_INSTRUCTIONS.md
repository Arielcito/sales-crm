# Instrucciones de Seeding de Base de Datos

## Configuración Inicial

### 1. Generar y aplicar migraciones

```bash
# Generar migraciones basadas en el schema
npm run db:generate

# Aplicar las migraciones a la base de datos
npm run db:push
```

### 2. Ejecutar seeds de datos iniciales

```bash
npm run db:seed
```

Este comando poblará la base de datos con:
- **Teams por defecto**: Equipos de Ventas y Comercial
- **Deal Stages**: Las 9 etapas predefinidas del flujo de negociación
- **Exchange Rates**: Tasas de cambio USD/ARS iniciales

## Crear Usuarios con Better Auth Admin

Better Auth viene con un plugin de admin que permite crear y gestionar usuarios directamente.

### Opción 1: Usar Better Auth CLI (Recomendado)

```bash
npx @better-auth/cli create-user
```

Esto te pedirá:
- Email del usuario
- Contraseña
- Nombre
- Campos adicionales (role, level, teamId, managerId)

### Opción 2: Crear usuarios mediante API

Puedes crear usuarios mediante el endpoint de registro:

**POST** `/api/auth/sign-up/email`

```json
{
  "email": "lucas.palazzo@crm.com",
  "password": "secure_password",
  "name": "Lucas Palazzo"
}
```

Luego, actualiza los campos adicionales del usuario en la base de datos:

```sql
UPDATE "user"
SET
  role = 'CEO',
  level = 1,
  "teamId" = (SELECT id FROM team WHERE name = 'Ventas' LIMIT 1)
WHERE email = 'lucas.palazzo@crm.com';
```

## Estructura de Niveles de Usuario

- **Nivel 1**: CEO/Director (Lucas Palazzo) - Ve toda la información
- **Nivel 2**: Gerentes/Managers - Ven su información y la de sus reportes
- **Nivel 3**: Vendedores Senior - Reportan a Nivel 2
- **Nivel 4**: Vendedores Junior - Reportan a Nivel 2

## Ejemplo de Estructura Jerárquica

```
Lucas Palazzo (Nivel 1, CEO)
├── Juan Pérez (Nivel 2, Gerente de Ventas)
│   ├── María García (Nivel 3, Vendedor Senior)
│   └── Carlos López (Nivel 4, Vendedor Junior)
└── Ana Martínez (Nivel 2, Gerente Comercial)
    ├── Pedro Rodríguez (Nivel 3, Vendedor Senior)
    └── Laura Sánchez (Nivel 4, Vendedor Junior)
```

## Comandos Útiles de Base de Datos

```bash
# Abrir Drizzle Studio para visualizar la base de datos
npm run db:studio

# Regenerar el schema si hay cambios
npm run db:generate

# Aplicar cambios a la base de datos
npm run db:push
```

## Etapas de Negociación Predefinidas

1. **Oportunidad identificada** (azul)
2. **Cotización generada y enviada** (morado)
3. **Aprobación pendiente** (naranja)
4. **Orden de compra generada** (verde)
5. **Anticipo pagado** (cian)
6. **Proyectos en curso** (índigo)
7. **Facturación final** (morado)
8. **Proyectos terminados** (verde)
9. **Proyectos perdidos** (rojo)

Las etapas son completamente personalizables desde la aplicación.

## Tasas de Cambio

El sistema incluye tasas de cambio iniciales. Para agregar más tasas:

```sql
INSERT INTO "exchangeRate" (date, "usdToArs", source)
VALUES (CURRENT_DATE, '1150.00', 'manual');
```

Se recomienda actualizar periódicamente las tasas de cambio para mantener conversiones precisas.
