class Index2{
    constructor(){
        this.showPassword = false;

        $("[name='login']").click(async ev=>{
            let ele = $(ev.currentTarget);
            ele.prop("disabled", true);
            let status = await this.login();
            if(!status) ele.prop("disabled", false);
        })
        $("[name='show-password']").click(ev=>{
            this.toggleShowPassword();
        })
    }
    async login(){
        const email = $("[name='email']").val();
        const password = $("[name='password']").val();

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
    toggleShowPassword(){
        this.showPassword = !this.showPassword;
        let ele = $("[name='show-password']");
        let inp = $("[name='password']");
        if(this.showPassword){
            ele.find("i").addClass("fa-eye").removeClass("fa-eye-slash");
            ele.addClass("btn-warning").removeClass("btn-light");
            inp.prop("type", "text");
        }else{
            ele.find("i").addClass("fa-eye-slash").removeClass("fa-eye");
            ele.addClass("btn-light").removeClass("btn-warning");
            inp.prop("type", "password");
        }
    }
}