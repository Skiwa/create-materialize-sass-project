import chalk from 'chalk';
import fs from 'fs';
import http from 'http';
import unzipper from 'unzipper';
import request from 'request';
import namer from 'color-namer';

export async function skiwaMaterializeBoilerplate(options){



  //Generating files
  if(!fs.existsSync('./'+options.name)){

    //Creating folders
    createFolders(options);

    //Creating main files
    createMainFiles(options);

    //Adding materialize
    // retrieveMaterializeFiles(options);

    //Adding jquery
    if(options.jquery){
      retrieveJQuery(options);
    }

    //Generating the stylesheets
    //Retrieving the colors and creating the functions
    //Creating the sections

    //Generating index.html

    var colorPairs = await convertColors(options);
    colorPairs.forEach(color=>{
      console.log(chalk.hex(color.value).bold('Couleur : '+color.name+' ajoutée') + ' - ('+color.name+')');
    })

  }else{
    console.log(chalk.red.bold(`ERREUR: Un dossier avec le nom ${options.name} existe déjà !`));
  }



}

/**
 * Creates the main folders
 */
async function createFolders(options){
  fs.mkdirSync('./'+options.name);
  fs.mkdirSync('./'+options.name+'/css');
  fs.mkdirSync('./'+options.name+'/files');
  fs.mkdirSync('./'+options.name+'/img');
  fs.mkdirSync('./'+options.name+'/img/social');
  fs.mkdirSync('./'+options.name+'/js');
  fs.mkdirSync('./'+options.name+'/sass');
}

/**
 * Creates the main user files
 */
async function createMainFiles(options){
  fs.writeFileSync('./'+options.name+'/js'+'/main.js');
  fs.writeFileSync('./'+options.name+'/sass'+'/main.scss');
  fs.writeFileSync('./'+options.name+'/index.html');
}

/**
 * Download the materialize archive and retrieve its content
 */
async function retrieveMaterializeFiles(options){

  //Downloads the archive and extracts it
  const directory = await unzipper.Open.url(request,'https://github.com/Dogfalo/materialize/releases/download/1.0.0/materialize-src-v1.0.0.zip')
  .then(d=>{

    //Creates the materialize folders
    fs.mkdirSync('./'+options.name+'/sass/materialize');
    fs.mkdirSync('./'+options.name+'/sass/materialize/components');
    fs.mkdirSync('./'+options.name+'/sass/materialize/components/forms');
    fs.mkdirSync('./'+options.name+'/js/materialize');
    fs.mkdirSync('./'+options.name+'/js/materialize/bin');

    //Iterates with each file
    d.files.forEach(f=>{

      //Removes the first path folder
      var path = f.path.split('/');
      path.shift();

      //Only retrieves js and sass files while excluding the uncompressed js
      if((f.path.includes('/js/') || f.path.includes('/sass/')) && f.path !== 'materialize-src/js/bin/materialize.js'){
        //adds the 'materialize' folder in the path
        path.splice(1,0,'materialize');
        //reconstructs the path
        path=path.join('/');

        //Copies the file
        if(!fs.existsSync('./'+options.name+'/'+path)){
          fs.writeFileSync('./'+options.name+'/'+path);
          console.log(chalk.yellow.bold(path));
        }
      }
    });
  });
}

/**
 * Download JQuery
 */
async function retrieveJQuery(options){
  //Creates the file
  const file = fs.createWriteStream('./'+options.name+'/js/jquery-3.4.1.min.js');
  //Retrieve the contents
  const request = http.get("http://code.jquery.com/jquery-3.4.1.min.js", function(response) {
    response.pipe(file);
    //Close the write stream
    file.on('finish', function() {
      console.log(chalk.yellow.bold("Jquery ajouté"));
      file.close();
    });
  });
}

/**
 * Converts color to name/value pairs
 */
async function convertColors(options){
  var colors = new Array();
  options.colors.forEach(color=>{
    colors.push({
      name: namer(color, {pick:['ntc']}).ntc[0].name.replace(/\s+/g, '-').toLowerCase(),
      value: color
    })
  });

  return colors;
}
