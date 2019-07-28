import chalk from 'chalk';
import fs from 'fs';
import http from 'http';
import unzipper from 'unzipper';
import request from 'request';
import namer from 'color-namer';

export async function skiwaMaterializeBoilerplate(options){


  if(!fs.existsSync('./'+options.name)){

    //Creating folders
    createFolders(options);

    //Creating main files
    createMainFiles(options);

    //Adding materialize
    retrieveMaterializeFiles(options);

    //Adding jquery
    if(options.jquery){
      retrieveJQuery(options);
    }

    //Retrieving the colors
    var colors = await convertColors(options);
    colors.forEach(color=>{
      console.log(chalk.hex(color.value).bold('Couleur : '+color.name+' ajoutée') + ' - ('+color.name+')');
    })

    //Generating the stylesheet
    createCSSSections(options, colors);


    //Generating index.html



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

async function createCSSSections(options, colors){

  //Open the main.scss write stream
  var stream = fs.createWriteStream('./'+options.name+'/sass/main.scss');
  stream.once('open', function(fd) {

    stream.write(cssDivider('global'));
    //Add the colors
    stream.write(colorClasses(colors));
    stream.write(cssDivider('header', true, 'global'));
    stream.write(cssDivider('main', true, 'global'));
    //Add each section
    options.sections.forEach(section=>{
      stream.write(cssDivider(section, true, 'class'));
    });
    stream.write(cssDivider('footer', true, 'global'));
    stream.write(cssDivider('responsive-styles', true));
    //Add the responsive styles
    stream.write(responsiveStyles());

    stream.end();
  });
}

/**
 * CSS Sections template
 */
function cssDivider(title, spaces=false, selector){
  var content = (spaces ? '\n\n\n':'')+"/*------------------------------------*\\ \n    $"+title.toUpperCase()+" \n\\*------------------------------------*/ \n";
  if(selector){
    content += (selector === 'class' ? '.section-':'')+title.replace(/\s+/g, '-').toLowerCase()+'{\n\n}';
  }

  return content;
}

/**
 * Generates the custom color classes for materialize
 */
 function colorClasses(colors){
   var content = '';

   content+='// Generated color classes\n';

   //Sass variables
   colors.forEach(color=>{
     content+=`\$${color.name}: ${color.value};\n`
   })

   content+='\n';

   //Materialize classes
   colors.forEach(color=>{
     content+=`.${color.name}{background-color: \$${color.name} !important;}\n`;
     content+=`.${color.name}-text{color: \$${color.name} !important;}\n`;
   })

   return content;
 }

/**
 * Responsive styles template
 */
function responsiveStyles(){
  var content = '';

  content+='// Media Query Ranges\n'
  content+='$small-screen-up: 601px !default;\n'
  content+='$medium-screen-up: 993px !default;\n'
  content+='$large-screen-up: 1201px !default;\n'
  content+='$small-screen: 600px !default;\n'
  content+='$medium-screen: 992px !default;\n'
  content+='$large-screen: 1200px !default;\n'
  content+='\n'
  content+='$medium-and-up: "only screen and (min-width : #{$small-screen-up})" !default;\n'
  content+='$large-and-up: "only screen and (min-width : #{$medium-screen-up})" !default;\n'
  content+='$extra-large-and-up: "only screen and (min-width : #{$large-screen-up})" !default;\n'
  content+='$small-and-down: "only screen and (max-width : #{$small-screen})" !default;\n'
  content+='$medium-and-down: "only screen and (max-width : #{$medium-screen})" !default;\n'
  content+='$medium-only: "only screen and (min-width : #{$small-screen-up}) and (max-width : #{$medium-screen})" !default;\n'
  content+='\n'
  content+='\n'
  content+='@media #{$small-and-down} {}\n'
  content+='@media #{$medium-and-up} {}\n'
  content+='@media #{$medium-and-down} {}\n'
  content+='@media #{$large-and-up} {}\n'
  content+='@media #{$extra-large-and-up} {}\n'

  return content;
}
