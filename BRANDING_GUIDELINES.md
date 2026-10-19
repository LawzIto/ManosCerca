# Guía de Implementación de UI/UX y Sistema de Diseño — ManosCerca (PWA)

## Rol y Objetivo para el Agente de Desarrollo
Actúa como un Ingeniero Frontend Senior experto en **Next.js (App Router), Tailwind CSS y Progressive Web Apps (PWA)**. Tu objetivo es implementar el sistema de diseño oficial de **ManosCerca** en toda la aplicación, asegurando fidelidad visual absoluta con el Manual de Identidad Corporativa v1.0, cumplimiento de accesibilidad WCAG AA/AAA y enfoque *mobile-first*.

---

## Paso 1: Tokens de Diseño (Design Tokens)

Configura estos tokens en el archivo global de estilos (`app/globals.css`) y en la configuración de Tailwind (`tailwind.config.ts` / `@theme`).

### 1.1 Paleta de Colores

#### Colores Principales (Confirmados)
* **Azul Marino (Primary / Anchor):** `#062244` (`rgb(6, 34, 68)`)
  * *Uso:* Color ancla, textos principales, titulares, fondos oscuros, barra superior/iconografía base.
* **Azul Eléctrico (Accent / CTA):** `#0165F0` (`rgb(1, 101, 240)`)
  * *Uso:* Botones de acción principal (CTA), enlaces interactivos, estado "Aceptado" y acentos puntuales. **Regla de proporción:** Usar máximo en un 10% de la interfaz para no saturar.

#### Colores Secundarios y Neutros (Apoyo)
* **Azul Claro (Accent Light):** `#5AA2FF` (`rgb(90, 162, 255)`)
  * *Uso:* Acentos sobre fondos Azul Marino (`#062244`), estado "En progreso", detalles en modo oscuro/negativo.
* **Azul Hielo (Surface Highlight):** `#EAF2FF` (`rgb(234, 242, 255)`)
  * *Uso:* Fondos de tarjetas destacadas, bloques informativos, badges de categorías y secciones de énfasis suave.
* **Gris Humo (Background Neutral):** `#F3F6FA` (`rgb(243, 246, 250)`)
  * *Uso:* Fondo general de pantallas de la aplicación (`body` background) para generar contraste con las tarjetas blancas.
* **Gris Pizarra (Text Secondary):** `#5B6B7F` (`rgb(91, 107, 127)`)
  * *Uso:* Textos secundarios, subtítulos de apoyo, placeholders, leyendas y metadatos (fechas, barrios).
* **Blanco Puro (Surface Base):** `#FFFFFF` (`rgb(255, 255, 255)`)
  * *Uso:* Fondo principal de tarjetas, modales, inputs, barra de navegación inferior y textos sobre fondos oscuros.

#### Colores Funcionales y de Estado del Servicio
* **Verde Verificado (`completado` / Verified):** `#0B7A4B` (`rgb(11, 122, 75)`)
  * *Fondo suave asociado (Badge):* `#E6F4EA` con texto `#0B7A4B`.
  * *Uso:* Sello de «Identidad verificada» y estado de servicio `completado`.
* **Ámbar Estrella (`pendiente` / Rating):** `#F5A623` (`rgb(245, 166, 35)`)
  * *Fondo suave asociado (Badge):* `#FEF6E6` con texto `#062244`.
  * *Uso:* Estrellas de calificación y estado de servicio `pendiente`. **Importante:** Cuando se use como fondo lleno (`#F5A623`), el texto encima DEBE ser Azul Marino (`#062244`), nunca blanco.
* **Rojo Alerta (Danger / Error):** `#D93A3F` (`rgb(217, 58, 63)`)
  * *Fondo suave asociado (Badge):* `#FCE8E8` con texto `#D93A3F`.
  * *Uso:* Errores de formulario, etiquetas de "Urgente", cancelaciones y acciones destructivas.
