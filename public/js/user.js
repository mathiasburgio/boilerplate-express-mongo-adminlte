class User{
    constructor(page=true){
        this.list = [];

        if(!page) return;// de aqui en adelante se inicializa la pagina de usuario
        this.getList().then(ret=>{
            this.list = ret;
            this.listUsers();
        });

        $("[name='crear-usuario']").click(ev=>{
            this.createUser();
        })
    }
    async getList(){
        let resp = await $.get({url: "/user/get-list"});
        return resp.list;
    }
    async createUser(){
        let email = await modal.prompt({label: "Email", type: "email"});
        if(!email) return;

        let resp = await $.post({
            url:"/user/create-child",
            data: { email, password: null }
        });

        if(resp.error){
            modal.mensaje(resp.error);
            return;
        }
        
        $("")
    }
    listUsers(){
        let tbody = this.list.map(user=>{
            return `<tr _id="${user._id}">
                <td>
                    <input type='text' autocomplete='off' name='email' value='${user.email}' readonly>
                </td>
                <td>
                    <div class="input-group">
                        <input type="password" class="form-control" autocomplete="off" name="password" value='${user.password}'>
                        <div class="input-group-append">
                            <button class="btn btn-light border"><i class="fas fa-eye-slash"></i></button>
                        </div>
                    </div>
                </td>
                <td>
                    <button class='btn btn-flat btn-outline-secondary' name='is-admin'>admin</button>
                </td>
                <td>
                    <button class='btn btn-flat btn-primary' name='permissions'>Permisos</button>
                    <button class='btn btn-flat btn-success disabled' name='save'>Guardar</button>
                </td>
            </tr>`;
        })
        $("#user table tbody").html(tbody);
        $("#user table tbody").html(tbody);
    }
}