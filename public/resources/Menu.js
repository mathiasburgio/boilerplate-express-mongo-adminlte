class Menu{
    constructor(){
        this.sounds = (localStorage.getItem("sounds") === null || localStorage.getItem("sounds") === "true");
        this.setSounds(this.sounds);
        $("#toggle-sounds").click(ev=> this.setSounds() );
        
        this.darkMode = (localStorage.getItem("darkMode") === "true");
        this.setDarkMode(this.darkMode);
        $("#toggle-dark-mode").click(ev=> this.setDarkMode() );

        this.upperCase = (localStorage.getItem("upperCase") === "true");
        this.setUpperCase(this.upperCase);
        $("#toggle-upper-lower-case").click(ev=> this.setUpperCase() );

        $(".nav-logout").click(async()=>{
            let resp = await modal.pregunta(`¿Confirma <b>cerrar sesión</b>?`);
            if(!resp) return;
            window.location.href = "/user/logout";
        })
    }
    setPageName(title, name=null){
        document.title = title;
        $("#pageName").html(name || title);
    }
    hideCortina(){
        $("body, .content-wrapper").scrollTop(0);

        $("#cortina").animate({
            opacity: 0
        },"fast", ()=>{
            $("body, .content-wrapper").removeClass("overflow-hidden");
            $(".wrapper").removeClass("d-none");
            $("#cortina").remove();
            $(".content-wrapper>.content").removeClass("d-none");
            $(".content-wrapper>.content").animate({
                opacity: 1
            }, "fast")
        })
    }
    showLeftMenu(show=null){
        let isOpen = $("body").hasClass("sidebar-collapse");
        if(show === true){
            if(isOpen) return;
            $("[data-widget='pushmenu']").click();
        }else if(show === false){
            if(isOpen == false) return;
            $("[data-widget='pushmenu']").click();
        }else{
            $("[data-widget='pushmenu']").click();
        }
    }
    showRightMenu(show=null){
        let isOpen = $("body").hasClass("control-sidebar-slide-open");
        if(show === true){
            if(isOpen) return;
            $("[data-widget='control-sidebar']").click();
        }else if(show === false){
            if(isOpen == false) return;
            $("[data-widget='control-sidebar']").click();
        }else{
            $("[data-widget='control-sidebar']").click();
        }
    }
    setPermissions(permissions=[]){
        $(".main-sidebar .sidebar .nav-sidebar li").each((ind, ev)=>{
            let ele = $(ev);
            let permission = $(ev).attr("permission");
            if(!permission) return; //salteo el menú en caso de no necesitar permisos
            
            //aqui se pueden usar 2 estrategias: 
            //1-mostrar los menues para los que se tiene permisos
            //2-ocultar los menues de los que no se tiene permisos
            if( ele.hasClass("d-none")){
                //muestro menues ocultos
                if(permissions.includes("*") || permissions.includes(permission)) ele.removeClass("d-none");
            }else{
                //oculto los permisos no concedidos
                if(permissions.includes("*") == false && permissions.includes(permission) == false) ele.addClass("d-none");
            }
        })
    }
    setUpperCase(enable=null){
        if(enable === true) this.upperCase = true;
        else if(enable === false) this.upperCase = false;
        else this.upperCase = !this.upperCase;
        
        localStorage.setItem("upperCase", (this.upperCase).toString());
        if(this.upperCase){
            $("#toggle-upper-lower-case").removeClass("btn-light").addClass("btn-primary").html("A");
            $("body").addClass("table-uppercase");
        }else{
            $("#toggle-upper-lower-case").removeClass("btn-primary").addClass("btn-light").html("Aa");
            $("body").removeClass("table-uppercase");
        }
    }
    setSounds(enable=null){
        if(enable === true) this.sounds = true;
        else if(enable === false) this.sounds = false;
        else this.sounds = !this.sounds;
        
        localStorage.setItem("sounds", (this.sounds).toString());
        if(this.sounds){
            $("#toggle-sounds").removeClass("btn-light").addClass("btn-primary");
            $("#toggle-sounds i").removeClass("fa-volume-xmark").addClass("fa-volume-high");
        }else{
            $("#toggle-sounds").removeClass("btn-primary").addClass("btn-light");
            $("#toggle-sounds i").removeClass("fa-volume-high").addClass("fa-volume-xmark");
        }
    }
    setDarkMode(enable=null){

        if(enable === true) this.darkMode = true;
        else if(enable === false) this.darkMode = false;
        else this.darkMode = !this.darkMode;
        
        localStorage.setItem("darkMode", (this.darkMode).toString());
        if(this.darkMode){
            $("#toggle-dark-mode").removeClass("btn-outline-warning").addClass("btn-secondary");
            $("#toggle-dark-mode i").removeClass("fa-sun").addClass("fa-moon");
            $("body").addClass("dark-mode");
        }else{
            $("#toggle-dark-mode").removeClass("btn-secondary").addClass("btn-outline-warning");
            $("#toggle-dark-mode i").removeClass("fa-moon").addClass("fa-sun");
            $("body").removeClass("dark-mode");
        }
    }
    playSound(audioName, force=false){
        if(!this.sounds && force == false) return;
        audioName = audioName.replace(".mp3", "");

        const audioPlayer = document.getElementById('audioPlayer');
        const sources = audioPlayer.querySelectorAll('#audioPlayer source');

        // Buscar la fuente que coincida con el data-audio especificado
        const source = Array.from(sources).find(src => src.dataset.audio === audioName);
        
        audioPlayer.src = source.src;
        audioPlayer.play();
    }
    toast({level, title, message, sound=true}){
        let _level = level;
        if(_level == "danger") _level = "error";
        if(_level == "primary") _level = "success";

        Swal.fire({
            icon: _level,
            title: title,
            text: message,
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 2500
        }) 
        if(sound) this.playSound(level);
    }
    expiration(expirationDate=null){
        let days = fechas.diff_days(new Date(), expirationDate);
        if(days <= 0){
            let fox = `<b>Suscripción vencida</b> renuevala hacienco clic en `;
            $("#expiration [name='text']").html(fox);
            $("#expiration").removeClass("d-none").addClass("bg-danger").addClass("text-white");
            return true;
        }else if(days < 7){
            let fox = `Tu suscripción vence en <b>${days}</b> días renuevala hacienco clic en `;
            $("#expiration [name='text']").html(fox);
            $("#expiration").removeClass("d-none").addClass("bg-warning").addClass("text-black");
        }else{
            $("#expiration").addClass("d-none")
        }
        return false;
    }
}