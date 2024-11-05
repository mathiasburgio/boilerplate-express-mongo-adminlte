class Menu{
    constructor(){
        this.sounds = (localStorage.getItem("sounds") === null || localStorage.getItem("sounds") === "true");
        this.darkMode = (localStorage.getItem("darkMode") === "true");
        if(this.darkMode) $("body").addClass("dark-mode");
    }
    showCortina(show=true){

    }
    showLeftMenu(show=true){

    }
    showRightMenu(show=true){
        
    }
    setPermissions(){

    }
    setSounds(enable=true, toggle=true){
        if(toggle){
            this.sounds = !this.sounds;
        }else{
            this.sounds = enable;
        }
        localStorage.setItem("sounds", (this.sounds).toString());
    }
    setDarkMode(enable=true, toggle=true){
        if(toggle){
            localStorage.setItem("sounds", (!this.sounds).toString());
        }else{
            localStorage.setItem("sounds", (enable).toString());
        }
    }
    playSound(name, force=false){
        if(!this.sounds && force == false) return;

    }
    toast(level, title, message, sound=true){
        Swal.fire({
            icon: level,
            title: title,
            text: message,
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 2000
        }) 
        if(sound) this.playSound(level);
    }
}