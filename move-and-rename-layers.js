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


Name: move-and-rename-layers.rb
Purpose: 

This script is for NFT creators who need to move numerous layers from a
folder containg PNG layers into various subdirectories that match an NFT art engine's
configuration.

The script can also replace strings in the file name, which can be useful with custom
art engine configurations.

In this example:

* A tag idenfied by @COLOR is replaced with the string @Purple. Later, the art engine
  will look for @ in layer names and ensure that an NFT with a Purple body also has Purple arms
  and legs etc. 
* Files that include a directory delimiter (such as =) are moved into a directory matching the
  the word preceding the delimiter. Example "Arms=Long#1.png" will be placed in the 
  Arms sub-directory.
*/

const fs = require("fs");
const path = require("path");

const layers_dir = "./HAE/layers-messy/";

const color_tag = "@COLOR";
const color_name = "Purple";

const dir_delimiter = "=";


const files = fs.readdirSync(layers_dir);

files.forEach(file => {

    // Restrict to PNG files
    if( path.extname(file) === ".png" ) {

        console.log(`Orignal: ${file}`);

        // Replacements
        // Add more, if you want...
        let name = file.replace(color_tag, "@" + color_name);

        // Extract directory from file name
        // If no directory is found, the file will not be moved
        let dir = "";
        let arr = name.split(dir_delimiter);
        if( arr.length == 2 ) {
            dir = arr[0] + "/";
            name = arr[1];
        }

        fs.renameSync(layers_dir + file, layers_dir + dir + name);

        console.log(`New: ${dir}${name}`);

    }
    


});