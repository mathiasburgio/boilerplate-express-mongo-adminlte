1-Clonar este repositorio
    git clone <url>

2-Borrar la carpeta .git
    rm .git

3-Inicializar git
    git init

4-Asociarlo a un nuevo repositorio de github
    git add remote <url>

5-Clonar ".env_example" y renombrar a la copia como ".env"
    cp .env_example .env

6-Editar el archivo ".env"
    nano .env

7-Instalar dependencias
    npm install

8-Configurar

    8.1-configurar modelo de usuarios (user-model)

        Cuando el proyecto a desarrollar es para multiples companias/clientes debemos hacer que la informacion guardada sea solo accesible para los usuarios de dicha compania. Para eso descomentamos "companyId", y hacemos que todos los modelos que almacenen informacion individual/privada de cada compania/cliente tengan el mismo campo.
        
        NOTA: companyId se puede cambiar por otro nombre. Ej mateflix online usa "emprendimientoId" ó "eid".

    8.2-Configuracion global de acceso a base de datos

        Completar en main.js (en la seccion de middlewares) la importacion de todos los modelos.
        /*
            1- Marcado de modelos con acceso restringido: Los modelos que requieren un companyId específico deben marcarse con un "*". Esto garantiza que los datos solo se filtren para la empresa del usuario autenticado.
            --
            Ej.
            models={
                "ConfiguracionGlobal": ..., // Datos accesibles por todos los usuarios
                "PreciosGenerales": ...,    // Datos accesibles por todos los usuarios
                "*Productos": ...,          // Datos restringidos al cliente autenticado
                "*Clientes": ...,           // Datos restringidos al cliente autenticado
            }
            ---
            2- Agregado de modelos al middleware: Añade los modelos y la propiedad de filtro (en formato string)
            ---
            app.use(mongo.safeQueryMiddleware(models, "companyId")); //propiedad de filtro puede ser null
            ---
            3- Consulta segura con filtro: Al ejecutar una consulta en un modelo marcado con "*", el middleware añadirá automáticamente el filtro de "companyId" en la consulta. Comparará este valor con req.session.companyId, asegurando que solo se acceda y manipule la información asociada a la empresa actual del usuario.
            ---
            //acceso seguro
            req.mongoQuery(query) //req.mongoQuery(query, update).sort().limit();
            //acceso inseguro
            req.unsafeMongoQuery(query)
            --- 
        */
    8.3- configuracion de data primordial

        En los middleware hay uno que es getPrimordial el cual deberia retornar la informacion basica para el uso del sistema. Ej en mateflix podria ser los datos del comerico, los datos del usuario y la configuracion

TODO:


3-agregar sonidos
4-agregar cortina
2-terminar el dashboard
5-agregar js para funciones comunes del menu
9-agregar simpleCRUD
10-agregar archivo de config que llevan todos los emprendimientos
11-agregar themes, sonidos
12-agregar saveFile
13-agregar exceljs
14-agregar creacion QR
15-agregar creacion barcode
16-agregar imagine
17-agregar template con ejemplo para todo (incluso sweetalert2, sonidos, qr barcode)
26-dropdownsearcher
28-index que sea solo login


1-terminar el archivo index.html
7-terminar login
8-agregar el recuperar contrasena
22-agregar impresor
24-upload to files.mateflix
27-obtener informacion primordial (ej datos del emprendimiento, usuario, etc)



version 2
-agregar servicio de emails
-agregar cobros por MP
-agregar login google
-agregar robots
-agregar sitemap
-agregar push notifications
-agregar pwa
-agregar socket.io
-hacer todo responsive