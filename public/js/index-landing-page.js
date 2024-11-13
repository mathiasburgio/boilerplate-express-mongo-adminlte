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

        $(".panel").hover(ev=>{
            $(ev.currentTarget).find(".change-panel-left").removeClass("d-none").addClass("d-flex");
            $(ev.currentTarget).find(".change-panel-right").removeClass("d-none").addClass("d-flex");
        }).mouseleave(ev=>{
            $(ev.currentTarget).find(".change-panel-left").addClass("d-none").removeClass("d-flex");
            $(ev.currentTarget).find(".change-panel-right").addClass("d-none").removeClass("d-flex");
        })

        $("[scroll-to]").click(ev=>{
            let ele = $(ev.currentTarget);
            let target = ele.attr("scroll-to");
            this.scrollTo(target);
        })

        $(".change-panel-left").click(ev=>{
            let padre = $(ev.currentTarget).parent();
            let hermanos = padre.find("[visible]");
            let indiceVisible = Array.from(hermanos).findIndex(element => $(element).attr("visible") == "true" );
            let nuevoIndiceVisible = -1;
            if(indiceVisible == 0) nuevoIndiceVisible = hermanos.length - 1;
            else nuevoIndiceVisible = indiceVisible -1;

            $(hermanos[indiceVisible]).addClass("d-none").attr("visible", "false");
            $(hermanos[nuevoIndiceVisible]).removeClass("d-none").attr("visible", "true");
        })
        $(".change-panel-right").click(ev=>{
            let padre = $(ev.currentTarget).parent();
            let hermanos = padre.find("[visible]");
            let indiceVisible = Array.from(hermanos).findIndex(element => $(element).attr("visible") == "true" );
            let nuevoIndiceVisible = -1;
            if(indiceVisible == hermanos.length -1) nuevoIndiceVisible = 0;
            else nuevoIndiceVisible = indiceVisible +1;

            $(hermanos[indiceVisible]).addClass("d-none").attr("visible", "false");
            $(hermanos[nuevoIndiceVisible]).removeClass("d-none").attr("visible", "true");
        })
        $(".contact-whatsapp").click(ev=>{
            let text = encodeURI(`Hola *Mateflix* `);
            let win = window.open("https://wa.me/542227571951?text=" + text, "_blank");
        })
    }
    loginModal(){
        
        modal.mostrar({
            titulo: "Iniciar sesión",
            cuerpo: $("#login-modal").html(),
            botones: "volver"
        });

        utils.bindShowPasswordEvent( $("#modal [name='show-password']"), $("#modal [name='password']") );

        $("#modal [name='try-login']").click(async ev=>{
            let ele = $(ev.currentTarget);
            const email = $("#modal [name='email']").val();
            const password = $("#modal [name='password']").val();
    
            modal.setEsperando3(true, "Validando datos...");
            try{
                let resp = await $.post({
                    url: "/user/login",
                    data: {
                        email,
                        password,
                    }
                })
                if(resp.message == "ok"){
                    modal.setEsperando3(false, "Validando datos...");
                    window.location.href = "/dashboard";
                }
            }catch(err){
                modal.setEsperando3(false, "Validando datos...");
                modal.addAsyncPopover({querySelector: ele, message: (err?.responseJSON?.error || err?.responseText || "ERROR")});
            }
        })

        $("#modal [name='forgot-password']").click(ev=>{
            modal.ocultar(()=>{
                this.forgotPasswordModal();
            });
        })
    }
    registryModal(){
        let body = $("#registry-modal").html();
        modal.mostrar({
            titulo: "registry",
            cuerpo: body,
            botones: "volver"
        });

        utils.bindShowPasswordEvent($("#modal [name='show-password']"), $("#modal [name='password']"));

        $("#modal [name='registry']").click(async ev=>{
            let ele = $(ev.currentTarget);
            modal.setEsperando3(true, "Validando datos...");
            
            try{
                let data = {
                    companyName: $("#modal [name='companyName']").val(),
                    email: $("#modal [name='email']").val(),
                    password: $("#modal [name='password']").val(),
                };
    
                let resp = await $.post({
                    url: "/user/create-user-and-company",
                    data: data
                })
                
                if(resp.message == "ok"){
                    modal.setEsperando3(false, "Validando datos...");
                    window.location.href = "/dashboard";
                }
            }catch(err){
                modal.setEsperando3(false, "Validando datos...");
                modal.addAsyncPopover({querySelector: ele, message: (err?.responseJSON?.error || err?.responseText || "ERROR")});
            }
        });
    }
    forgotPasswordModal(){
        let body = $("#reset-password-modal").html();
        modal.mostrar({
            titulo: "registry",
            cuerpo: body,
            botones: "volver"
        });
    }
    scrollTo(element){
        $([document.documentElement, document.body]).animate({
            scrollTop: $(element).offset().top
        }, 700);
    }
}