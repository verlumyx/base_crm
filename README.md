# ValolabsCRM - Guía de Instalación y Uso

CRM genérico multi-tenant con asistente IA integrado. Cada empresa configura el propósito y comportamiento de su asistente virtual para interactuar a través de WhatsApp y Telegram.

## Requisitos Previos

- **Node.js** (v20 o superior)
- **pnpm** (`npm install -g pnpm`)
- **Docker y Docker Compose** (para levantar PostgreSQL + pgvector)

## 1. Instalación y Levantamiento

1. **Clonar el proyecto** e instalar dependencias:

   ```bash
   pnpm install
   ```

2. **Levantar la base de datos**:

   ```bash
   docker-compose up -d postgres
   ```

3. **Configurar variables de entorno**:
   Copia el archivo de ejemplo y configura las claves principales.

   ```bash
   cp .env.example .env
   ```

   > Abre el archivo `.env` y asegúrate de que `DATABASE_URL` apunte a tu base de datos local. Por defecto, expone el puerto 5436.

4. **Ejecutar migraciones de la base de datos**:

   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

5. **Iniciar el servidor y el worker del bot**:
   ```bash
   pnpm dev
   ```
   _Esto iniciará la aplicación en `http://localhost:3000` y el procesador de mensajes del bot en segundo plano._

## 2. Variables de Entorno Clave (`.env`)

- **Básicas**:
  - `NEXT_PUBLIC_APP_URL`: URL base del sistema (ej. `http://localhost:3000`).
  - `BETTER_AUTH_SECRET`: Secreto criptográfico de 32 caracteres para el manejo de sesiones.
  - `APP_ENCRYPTION_KEY`: Clave de 32 caracteres usada para encriptar los tokens de WhatsApp y Telegram en la base de datos.
- **Inteligencia Artificial**:
  - `BOT_AI_PROVIDER`: Puede ser `gemini` o `azure`.
  - `GOOGLE_API_KEY`: API Key de Google AI Studio. Es obligatoria si usas Gemini (`BOT_AI_PROVIDER=gemini`).
  - `BOT_CHAT_MODELS`: Modelo a usar para generar las respuestas (ej. `gemini-2.5-flash-lite`).

## 3. Configuración del Bot IA (Panel Web)

Una vez inicies sesión en ValolabsCRM, el bot requiere configurarse para empezar a operar. Consta de 3 partes fundamentales:

### A. Configuración General (Identidad del Asistente)

Ve a **Asistente IA > Configuración** y ajusta estos campos:

- **Asistente activo**: Si está apagado, los mensajes llegan a la bandeja de entrada pero no son respondidos de forma automática.
- **Nombre del asistente**: El nombre con el que se presentará (ej. _Carlos_ o _Asistencia Virtual_).
- **Propósito del asistente**: El núcleo del bot. Define qué hace la empresa, qué servicio ofrece y cómo debe operar el bot.
  - _Ejemplo:_ "Eres el asistente de una clínica odontológica. Tu objetivo es responder dudas usando la base de conocimiento y agendar citas. Solicita siempre el nombre del paciente y su motivo de consulta."
- **Instrucciones del negocio**: Reglas de tono, estilo y personalidad que van al final del prompt.
  - _Ejemplo:_ "Trata al cliente de tú, sé amable, conciso y utiliza emojis moderadamente. Nunca menciones a la competencia."

### B. Base de Conocimiento (RAG)

El bot está restringido de inventar información (alucinaciones). Para que responda dudas sobre tu negocio, debes nutrir su conocimiento:

1. Ve a **Asistente IA > Base de Conocimiento**.
2. Sube documentos (TXT, Markdown, PDF) con catálogos, políticas, precios, FAQs, o procesos.
3. El sistema particionará el documento y guardará la información vectorizada en base de datos.
4. Cuando un cliente haga una pregunta, el bot buscará el contexto necesario de estos documentos y lo incluirá en su respuesta.

### C. Canales de Comunicación

Para recibir mensajes, debes enlazar una cuenta de red social:

- Ve a **Asistente IA > Canales** y añade un canal.
- **Telegram (Recomendado para desarrollo local)**: Mucho más rápido y fácil de probar. Crea un bot hablando con `@BotFather` en Telegram, obtén el token de acceso e ingrésalo. El sistema enlazará el webhook automáticamente.
- **WhatsApp Cloud API**: Requiere configurar una app en Meta for Developers, obtener un Token Permanente y apuntar el Webhook de Meta a la URL pública de tu CRM (`https://tu-dominio.com/api/bot/whatsapp`).

## 4. Bandeja de Entrada y Handoff

En el módulo de **Mensajes**, podrás ver todas las conversaciones de los clientes. El bot marca automáticamente si está manejando él la conversación o si requiere atención de un operador (`handoff`).

- Si configuras **"Permitir escalar a un humano"** en la configuración, el bot pausará sus intervenciones y pedirá ayuda si el usuario dice "quiero hablar con un humano" o si el bot agota sus herramientas sin llegar a una solución.
