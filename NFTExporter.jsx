/*
MIT License

Copyright (c) 2022 Zizzy Crypto!

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

/*
Name: NFTExporter.jsx

Attribution:

This script is based -- with permission -- on the MultiExporter.jsx script 
written by Matthew Ericson.

http://www.ericson.net/content/2011/06/export-illustrator-layers-andor-artboards-as-pngs-and-pdfs/

Purpose: 

This script is intended for use with Adobe Illustrator.

It is designed to faciliate layer exports for NFT creators, for subsequent use in an NFT art engine.

It allows you to export all layers from the currently selected ArtBoard, subject
to the following:

* Layers beginning with - (minus sign) are skipped
* Layers beginning with + (plus sign) are visible in all exported files.

Output formats are limited to: PNG-8, PNG-24 and JPG.

Transparency is enabled by default.

Prior to export, layer names can be transformed by:

* Prepending a prefix to the file name
* Appending a suffix to the file name
* Replacing 1 or 2 sets of strings in the file name

Replacements can be useful for inserting or manipulating keywords in the 
exported layer name, which will be used by the downstream NFT art engine.

To exclude a layer from any replacements, add * to the start of its name. But note:
the * will be stripped prior to export.

Exported files can also be moved into subdirectories of the export target directory:

Simply treat the layer name as a path and add the subdirectory namne and "/" to the layer name.

For example: a layer with the name "Arms/long" will result in a file called long.png (or long.jpg)
being created in the Arms subdirectory of the export target folder.

*/

var docRef = app.activeDocument;    