* **Mapeo estricto de estados (`service_requests.status`):**
  * `pendiente`: Color `#F5A623` (Ámbar) con texto `#062244`.
  * `aceptado`: Color `#0165F0` (Azul Eléctrico) con texto `#FFFFFF`.
  * `en_progreso`: Color `#5AA2FF` (Azul Claro) con texto `#062244` (o `#FFFFFF` si cumple contraste en badge oscuro).
  * `completado`: Color `#0B7A4B` (Verde Verificado) con texto `#FFFFFF`.

#### Proporción Cromática en Pantalla (Regla 60-30-10)
* **60% Neutros:** `#FFFFFF`, `#F3F6FA`, `#EAF2FF`
* **30% Azul Marino:** `#062244`
* **10% Azul Eléctrico:** `#0165F0`

---

### 1.2 Tipografía y Jerarquía de Texto

Importa **`Poppins`** desde `next/font/google` con los pesos `300` (Light), `400` (Regular), `500` (Medium) y `700` (Bold). Define `Calibri, Arial, sans-serif` como *fallback* del sistema.

| Nivel | Elemento / Rol | Peso (Poppins) | Tamaño Digital | Interlineado (`line-height`) | Color por defecto |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **H1** | Título de pantalla | `Bold (700)` | `28px - 32px` (`text-2xl` / `text-3xl`) | `1.1` (`leading-tight`) | `#062244` |
| **H2** | Subtítulo de sección | `Medium (500)` | `20px - 22px` (`text-xl`) | `1.2` (`leading-snug`) | `#062244` |
| **H3** | Encabezado de bloque/tarjeta | `Medium (500)` | `15px - 16px` (`text-base`) | `1.3` | `#0165F0` o `#062244` |
| **Body** | Párrafo general | `Regular (400)` | `16px` (`text-base`) | `1.45 - 1.5` (`leading-relaxed`) | `#062244` |
| **Body Sm** | Descripción secundaria | `Regular (400)` / `Light (300)` | `14px` (`text-sm`) | `1.4` | `#5B6B7F` |
| **Button / Tag** | Botones y etiquetas | `Medium (500)` | `14px - 15px` | `1.0` (`tracking-wider` `+0.04em` si es mayúscula) | Según variante |
| **Caption** | Notas al pie y metadatos | `Light (300)` / `Regular (400)` | `12px` (`text-xs`) | `1.3` | `#5B6B7F` |

---

### 1.3 Radios de Borde, Espaciados y Sombras

* **Tarjetas y Contenedores (`Card`, `Modal`):** `border-radius: 24px` (`rounded-3xl`).
* **Campos de Formulario (`Input`, `Select`, `Textarea`):** `border-radius: 16px` (`rounded-2xl`).
* **Botones y Badges (`Button`, `Badge`, `Chip`):** Totalmente redondeados tipo píldora (`border-radius: 9999px` / `rounded-full`).
* **Sombras:** Suaves y difuminadas de baja opacidad (`shadow-[0_8px_24px_rgba(6,34,68,0.06)]`). Prohibido usar sombras duras o bordes negros gruesos.
* **Touch Targets (Mobile-First):** Todo elemento interactivo (botones, inputs, links de navegación) debe tener una altura mínima de **`48px` (`min-h-12`)**.

---

## Paso 2: Reglas de Componentes UI

### 2.1 Botones (`<Button />`)
* **Forma:** `rounded-full` (píldora), altura mínima `48px`, `px-6`, fuente `Poppins Medium`.
* **Variante Primaria (`primary`):**
  * Fondo: `#0165F0` (Azul Eléctrico).
  * Texto: `#FFFFFF`.
  * Hover/Active: `brightness-95` / `scale-[0.99]`.
* **Variante Secundaria (`secondary` / `outline`):**
  * Fondo: `#FFFFFF` o transparente.
  * Borde: `2px solid #062244`.
  * Texto: `#062244` (Azul Marino).
* **Variante Deshabilitada (`disabled`):**
  * Fondo: `#E2E8F0` / `#D8DFE8`.
  * Texto: `#5B6B7F`.
  * Cursor: `not-allowed`.

