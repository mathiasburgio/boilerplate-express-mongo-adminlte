class Dashboard{
    constructor(){
        boilerplate();
        this.dropDownSearcher();
        this.sounds();
        this.toast();
        this.expirationBar();
        this.qr();
        this.barcode();

        $('.main-header [data-toggle="tooltip"]').tooltip();
        menu.hideCortina();
    }
    dropDownSearcher(){
        let ar = [
            {id: 1, name: "debian"},
            {id: 2, name: "ubuntu"},
            {id: 3, name: "windows"},
            {id: 4, name: "macos"},
            {id: 5, name: "win xp"},
        ];

        let buscador = new DropdownSearcher({
            input: $("[name='test-dropdownsearcher']"),
            items: ar,
            propId: "id",
            propLabel: "name",
            cb: async e =>{
                console.log("dropdownsearcher: ", e);
                if(e){
                    //modal.mensaje(e.name);
                    $("[name='test-dropdownsearcher']").val(e.name);
                }
            }
        })

        $("[name='test-dropdownsearcher-open']").click(ev=>{
            buscador.open();
        })

        
    }
    sounds(){
        $("[play-sound]").click(ev=>{
            let sound = $(ev.currentTarget).attr("play-sound");
            menu.playSound(sound, true);
        })
    }
    toast(){
        $("[toast-level]").click(ev=>{
            let toastLevel = $(ev.currentTarget).attr("toast-level");
            menu.toast({level: toastLevel, title: "Hello", message: "Im Mathias Burgio"});
        })
    }
    qr(){
        $("[name='make-qr']").click(ev=>{
            utils.getQR({text: "hola carito!"}, $("[name='qr-container']") );
        })
    }
    barcode(){
        $("[name='make-barcode']").click(ev=>{
            let ret = utils.getBarcode("hola mundo", $("[name='barcode-container']") );
            console.log(ret);
        })
    }
    getSuperExcel(){

    }
    printDocument(){

    }
    uploadFile(){
        //to appFiles
        //to private folder
        //with progressBar
    }
    expirationBar(){
        $("[expiration-bar='2050-01-01']").click(ev=>{
            menu.expiration("2050-01-01");
            $("body, html").scrollTop(0)
        })
        $("[expiration-bar='5']").click(ev=>{
            let fx = new Date();
            fx.setDate(fx.getDate() +5);
            menu.expiration(fx);
            $("body, html").scrollTop(0)
        })
        $("[expiration-bar='-3']").click(ev=>{
            let fx = new Date();
            fx.setDate(fx.getDate() -3);
            menu.expiration(fx);
            $("body, html").scrollTop(0)
        })
    }
}