var exporter = {
    
    prefix:         "",
    suffix:         "",
    rep1A:          "",
    rep1B:          "",
    rep2A:          "",
    rep2B:          "",    
    base_path:      "",
    transparency:   true,
    format:         null,
    dlg:            null,
    num_to_export:  0,
    num_layers:     0,
    num_layers_to_export: 0,

    visible_layers: [],
    
    init: function() {
		
        this.num_layers = docRef.layers.length;
        
        this.num_layers_to_export = this.get_num_layers_to_export();

        this.show_dialog();

    },
 
    
    show_dialog: function() {
	
        this.dlg = new Window('dialog', 'NFT Artwork Export Tool');
        
        var info = this.dlg.add('statictext', undefined, 'Exports all layers in the active artboard unless its name starts with "-"'); 
        //info.size = [400, 20];
        
        var panel = this.dlg.add('panel', undefined, ''); 
        panel.add('statictext', undefined, 'Transform options:');

        var prefixGrp = panel.add('group', undefined, '')
        prefixGrp.orientation = 'row';
        prefixGrp.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

        var prefixSt = prefixGrp.add('statictext', undefined, 'Add prefix:'); 
        prefixSt.size = [100, 20];

        var prefixEt = prefixGrp.add('edittext', undefined, this.prefix); 
        prefixEt.size = [350, 20];

        var suffixGrp = panel.add('group', undefined, '')
        suffixGrp.orientation = 'row';
        suffixGrp.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

        var suffixSt = suffixGrp.add('statictext', undefined, 'Add suffix:'); 
        suffixSt.size = [100, 20];

        var suffixEt = suffixGrp.add('edittext', undefined, this.suffix); 
        suffixEt.size = [350, 20];


        var repGrp1 = panel.add('group', undefined, '')
        repGrp1.orientation = 'row';
        repGrp1.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

        var repSt1A = repGrp1.add('statictext', undefined, 'Replace (#1):'); 
        repSt1A.size = [100,20]

        var repEt1A = repGrp1.add('edittext', undefined, this.rep1A); 
        repEt1A.size = [150, 20];

        var repSt1B = repGrp1.add('statictext', undefined, ' with:'); 
        repSt1B.size = [30, 20];

        var repEt1B = repGrp1.add('edittext', undefined, this.rep1B); 
        repEt1B.size = [150, 20];


        var repGrp2 = panel.add('group', undefined, '')
        repGrp2.orientation = 'row';
        repGrp2.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

        var repSt2A = repGrp2.add('statictext', undefined, 'Replace (#2):'); 
        repSt2A.size = [100,20]

        var repEt2A = repGrp2.add('edittext', undefined, this.rep2A); 
        repEt2A.size = [150, 20];

        var repSt2B = repGrp2.add('statictext', undefined, ' with: '); 
        repSt2B.size = [30,20];

        var repEt2B = repGrp2.add('edittext', undefined, this.rep2B); 
        repEt2B.size = [150, 20];


        panel.add('statictext', undefined, 'Export options:');

        var dpiGrp = panel.add('group', undefined, '')
        dpiGrp.orientation = 'row';
        dpiGrp.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]

        var dpiSt = dpiGrp.add('statictext', undefined, 'Scaling:'); 
        dpiSt.size = [100, 20]

        var dpiEt = dpiGrp.add('edittext', undefined, "100%"); 
        dpiEt.size = [100, 20];

        // DIR GROUP
        var dirGrp = panel.add( 'group', undefined, '') 
        dirGrp.orientation = 'row'
        dirGrp.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]
        
        var dirSt = dirGrp.add('statictext', undefined, 'Output directory:'); 
        dirSt.size = [100, 20];

        var dirEt = dirGrp.add('edittext', undefined, this.base_path); 
        dirEt.size = [300, 20];

        var chooseBtn = dirGrp.add('button', undefined, 'Choose ...' );
        chooseBtn.onClick = function() { dirEt.text = Folder.selectDialog(); }

        var transPnl = panel.add('group', undefined, ''); 
        transPnl.orientation = 'row'
        transPnl.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP]
        
        var formatSt = transPnl.add('statictext', undefined, 'Export format:'); 
        formatSt.size = [100, 20];    
        
        var formatList = transPnl.add('dropdownlist', undefined, [ 'PNG 8', 'PNG 24', 'JPG' ]);
        formatList.selection = 1;
        
        transPnl.transparentChk = transPnl.add('checkbox', undefined, 'Transparency');
        transPnl.transparentChk.value = this.transparency;

        var progBar = panel.add( 'progressbar', undefined, 0, 100 );
        progBar.size = [400, 10]

        var progLabel = panel.add('statictext', undefined, '...' ); 
        progLabel.size = [400, 20];

        var btnPnl = this.dlg.add('group', undefined, ''); 
        btnPnl.orientation = 'row'

        btnPnl.cancelBtn = btnPnl.add('button', undefined, 'Cancel', {name:'cancel'});
        btnPnl.cancelBtn.onClick = function() { 

            exporter.dlg.close();
        };

        // OK button
        btnPnl.okBtn = btnPnl.add('button', undefined, 'Export', {name:'ok'});
        btnPnl.okBtn.onClick = function() { 
                
                exporter.prefix       = prefixEt.text; 
                exporter.suffix       = suffixEt.text; 
                exporter.base_path    = dirEt.text;

                exporter.rep1A        = repEt1A.text;
                exporter.rep1B        = repEt1B.text;

                exporter.rep2A        = repEt2A.text;
                exporter.rep2B        = repEt2B.text;
                
                if( exporter.base_path.length == 0) {
                    Window.alert( 'No output directory provided. Please choose an output directory.' );
                }
                else if( exporter.rep1B.length > 0 && exporter.rep1A.length == 0 ) {
                    Window.alert( 'The first replacement does not have a target string.' );
                }
                else if( exporter.rep2B.length > 0 && exporter.rep2A.length == 0 ) {
                    Window.alert( 'The second replacement does not have a target string.' );
                }                
                else {
                    exporter.transparency = transPnl.transparentChk.value; 
                    exporter.format       = formatList.selection.text;
                    exporter.scaling      = parseFloat( dpiEt.text.replace( /\% /, '' ));   
                    exporter.export_code = 'layers';        
                    exporter.run_export();  
                }
        };

        exporter.update_export_desc( progLabel );
        
        this.dlg.progLabel = progLabel;
        this.dlg.progBar = progBar;
        
        this.dlg.show();
    },

    
    update_export_desc: function ( progLabel ) {
	
 
	    var current_name = docRef.artboards[ docRef.artboards.getActiveArtboardIndex() ].name; 
	    progLabel.text = 'Will export ' + this.num_layers_to_export + ' of ' + this.num_layers+ ' layers on artboard "' + current_name +'"' ;        
	    this.num_to_export = this.num_layers_to_export;

    },

    run_export: function() {

        var num_exported = 0;
        var options;
        
        if ( this.format == 'PNG 8' ) {
            options = new ExportOptionsPNG8();
            options.antiAliasing = true;
            options.transparency = this.transparency; 
            options.artBoardClipping = true;
            options.horizontalScale = this.scaling;
            options.verticalScale = this.scaling;		    
                
        } else if ( this.format == 'PNG 24' ) {
            options = new ExportOptionsPNG24();
            options.antiAliasing = true;
            options.transparency = this.transparency; 
            options.artBoardClipping = true;
            options.horizontalScale = this.scaling;
            options.verticalScale = this.scaling;		    
            
        } else if ( this.format == 'JPG' ) {
            options = new ExportOptionsJPEG();
            options.antiAliasing = true;
            options.artBoardClipping = true;
            options.horizontalScale = this.scaling;
            options.verticalScale = this.scaling;		    
        }

        this.hide_all_layers();    

        for ( var i = 0; i < docRef.layers.length; i++ ) {
            
            var layer = docRef.layers[i];
            var lyr_name = layer.name;

            // String.prototype.trim() not supported
            
            lyr_name = lyr_name.replace( /^\s+/, "" );
            
            // String.prototype.replaceAll() not supported

            var starred = lyr_name.indexOf("*");
            if( starred >= 0 )
                lyr_name = lyr_name.replace( /^\*/, "" );

            var dirs = "";
            var idx = lyr_name.lastIndexOf("/");
            if( idx >= 0 ) {
                dirs = lyr_name.substring(0, idx + 1);
                lyr_name = lyr_name.substring(idx + 1);     
            }

            if ( starred == -1 ) {

                if( this.rep1A.length > 0 ) {

                    lyr_name = lyr_name.replace( this.rep1A, this.rep1B );

                }

                if( this.rep2A.length > 0 ) {

                    lyr_name = lyr_name.replace( this.rep2A, this.rep2B );

                }

            }
   
            if ( !lyr_name.match( /^(\+|\-)/ ) ) {

                var base_filename = this.base_path + "/" + dirs + this.prefix + lyr_name + this.suffix 

                layer.visible = true;
                
                if ( this.format.match( /^PNG/ )) {

                    var destFile = new File( base_filename + '.png' );   
                    var export_type = this.format == 'PNG 8' ? ExportType.PNG8 : ExportType.PNG24;
                    docRef.exportFile(destFile, export_type , options);
                
                } 
                else if ( this.format.match( /^JPG/ )) {

                    var destFile = new File( base_filename + '.jpg' );   
                    docRef.exportFile(destFile, ExportType.JPEG , options);

                }
                
                layer.visible = false;

                num_exported++;
                
                this.dlg.progLabel.text = 'Exported ' + num_exported + ' of ' + this.num_to_export;
                this.dlg.progBar.value = num_exported / this.num_to_export * 100;
                
                this.dlg.update();        
            }
        
        }  
	
        this.restore_hidden_layers();

	    this.dlg.close();
    },
    
    hide_all_layers: function() {
        
        this.visible_layers = [];
        
        for(var i = 0; i < docRef.layers.length; i++ ) {
            
            var layer = docRef.layers[i];

            if( layer.visible )
                this.visible_layers.push(i);
            
            var lyr_name = layer.name;
            
            if ( lyr_name.match( /^\+/ ) ) {
                layer.visible = true;
            } 
            else {
                layer.visible = false;
            }
        }

    },

    // Array.prototype.indexOf() not supported

    restore_hidden_layers: function() {
        
        for(var i = 0; i < docRef.layers.length; i++ ) {
            
            var found = false;
            for(var j = 0; j < this.visible_layers.length; j++ ) {
                if( this.visible_layers[j] == i ) {
                    found = true;
                    break;
                }
            }

            if( found ) 
                docRef.layers[i].visible = true;
        }

    },
    
    get_num_layers_to_export: function() {

        var cnt = 0;
        
        for(var i = 0; i < docRef.layers.length; i++) {
            
            if ( !docRef.layers[i].name.match( /^(\+|\-)/ ) )
                cnt++;
        }
	
	    return cnt;
    },
    
};



exporter.init();



