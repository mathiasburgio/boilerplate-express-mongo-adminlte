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

    ### 8.1 Configuración del modelo SaaS
    
    Si el proyecto es para múltiples compañías o clientes, asegura que la información sea accesible solo para usuarios de la misma compañía. Para esto vamos a utilizar una propiedad en cada modelo para discriminar a que compañia/cliente pertenece dichos datos. En este ejemplo usaremos el campo 'companyId' y procedemos de la siguiente forma:
    - En main.js asignar a dbPrivateKey='companyId'.
    - En el modelo `models/user-model` agregamos la propiedad 'companyId' del tipo ObjectId y haz los cambios necesarios en `controllers/user-controller`.
    - Incluye `companyId` en todos los modelos que almacenen datos privados de cada compañía o cliente.

    ### 8.2 Configuración de acceso a datos

    - Completa en `main.js` la importación de todos los modelos en la dentro de la promesa devuelta de `db()` el cual establece una conexion y la retorna.

    ### 8.3 Configuración de Data Primordial

    - Edita el middleware `getPrimordial` para obtener la información básica del sistema (ej., datos del comercio, usuario, y configuración) y utilizalo cuando lo necesites mediante `req.getPrimordial` ó bien mediante `curl -X GET https://<tu-dominio>/get-primordial`.

    ### Acceso a datos

    - Cuando se quiera acceder a datos privados utilizar req.privateQuery("modelo")[find, findOne, findOneAndUpdate, delete, etc]. Esto hará que cada consulta inyecte implicitamente `companyId: req.session.data.companyId` para las busquedas y elimine `companyId` para los updates.  
    Ej. req.privateQuery("Client").find({}).sort({_id: -1}).limit(10);
    -Cuando se quiera acceder de forma insegura utilizar `req.mongoDB.models[model]`
    Ej. req.mongoDB.models.User.findOne({email: "someone@gmail.com"})

    ### middlewares
    -req.writeLog(req, message, error=false) //graba log.txt
    -req.goHome(res) //redirecciona a "/"
    -req.getPrimordial(req, res) //retorna la información basica necesaria para operar el sistema tales como fechas, configuraciones, datos de usuario y empresa, etc.
    -req.privateQuery(model) //retorna la conexion a la base de datos pero inyectando la `dbPrivateKey` en la query y sanitizando el update.
    -req.mongoDB //retorna la conexion a la base de datos
    -req.mongo(model) //retorna una conexion simplificada a la base de datos


## Tareas Pendientes
- [ ] **Agregar simpleCRUD**
- [ ] **Agregar config**
- [ ] **Agregar users**
- [ ] **Agregar integración con Excel (exceljs)**
- [ ] **Agregar biblioteca `imagine`**

### Prioridad en Tareas Pendientes

- [ ] **Configurar impresor**
- [ ] **Subir archivos a files.mateflix**

## Versión 2: Funcionalidades Futuras

- [ ] **Agregar servicio de emails**
- [ ] **Integrar cobros con MercadoPago**
- [ ] **Agregar inicio de sesión con Google**
- [ ] **Agregar robots.txt y sitemap**
- [ ] **Agregar notificaciones push**
- [ ] **Agregar soporte PWA**
- [ ] **Integrar Socket.io para tiempo real**
- [ ] **Asegurar que todo sea responsive**
- [ ] **Electron.js**