### 2.2 Tarjetas (`<Card />`)
* **Tarjeta Estándar (ej. Cotización de Técnico, Solicitud):**
  * Fondo: `#FFFFFF`.
  * Radio: `24px` (`rounded-3xl`).
  * Padding: `20px` a `24px` (`p-5` o `p-6`).
  * Borde por defecto: `1px solid #EAF2FF` o sombra suave `0 4px 20px rgba(6, 34, 68, 0.05)`.
* **Tarjeta Seleccionada / Destacada:**
  * Borde activo: `2px solid #0165F0`.
* **Tarjeta de Categoría (Home - Plomería, Electricidad, Cerrajería, Mantenimiento):**
  * Fondo: `#EAF2FF` (Azul Hielo).
  * Radio: `20px` a `24px`.
  * Icono superior en `#062244` (mínimo `28px`) y título en `Poppins Medium` `#062244`.

### 2.3 Inputs y Campos de Formulario (`<Input />`, `<Textarea />`)
* **Altura mínima:** `48px`.
* **Radio:** `16px` (`rounded-2xl`).
* **Estado Reposo:** Fondo `#FFFFFF`, borde `1.5px solid #D0D9E8`, texto `#062244`, placeholder `#5B6B7F`.
* **Estado Focus:** Borde `2px solid #0165F0`, `outline: none`, ligero anillo opcional `ring-2 ring-[#0165F0]/20`.
* **Estado Error:** Borde `2px solid #D93A3F`, mensaje inferior en `#D93A3F` (`12px`).

### 2.4 Badges y Etiquetas (`<Badge />`)
* **Forma:** `rounded-full`, `px-3 py-1`, `text-xs font-medium`.
* **Sello "Identidad verificada":** Fondo verde suave (`#E3F5EC`), texto `#0B7A4B`, acompañado del icono de escudo/check verificado.
* **Etiqueta de Zona / Barrio:** Fondo `#EAF2FF`, texto `#062244`.
* **Aviso de Privacidad (Banner de confianza):** Bloque redondeado con fondo `#F3F6FA` o `#EAF2FF`, icono de candado en `#0B7A4B`, título en `#062244` («Tu número queda oculto») y subtítulo en `#5B6B7F` («hasta que aceptes la cotización»).

### 2.5 Barra de Navegación Inferior (`<BottomNav />`) y Header
* **Header:** Fondo blanco o `#F3F6FA`, con el `logo_horizontal_color.svg` alineado a la izquierda (altura mínima del isotipo `28px - 32px`, ancho mínimo del logo horizontal `120px`).
* **Bottom Navigation (Mobile):**
  * Fija en la parte inferior (`fixed bottom-0 inset-x-0 bg-white border-t border-[#EAF2FF]`).
  * 4 ítems principales: *Inicio*, *Pedidos*, *Mensajes*, *Perfil*.
  * Ítem activo: Icono sólido y texto en `#0165F0` (Azul Eléctrico).
  * Ítem inactivo: Icono y texto en `#5B6B7F` (Gris Pizarra).

### 2.6 Stepper de Estado del Servicio
* Línea de progreso vertical u horizontal con 4 pasos numerados en círculos (`32px x 32px`, `rounded-full`):
  1. **Pendiente:** Círculo `#F5A623` con número `#062244`.
  2. **Aceptado:** Círculo `#0165F0` con número `#FFFFFF`.
  3. **En progreso:** Círculo `#5AA2FF` con número `#062244` (o blanco con contraste verificado).
  4. **Completado:** Círculo `#0B7A4B` con número `#FFFFFF`.

---

## Paso 3: Gestión de Recursos Gráficos (`.svg` y `.png`)

Todos los activos oficiales provienen de la carpeta entregada y deben organizarse en el directorio `public/` siguiendo esta estructura y nomenclatura exacta:

### 3.1 Estructura de Directorios en `public/`
```text
public/
├── brand/
│   ├── logos/
        Iconos_app
        logos_PNG_transparente
        Logos_SVG