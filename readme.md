# Proyecto

## Pasos para la Configuración Inicial

1. Clonar este repositorio:
    ```bash
    git clone <url>
    ```

2. Borrar la carpeta `.git`:
    ```bash
    rm -rf .git
    ```

3. Inicializar Git:
    ```bash
    git init
    ```

4. Asociarlo a un nuevo repositorio de GitHub:
    ```bash
    git remote add origin <url>
    ```

5. Clonar `.env_example` y renombrar la copia como `.env`:
    ```bash
    cp .env_example .env
    ```

6. Editar el archivo `.env`:
    ```bash
    nano .env
    ```

7. Instalar dependencias:
    ```bash
    npm install
    ```

8. Configurar el proyecto:

    ### 8.1 Configuración del Modelo de Usuarios (user-model)
    
    Si el proyecto es para múltiples compañías o clientes, asegura que la información sea accesible solo para usuarios de la misma compañía. Para esto:
    - Descomenta `companyId` en el modelo.
    - Incluye `companyId` en todos los modelos que almacenen datos privados de cada compañía o cliente.
    
    **Nota:** Puedes usar otro nombre para `companyId`, por ejemplo, en Mateflix se utiliza `emprendimientoId` o `eid`.

    ### 8.2 Configuración Global de Acceso a la Base de Datos

    - Completa en `main.js` la importación de todos los modelos en la sección de middlewares.
    - Marca los modelos con acceso restringido con un asterisco (`*`) para indicar que deben filtrar datos específicos por `companyId`.
    
    **Ejemplo:**
    ```javascript
    models = {
        "ConfiguracionGlobal": ..., // Datos accesibles por todos los usuarios
        "PreciosGenerales": ...,    // Datos accesibles por todos los usuarios
        "*Productos": ...,          // Datos restringidos al cliente autenticado
        "*Clientes": ...,           // Datos restringidos al cliente autenticado
    }
    ```

    - Añade los modelos y la propiedad de filtro en el middleware:
    ```javascript
    app.use(mongo.safeQueryMiddleware(models, "companyId"));
    ```

    - Para consultas seguras, el middleware aplicará automáticamente el filtro `companyId`:
    ```javascript
    // Acceso seguro
    req.mongoQuery(query) // o req.mongoQuery(query, update).sort().limit();
    // Acceso inseguro
    req.unsafeMongoQuery(query)
    ```

    ### 8.3 Configuración de Data Primordial

    - Usa el middleware `getPrimordial` para retornar la información básica del sistema (ej., datos del comercio, usuario, y configuración).

## Tareas Pendientes

- [ ] **Agregar sonidos**
- [ ] **Agregar cortina**
- [ ] **Terminar el dashboard**
- [ ] **Agregar funciones comunes del menú en JavaScript**
- [ ] **Agregar simpleCRUD**
- [ ] **Agregar archivo de configuración común**
- [ ] **Agregar temas, sonidos**
- [ ] **Agregar integración con Excel (exceljs)**
- [ ] **Agregar creación de QR y código de barras**
- [ ] **Agregar biblioteca `imagine`**
- [ ] **Crear un template con ejemplos (sweetalert2, sonidos, QR, código de barras)**
- [ ] **Configurar dropdownsearcher**
- [ ] **Configurar index solo para login**

### Prioridad en Tareas Pendientes

- [ ] **Terminar archivo `index.html`**
- [ ] **Terminar funcionalidad de login**
- [ ] **Agregar recuperación de contraseña**
- [ ] **Configurar impresor**
- [ ] **Subir archivos a files.mateflix**
- [ ] **Obtener información primordial (datos del emprendimiento, usuario, etc.)**

## Versión 2: Funcionalidades Futuras

- [ ] **Agregar servicio de emails**
- [ ] **Integrar cobros con MercadoPago**
- [ ] **Agregar inicio de sesión con Google**
- [ ] **Agregar robots.txt y sitemap**
- [ ] **Agregar notificaciones push**
- [ ] **Agregar soporte PWA**
- [ ] **Integrar Socket.io para tiempo real**
- [ ] **Asegurar que todo sea responsive**