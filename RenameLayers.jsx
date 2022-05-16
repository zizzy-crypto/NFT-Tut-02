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
Name: RenameLayers.jsx
Purpose: 

This script is intended for use with Adobe Illustrator.

It allows you to rename all layers in the active document.

You can also:
*   Restrict the renamed layers to only layers containing a keyword.
*   Exclude layers containing a keyword.

Note: seems to work fine with other Adobe Apps, such as PS.

*/


var docRef = app.activeDocument;    

var task = {

    prefix:     "",
    suffix:     "",
    text:       "",
    replace:    "",
    matching:   "",
    excluding:  "",
    
    init: function() {

        this.show_dialog();

    },
 
    
    show_dialog: function() {
	
        this.dlg = new Window('dialog', 'Rename Layers');
        
        var addPanel = this.dlg.add('panel', undefined, 'Add text to layer names:');
        
        var prefixGroup = addPanel.add('group', undefined, '');
        prefixGroup.orientation = 'row';
        prefixGroup.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

        var prefixLabel = prefixGroup.add('statictext', undefined, 'Prefix:'); 
        prefixLabel.size = [150, 20];

        var prefixField = prefixGroup.add('edittext', undefined, this.prefix); 
        prefixField.size = [200, 20];

        var suffixGroup = addPanel.add('group', undefined, '');
        suffixGroup.orientation = 'row';
        suffixGroup.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

        var suffixLabel = suffixGroup.add('statictext', undefined, 'Suffix:'); 
        suffixLabel.size = [150, 20];

        var suffixField = suffixGroup.add('edittext', undefined, this.suffix); 
        suffixField.size = [200, 20];

        
        var generalPanel = this.dlg.add('panel', undefined, 'Replace text in layer names:'); 

        var textGroup = generalPanel.add('group', undefined, '');
        textGroup.orientation = 'row';
        textGroup.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

        var textLabel = textGroup.add('statictext', undefined, 'Replace:'); 
        textLabel.size = [150, 20];

        var textField = textGroup.add('edittext', undefined, this.text); 
        textField.size = [200, 20];

        var replaceGroup = generalPanel.add('group', undefined, '')
        replaceGroup.orientation = 'row';
        replaceGroup.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

        var replaceLabel = replaceGroup.add('statictext', undefined, 'With:'); 
        replaceLabel.size = [150, 20];

        var replaceField = replaceGroup.add('edittext', undefined, this.replace); 
        replaceField.size = [200, 20];


        var filterPanel = this.dlg.add('panel', undefined, 'Filters (optional):'); 

        var matchingGroup = filterPanel.add('group', undefined, '')
        matchingGroup.orientation = 'row';
        matchingGroup.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

        var matchingLabel = matchingGroup.add('statictext', undefined, 'Only Layers matching:'); 
        matchingLabel.size = [150, 20]

        var matchingField = matchingGroup.add('edittext', undefined, this.matching); 
        matchingField.size = [200, 20];



        var excludeGroup = filterPanel.add('group', undefined, '')
        excludeGroup.orientation = 'row';
        excludeGroup.alignment = [ScriptUI.Alignment.LEFT, ScriptUI.Alignment.TOP];

        var excludingLabel = excludeGroup.add('statictext', undefined, 'Exclude Layers matching:'); 
        excludingLabel.size = [150, 20];

        var excludingField = excludeGroup.add('edittext', undefined, this.excluding); 
        excludingField.size = [200, 20];



        var buttonPanel = this.dlg.add('group', undefined, ''); 
        buttonPanel.orientation = 'row'

        buttonPanel.cancelBtn = buttonPanel.add('button', undefined, 'Cancel', {name:'cancel'});
        buttonPanel.cancelBtn.onClick = function() { 

            task.dlg.close();
        };

        // OK button
        buttonPanel.okBtn = buttonPanel.add('button', undefined, 'Run', {name:'ok'});
        buttonPanel.okBtn.onClick = function() { 
                
                task.prefix     = prefixField.text; 
                task.suffix     = suffixField.text; 
                task.text       = textField.text; 
                task.replace    = replaceField.text; 
                task.matching   = matchingField.text;
                task.excluding  = excludingField.text;
                
                if( task.prefix.length == 0 && task.suffix.length == 0 && task.text.length == 0 ) {
                    Window.alert( "'Prefix', 'Suffix' and 'Replace' cannot all be empty. Please type a value and retry..." );    
                }
                else if( task.matching.length > 0 && task.matching === task.excluding ) {
                    Window.alert( "'Only' and 'Excluding' filters cannot be the same. Please change one of the filters and try again..." );
                }              
                else {    
                    task.run();  
                }
        };
        
        this.dlg.show();
    },

    run: function() {
  
        for ( var i = 0; i < docRef.layers.length; i++ ) {

            var excluded = false;
            if( this.excluding.length > 0)
                excluded = (docRef.layers[i].name.indexOf(this.excluding) >= 0);

            if( this.matching.length > 0) {

                var found = docRef.layers[i].name.indexOf(this.matching);

                if( found >= 0 && !excluded) {
                    if( task.text.length > 0 )
                        docRef.layers[i].name = docRef.layers[i].name.replace( this.text, this.replace );
                        
                    if( task.prefix.length > 0 )
                        docRef.layers[i].name = task.prefix + docRef.layers[i].name;

                    if( task.suffix.length > 0 )
                        docRef.layers[i].name = docRef.layers[i].name + task.suffix;
                }

            }
            else {
                
                if( !excluded ) {
                    if( task.text.length > 0 )
                        docRef.layers[i].name = docRef.layers[i].name.replace( this.text, this.replace );
                        
                    if( task.prefix.length > 0 )
                        docRef.layers[i].name = task.prefix + docRef.layers[i].name;

                    if( task.suffix.length > 0 )
                        docRef.layers[i].name = docRef.layers[i].name + task.suffix;
                }

            }
    
        }  

	    this.dlg.close();
    },
    
};



task.init();



