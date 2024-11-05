class Config{
    constructor(){
        $("#config [name='guardar']").click(ev=>{
            this.save();
        })
    }
    async save(){
        let aux = {};
        $("#config [name]").each((ind, ev)=>{
            let ele = $(ev);
            let tag = ele.prop("tagName");
            if(tag == "select" || tag == "input" || tag == "textarea"){
                aux[ele.prop("name")] = ele.val();
            }

        })

        let resp = await $.post({
            url: "/config/save",
            data : aux
        });

        if(resp.error){
            modal.mensaje(resp.message);
        }else{
            modal.mensaje("Configuración guardada con éxito!");
        }
    }
}
