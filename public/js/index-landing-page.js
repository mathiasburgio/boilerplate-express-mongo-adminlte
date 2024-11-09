class IndexLandingPage{
    constructor(){
        this.showPassword = false;

        $("[name='login']").click(ev=>{
            this.loginModal();
        })
        $("[name='registry']").click(ev=>{
            this.registryModal();
        })
        $("[name='show-password']").click(ev=>{
            this.toggleShowPassword();
        })
    }
    loginModal(){
        let _showPassword = false;
        const toggleShowPassword = () => {
            _showPassword = !_showPassword;
            let ele = $("#modal [name='show-password']");
            let inp = $("#modal [name='password']");
            if(_showPassword){
                ele.find("i").addClass("fa-eye").removeClass("fa-eye-slash");
                ele.addClass("btn-warning").removeClass("btn-light");
                inp.prop("type", "text");
            }else{
                ele.find("i").addClass("fa-eye-slash").removeClass("fa-eye");
                ele.addClass("btn-light").removeClass("btn-warning");
                inp.prop("type", "password");
            }
        }
        const tryLogin = async () => {
            const email = $("#modal [name='email']").val();
            const password = $("#modal [name='password']").val();
    
            let resp = await $.post({
                url: "/user/login",
                data: {
                    email,
                    password,
                }
            })
            if(resp?.error){
                modal.mensaje(resp.message);
                return false;
            }else{
                window.location.href = "/dashboard/index";
                return true;
            }
        }

        modal.mostrar({
            titulo: "Iniciar sesión",
            cuerpo: $("#modal-login").html(),
            botones: "volver"
        });

        $("#modal [name='try-login']").click(async ev=>{
            let ele = $(ev.currentTarget);
            ele.prop("disabled", true);
            let status = await this.login();
            if(!status) ele.prop("disabled", false);
        })

        $("#modal [name='show-password']").click(ev=>{
            toggleShowPassword();
        })
    }

    registryModal(){
        let body = $("#registry-modal").html();
        modal.mostrar({
            titulo: "registry",
            cuerpo: body,
            botones: "volver"
        });

        $("#modal [name='registry']").click(async ev=>{
            modal.setEsperando3(true, "Validando datos...");

            let data = {
                companyName: $("#modal [name='companyName']").val(),
                email: $("#modal [name='email']").val(),
                password: $("#modal [name='password']").val(),
            };
            console.log(data);

            let resp = await $.post({
                url: "/user/create-user-and-company",
                data: data
            })
            console.log(resp);
            if(resp.status == 200 && resp.data == "ok"){
                window.location.href = "/dashboard";
            }else{
                modal.setEsperando3(false);
                await modal.addAsyncPopover({querySelector: ele, message: resp.message});
            }
        });
    }
    
}