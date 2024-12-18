class Users{
    constructor(page=true){
        this.permissions = [
            "menu.creditos-municipales",
            "menu.creditos-personales",
            "menu.users",
            "menu.config",
        ];

        this.list = [];

        if(!page) return;// de aqui en adelante se inicializa la pagina de usuario
        this.getList().then(ret=>{
            this.list = ret;
            this.listUsers();
        });

        $("[name='crear-usuario']").click(ev=>{
            this.createUser();
        })

        setInterval(()=>{
            $(`#user table tbody tr [name='save']`).each((ind, ev)=>{
                let btn = $(ev);
                if(btn.attr("toggle-shine-button") == "true"){
                    btn.toggleClass("btn-success").toggleClass("btn-outline-success").prop("disabled", false);
                }else{
                    btn.removeClass("btn-success").addClass("btn-outline-success").prop("disabled", true);
                    btn.prop("disabled", true);
                }
            })
        }, 600);

        menu.setPageName({title: "Usuarios", name: "Usuarios"});
        menu.hideCortina();
    }
    async getList(){
        let resp = await $.get({url: "/users/get-list"});
        resp.list.forEach(user=>{
            user._password = user.password;
            user._isAdmin = user.isAdmin;
            user._permissions = JSON.parse(JSON.stringify(user.permissions));
        })
        return resp.list;
    }
    async createUser(){
        let email = await modal.prompt({label: "Email", type: "email"});
        if(!email) return;

        try{
            let resp = await $.post({
                url:"/users/create-child",
                data: { email, password: null }
            });

            //agrega los permisos por defecto
            resp.permissions = [];
            resp._permissions = JSON.parse(JSON.stringify(resp.permissions));

            this.list.push(resp);
            this.listUsers();
            menu.toast({level: "success", title: "Crear usuario", message: "Usuario creado con éxito"})
        }catch(err){
            console.log(err);
            modal.mensaje(err.responseText);
        }
        
    }
    listUsers(){
        let tbody = this.list.map(user=>{
            return `<tr _id="${user._id}">
                <td>
                    <input type='text' class="form-control" autocomplete='off' name='email' value='${user.email}' readonly>
                </td>
                <td>
                    <div class="input-group">
                        <input type="password" class="form-control" autocomplete="off" name="password" value='${user.password}'>
                        <div class="input-group-append">
                            <button class="btn btn-light border" name="show-password"><i class="fas fa-eye-slash"></i></button>
                        </div>
                    </div>
                </td>
                <td>
                    <input type='checkbox' class='toggle' name="is-admin" ${user.isAdmin ? "checked" : ""}>
                </td>
                <td class="text-right">
                    <button class='btn btn-flat btn-primary mx-1' name='permissions'>Permisos</button>
                    <button class='btn btn-flat btn-success mx-1' disabled name='save'>Guardar</button>
                </td>
            </tr>`;
        })
        $("#user table tbody").html(tbody);
        $("#user table tbody tr").each((ind, ev)=>{
            let row = $(ev);
            utils.bindShowPasswordEvent( row.find("[name='show-password']"), row.find("[name='password']") );
        })

        $("#user table tbody tr [name='password']").change(ev=>{
            let inp = $(ev.currentTarget);
            let row = inp.parent().parent().parent();
            let _id = row.attr("_id");
            let user = this.list.find(ux=>ux._id == _id);
            user._password = inp.val();
            this.verifyChange();
        })
        $("#user table tbody tr [name='is-admin']").change(ev=>{
            let inp = $(ev.currentTarget);
            let row = inp.parent().parent();
            let _id = row.attr("_id");
            let user = this.list.find(ux=>ux._id == _id);
            user._isAdmin = inp.prop("checked");
            this.verifyChange();
        })
        $("#user table tbody tr [name='permissions']").click(ev=>{
            let row = $(ev.currentTarget).parent().parent();
            let _id = row.attr("_id");
            let user = this.list.find(ux=>ux._id == _id);
            this.permissionsModal(user);
        })
        $("#user table tbody tr [name='save']").click(ev=>{
            let row = $(ev.currentTarget).parent().parent();
            let _id = row.attr("_id");
            let user = this.list.find(ux=>ux._id == _id);
            this.saveUser(user);
        })
    }
    verifyChange(){
        for(let user of this.list){
            user.hasChanges = false;
            if(user.password != user._password) user.hasChanges = true;
            if(user.isAdmin != user._isAdmin) user.hasChanges = true;
            if(JSON.stringify(user.permissions) != JSON.stringify(user._permissions)) user.hasChanges = true;
            $(`#user table tbody [_id='${user._id}'] [name='save']`).attr("toggle-shine-button", user.hasChanges.toString());
        }
    }
    permissionsModal(user){
        let fox = $("#permissions-modal").html();
        modal.mostrar({
            titulo: "Permissions",
            cuerpo: fox,
            botones: "volver",
            fnOcultar2: () =>{
                this.verifyChange();
            }
        });

        //add permissions
        let tbody = "";
        this.permissions.sort().forEach(permission=>{
            tbody += `<li p="${permission}" class="list-group-item list-group-item-action cp ${user._permissions.includes(permission) ? "bg-success" : ""}">
                <i class="mr-2 far fa-${user._permissions.includes(permission) ? "circle-check" : "circle"}"></i>
                ${permission}    
            </li>`
        })
        $("#modal ul").html(tbody);
        
        //bind click
        $("#modal ul li").click(ev=>{
            let permission = $(ev.currentTarget).attr("p");
            if( user._permissions.includes(permission) ){
                $(ev.currentTarget).removeClass("bg-success").find("i").removeClass("fa-circle-check").addClass("fa-circle");
                user._permissions = user._permissions.filter(p=>p != permission);
            }else{
                $(ev.currentTarget).addClass("bg-success").find("i").addClass("fa-circle-check").removeClass("fa-circle");
                user._permissions.push(permission);
            }
        });
    }
    async saveUser(user){
        let resp = await modal.pregunta(`¿Confirma guardar los cambios en el usuario?`);
        if(!resp) return;

        try{
            let ret = await $.ajax({
                method: "PUT",
                url: "/users/update-child",
                data: {
                    userId: user._id,
                    email: user.email,
                    password: user._password,
                    isAdmin: (user._isAdmin === true),
                    permissions: typeof user._permissions == "undefined" ? user.permissions : user._permissions
                }
            })
            console.log(ret);
            user.isAdmin = user._isAdmin;
            user.password = user._password;
            user.permissions = JSON.parse(JSON.stringify(user._permissions));
            user.hasChanges = false;
            this.verifyChange();
            menu.toast({level: "success", title: "Editar usuario", message: "Usuario modificado con éxito"})
        }catch(err){
            modal.mensaje(err.responseText)
        }
    }
}