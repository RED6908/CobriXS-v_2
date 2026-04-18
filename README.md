# CobriXS Web (CobriXS-v_2)

Sistema desarrollado con **React, TypeScript, Vite y Supabase**, enfocado en la gestión de ventas, inventario y operaciones comerciales para pequeños negocios.
El proyecto incluye pruebas automatizadas con **Jest** y generación de reportes de cobertura.

## Integrantes

- Guadalupe Monserrat Nuñez Nangullasmu
- Seani Arcos Gomez
- Juan Diego Lopez Miss
- Jeovani de Jesus
- Yaciel Aaron Camara Chan
- Carlos Antonio Balcazar Olan

## Descripción breve

**CobriXS** es una aplicación web diseñada para ayudar a pequeños comercios a gestionar sus operaciones diarias de manera eficiente.

Permite:

- Registrar productos
- Controlar inventario
- Administrar usuarios
- Realizar cobros
- Generar reportes en tiempo real

Todo desde cualquier dispositivo con conexión a internet.

## Requisitos previos

- **Node.js** v18 o superior (el workflow principal de CI usa 18; otro workflow de tests usa 20)
- **npm**
- **Git**
- **Docker** (opcional: imagen de la app, escaneo ZAP como en CI)

## Instalación y configuración local

1. Clonar el repositorio (usa la URL de tu organización o fork).

   ```bash
   git clone https://github.com/TU-USUARIO/CobriXS-v_2.git
   cd CobriXS-v_2
   ```

2. Instalar dependencias. Para alinear con `.github/workflows/ci-cd.yml` se recomienda:

   ```bash
   npm ci
   ```

   Si no tienes `package-lock.json` actualizado:

   ```bash
   npm install
   ```

3. Configurar variables de entorno: copia **`.env.example`** a **`.env`** y completa los valores. El archivo **`.env`** no se versiona (está ignorado por git); solo **`.env.example`** puede subirse al repositorio como plantilla sin secretos. Detalle en [Variables de entorno](#variables-de-entorno).

4. Arrancar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

Otros comandos útiles:

| Comando           | Descripción                               |
| ----------------- | ----------------------------------------- |
| `npm run build`   | TypeScript (`tsc -b`) + build Vite        |
| `npm run preview` | Sirve la carpeta `dist` (típico **4173**) |
| `npm run lint`    | ESLint                                    |

## Cómo ejecutar las pruebas

| Tipo              | Comando                 |                                                        Notas                                              |
| ----------------- | ----------------------- | --------------------------------------------------------------------------------------------------------- |
| Jest              | `npm test`              | Configuración en `jest.config.ts`; incluye `src/` y `unitarias/`.                                         |
| Cobertura Jest    | `npm run test:coverage` | Reportes en la carpeta `coverage/`.                                                                       |
| ESLint            | `npm run lint`          | Mismo paso que en el job `test` de `ci-cd.yml`.                                                           |
| Cypress (E2E)     | `npx cypress run` o `npx cypress open` | En `cypress.config.ts`, `baseUrl` es **http://localhost:5173** → encaja con `npm run dev`. |

**Nota sobre CI de Cypress:** en `.github/workflows/cypress.yml` se usa `npm run preview` y `wait-on` sobre **http://localhost:4173**. Si reproduces ese flujo, asegúrate de que la URL base de Cypress coincida con el puerto donde corre la app (por ejemplo con variable de entorno de Cypress para la base URL en **4173**).

## CI/CD y reproducción local (Docker)

| Workflow       | Qué hace (resumen) |
| -------------- | ------------------ |
| `ci-cd.yml`    | `npm ci` → `npm run lint` → `npm test`. En rama **main**, tras tests: `docker build`, login a Docker Hub, tag y push. |
| `tests.yml`    | `npm install` + `npm test` (Node 20). |
| `cypress.yml`  | Install → build → preview en segundo plano → Cypress. |
| `sonar.yml`    | Install + análisis SonarCloud (`SONAR_TOKEN` en GitHub). |
| `zap-scan.yml` | Build, `npm run dev` en background, contenedor **OWASP ZAP** contra **http://localhost:5173** (el job tolera fallos del scan con `\|\| true`). |

### Evidencia: ver el pipeline en ejecución

- **Enlace directo (GitHub Actions de este repositorio):** [https://github.com/RED6908/CobriXS-v_2/actions](https://github.com/RED6908/CobriXS-v_2/actions)

- **Instrucciones en GitHub:**
  1. Abre el repositorio en GitHub.
  2. Entra a la pestaña **Actions** (arriba, junto a *Code*, *Issues*, etc.).
  3. En la columna izquierda elige el workflow (por ejemplo **CobriXS CI/CD**, **TESTS -JEST-**, **Cypress E2E TESTS**, etc.).
  4. En el centro verás la lista de **ejecuciones**; haz clic en una fila para ver logs paso a paso, duración y estado (éxito o fallo).


**Reproducir la parte principal del CI en local:**

```bash
npm ci
npm run lint
npm test
docker build -t cobrixs-v_2:latest .
```

**Ejecutar la app con el Dockerfile del proyecto** (imagen de producción: Nginx sirve `dist/` en el puerto 80 del contenedor):

```bash
docker build -t cobrixs-v_2:latest \
  --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
  --build-arg VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
  .
docker run --rm -p 8080:80 cobrixs-v_2:latest
```

**Desarrollo en contenedor** (Vite con hot reload): `infra/Dockerfile.dev` y un `docker compose`/`run` montando el código; el despliegue en CI usa el `Dockerfile` de la raíz.

## Despliegue

**Despliegue como sitio estático (SPA):** ejecuta `npm run build` y publica el contenido de **`dist/`** en tu hosting Vercel. Las variables **`VITE_*`** deben estar definidas **en el momento del build**, porque Vite las inyecta al compilar.

## Variables de entorno

El cliente de Supabase se configura en `src/lib/supabase.ts` con variables públicas de Vite (`VITE_`).

| Variable                 |                                                                      Descripción                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | URL del proyecto Supabase (por ejemplo en el panel: **Project Settings → API → Project URL**).                                                    |
| `VITE_SUPABASE_ANON_KEY` | Clave **anon** (pública) del proyecto. En el frontend debe ir acompañada de políticas y **RLS** en Supabase; no sustituye un secreto de servidor. |

Ejemplo de **`.env`** (no subir a git):

```env
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon
```

**Secretos de GitHub Actions** (no van en `.env` de la app): `DOCKER_USERNAME`, `DOCKER_PASSWORD` (imagen Docker); `SONAR_TOKEN` (SonarCloud en `sonar.yml`).
