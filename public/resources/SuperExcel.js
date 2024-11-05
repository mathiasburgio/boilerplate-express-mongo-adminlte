class SuperExcel{
    constructor(){
        this.columnsLetters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
        this.currentFile = null;
    }
    setHeader(cell, value){
        cell.fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor:{argb:'3F7FBF'}
            };
        cell.font = {
            name: 'Arial',
            family: 4,
            size: 12,
            color: { argb: 'FFFFFF' },
            underline: false,
            bold: true
        };
        cell.border = {
            top: {style:'thin', color: {argb:'FFFFFF'}},
            left: {style:'thin', color: {argb:'FFFFFF'}},
            bottom: {style:'thin', color: {argb:'FFFFFF'}},
            right: {style:'thin', color: {argb:'FFFFFF'}}
        };
    }
    columnToInt(columnHeader){
        return this.columnsLetters.indexOf( columnHeader.toLowerCase() );
    }
    intToColumn(index){
        return this.columnsLetters[index].toUpperCase();
    }
    writeTable(arrayOfObjects, startCell=null){
        if(Array.isArray(arrayOfObjects) == false){
            console.error("arrayOfObjects debe ser un array de objects"); 
            return;
        }
        if(startCell === null){
            console.error("startCell debe ser un workSheet().getCell()"); 
            return;
        }
        if(arrayOfObjects.length == 0){
            console.error("El array esta vacio");
            return;
        }

        let currentRow = startCell.row;
        let currentColumn = this.columnToInt(startCell.column.letter);
        let cc = 0;
        for(let prop in arrayOfObjects[0]){
            let cell = this.currentFile.getWorksheet(startCell.worksheet).getCell(this.intToColumn(currentColumn + cc) + currentRow.toString());
            this.setHeader(cell, prop);
            cc++;
        }

        currentRow += 1;//aumento por el encabezado
        let cr = 0;
        for(let item of arrayOfObjects){

            currentColumn = this.columnToInt(startCell.column.letter);
            for(let prop in item){
                let val = item[prop];
                let cell = this.currentFile.getWorksheet(startCell.worksheet).getCell(this.intToColumn(currentColumn + cr) + currentRow.toString());
                cell.value = val.toString();
            }
            cr++;
        }
    }
    writeTableFromHTMLTable(querySelector, startCell=null){
        if(typeof querySelector != "string"){
            console.error("querySelector debe ser un string"); 
            return;
        }
        if(startCell === null){
            console.error("startCell debe ser un workSheet().getCell()"); 
            return;
        }

        let currentRow = startCell.row;
        let currentColumn = this.columnToInt(startCell.column.letter);
        $(query).find("thead th").each((ind, ev)=>{
            let htmlCell = $(ev);
            let cell = this.currentFile.getWorksheet(startCell.worksheet).getCell(this.intToColumn(currentColumn + ind) + currentRow.toString());
            this.setHeader(cell, htmlCell.text());
        })

        currentRow += 1;//aumento por el encabezado
        $(query).find("tbody tr").each((ind, ev)=>{
            let htmlRow = $(ev);
            currentColumn = this.columnToInt(startCell.column.letter);
            htmlRow.find("td").each((ind, ev)=>{
                let cell = this.currentFile.getWorksheet(startCell.worksheet).getCell(this.intToColumn(currentColumn + ind) + currentRow.toString());
                cell.value = htmlCell.text();
            })
            currentRow += 1;
        })

    }
    createFile(sheetNames=["datos"]){
        this.currentFile = new ExcelJS.Workbook();
        sheetNames.forEach(sheetName=>{
            this.currentFile.addWorksheet(sheetName);
        })
        return this.currentFile;
    }
    exportFile(name){
        this.currentFile.xlsx.writeBuffer().then(function(buffer){
            if(typeof saveAs == "undefined"){
                console.log("falta saveAs")
                alert("Falta el archivo saveAs"); 
                return;
            }
            saveAs(new Blob([buffer],{type:"application/vnd.ms-excel;charset=utf-8"}), name + '.xlsx');
            modal.mensaje("Archivo exportado con éxito.");
        });
    }
}