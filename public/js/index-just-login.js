class IndexJustLogin{
    constructor(){
        $("[name='login']").click(async ev=>{
            let ele = $(ev.currentTarget);
            ele.prop("disabled", true);
            let status = await this.login();
            if(!status) ele.prop("disabled", false);
        })

        utils.bindShowPasswordEvent( $("[name='show-password']"), $("[name='password']") );
    }
    async login(){
        const email = $("[name='email']").val();
        const password = $("[name='password']").val();

        await modal.asyncEsperando("Validando datos...");
        try{
            let resp = await $.post({
                url: "/user/login",
                data: { email, password }
            })
            modal.ocultar();
            if(resp.message == "ok")  window.location.href = "/dashboard";
        }catch(err){
            modal.ocultar(()=>{
                modal.mensaje(err?.responseJSON?.error || err?.responseText || "error");
            });
        }
    }
}