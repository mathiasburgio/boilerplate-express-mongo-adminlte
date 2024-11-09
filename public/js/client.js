class Client{
    constructor(list = []){
        this.crud = null;
        this.list = list;
        this.registriesCtaCte = [];
    }
    async initHTML(){
        menu.setActiveButton("[nav='clients']");
        utils.getPrimordial();
        await this.uptadeList();

        this.crud = new SimpleCRUD({
            list: this.list,
            searchProps: ["name"],
            structure: [
                {
                    label: "Name",
                    prop: "name",
                    width: "100%"
                },
                {
                    label: "$",
                    prop: "-",
                    width: "80px",
                    right: true,
                    fn: (e, f)=>{
                        return `<span class='badge badge-${(e > 0 ? "danger" : "success")}'>${e}</span>`;
                    }
                },
            ],
            afterSelect: (item) => {
                $("[crud='btModify']").click();
            },
            afterClear: () => {
                //...
            },
            fnSearch: (p, l) => {
                p = p.toLowerCase();
                let filtro = $("[name='filtrar-listado']").val();
                let l2 = l.filter(item=>item.nombre.toLowerCase().indexOf(p) > -1);
                if(filtro == "Deudores"){
                    l2 = l2.filter(item=>item.saldo > 0);
                }
                return l2;
            },
            fnDblClick: async (element)=>{
                $("[crud='btModify']").click();
            }
        });

        $("[crud='btNew']").click(ev=>{
            this.crud.onNew();
            this.listarVendedores();
            $("#cliente-datos-tab").click();
        })

        $("[crud='btModify']").click(ev=>{
            if (typeof this.crud.element == "undefined") { modal.mensaje("Seleccione un cliente para realizar esta acción"); return; }
            $("#cliente-datos-tab").click();
            this.crud.onModify();
        })
        $("[crud='btDelete']").click(ev=>{
            if (typeof this.crud.element == "undefined") { modal.mensaje("Seleccione un cliente para realizar esta acción"); return; }
            if(_datos.esAdmin == false && _datos.permisos.includes("clientes.eliminar") == false) { modal.mensaje("No tiene permisos para realizar esta acción"); return; }
            this.onDelete();
        })

        $("[crud='btSave']").click(async () => {
            if(this.bandera) return
            this.bandera = true
            await this.onSave();
            this.bandera = false
        });
    }
    async updateList(){
        let resp = await $.get({ url: "/client/list" })
        resp.list.sort((a,b)=>{
            if(a.name > b.name) return 1
            if(a.name < b.name) return 1
            return 0
        });

        //AGREGAR AQUI TODA LA INFORMACION QUE REQUIERA PRE-PROCESAMIENTO
        
        this.list = resp.list;
    }
    async onSave() {
        
        let data = this.crud.getDataToSave();
        data.nombre = data.nombre.trim();
        data.direccion = data.direccion.trim();
        data.telefono = data.telefono.trim() || null;
        data.vendedor = data.vendedor.trim() || null;
        data.cuit = data.cuit.trim() || null;
        if (data.nombre.length < 3) { modal.mensaje("Nombre no válido"); return; }
        data.limiteCta = h.decimales(data.limiteCta || 0) || 0;
        
        
        await modal.esperando2("Guardando...");
        let ret = await $.post({
            url: "/client/save",
            data: data  
        })

        modal.ocultar(()=>{
            if(ret.status){
                if(this.crud.isNew){
                    data._id = ret._id
                    data.saldo = 0
                }
                this.crud.afterSave(data);
                this.crud.search("");

                menu.toast("success", "Cliente", "Cliente guardado con éxito")
    
                Swal.fire({
                    icon: 'success',
                    title: "Cliente",
                    text: '¡Cliente guardado con éxito!',
                    toast: true,
                    position: 'top',
                    showConfirmButton: false,
                    timer: 2000
                }) 
                h.playSonido("noti1");
            }else{
                modal.mensaje(ret.message);
            }
        })
    }
    async onDelete(){
        if(!await modal.async_sino(`¿Seguro de borrar el cliente <b>${this.crud.element.name}</b>?`)) return; 
        let resp = await $.ajax({
            method: "DELETE",
            url: "/client/delete",
            data:{ clientId: this.crud.element._id }
        })
        //console.log(resp);
        this.list = this.list.filter(p=>p._id != this.crud.element._id);
        this.crud.list = this.list;
        this.crud.search("");
    }
}