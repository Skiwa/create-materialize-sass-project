import chalk from 'chalk';
import fs from 'fs';
import http from 'http';
import unzipper from 'unzipper';
import request from 'request';
import namer from 'color-namer';
import Listr from 'listr';

export async function skiwaMaterializeBoilerplate(options){

  if(!fs.existsSync('./'+options.name)){
    var colors;

    const tasks = new Listr(
      [
        {
          title: 'Creating the project structure',
          task: () => createFolders(options)
        },
        {
          title: 'Creating the main files',
          task: () => createMainFiles(options)
        },
        {
          title: 'Retrieving materialize assets',
          task: () => retrieveMaterializeFiles(options)
        },
        {
          title: 'Retrieving JQuery (3.4.1)',
          enabled: () => options.jquery,
          task: () => retrieveJQuery(options)
        },
        {
          title: 'Converting the colors into human friendly classes',
          enabled: () => options.colors.length > 0,
          task: async () => {
             colors = await convertColors(options);
          }
        },
        {
          title: 'Generating the stylesheet',
          task: () => generateSCSS(options, colors)
        },
        {
          title: 'Generating index.html',
          task: () => generateHTML(options)
        },
        {
          title: 'Generating the htaccess file',
          enabled: () => options.htaccess,
          task: () => generateHtaccess(options)
        },
        {
          title: 'Generating the sitemap file',
          enabled: () => options.sitemap,
          task: () => generateSitemap(options)
        },
        {
          title: 'Generating the robots.txt file',
          enabled: () => options.robots,
          task: () => generateRobots(options)
        },
      ]
    );

    await tasks.run();

    if(colors){
      colors.forEach(color =>{
        console.log('Color added : %s', chalk.bgHex(color.value).bold(color.name));
      });
    }

    console.log('%s Website successfuly generated, happy dev !', chalk.green.bold('DONE'));

    return true;

  }else{
    console.log('%s : A folder with the name "'+options.name+'" already exists !', chalk.red.bold('ERROR'));
    process.exit(1);
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

/**
 * Generates the SCSS main file
 */
async function generateSCSS(options, colors){

  //Open the main.scss write stream
  var stream = fs.createWriteStream('./'+options.name+'/sass/main.scss');
  stream.once('open', function(fd) {

    stream.write(cssDivider('global'));
    //Add the colors
    if(colors){
      stream.write(colorClasses(colors));
    }
    stream.write(cssDivider('header', true, 'global'));
    stream.write(cssDivider('main', true, 'global'));

    if(options.sections.length > 0){
      //Add each section
      options.sections.forEach(section=>{
        if(section && section !== ''){
          stream.write(cssDivider(section, true, 'class'));
        }
      });
    }
    stream.write(cssDivider('footer', true, 'global'));
    stream.write(cssDivider('responsive-styles', true));
    //Add the responsive styles
    stream.write(responsiveStyles());

    stream.end();
  });
}

/**
 * Generates the HTML file
 */
async function generateHTML(options){
  var content = '';

  content += `<!DOCTYPE html>\n`;
  content += `<html dir="${options.direction}" lang="${options.lang}">\n`;
  content += `<head>\n`;
  content += `  <meta charset="UTF-8">\n`;
  content += `  <meta content="width=device-width, initial-scale=1.0" name="viewport">\n`;
  content += options.description !== '' ? `  <meta content="${options.description}" name="description">\n` : '';
  content += `  <meta content="ie=edge" http-equiv="X-UA-Compatible">\n`;
  content += `  \n`;

  if(options.opengraph){
    content += `  <!-- @Facebook Open Graph -->\n`;
    content += `  <!-- <meta property="og:image" content="${options.url}/img/social/banner">-->\n`;
    content += `  <meta property="og:type" content="website">\n`;
    content += `  <meta property="og:url" content="${options.url}">\n`;
    content += `  <meta property="og:title" content="${options.title}">\n`;
    content += `  <meta property="og:description" content="${options.description}">\n`;
    content += `  <meta property="og:site_name" content="${options.title}">\n`;
    content += `  \n`;
    content += `  <!-- @Twitter Open Graph -->\n`;
    content += `  <!-- <meta name="twitter:creator" content="@twitteraccountname">-->\n`;
    content += `  <!-- <meta name="twitter:image" content="${options.url}/img/social/banner"> -->\n`;
    content += `  <meta name="twitter:card" content="summary">\n`;
    content += `  <meta name="twitter:url" content="${options.url}">\n`;
    content += `  <meta name="twitter:title" content="${options.title}">\n`;
    content += `  <meta name="twitter:description" content="${options.description}">\n`;
  }

  content += `\n`;
  content += `  <!-- @Android colors -->\n`;
	content += `  ${!options.colors || options.colors.length === 0 ? '<!--' : ''}<meta content="${options.colors[0] ? options.colors[0] : ''}" name="theme-color">\n`;
	content += `  <meta content="${options.colors[0] ? options.colors[0] : ''}" name="msapplication-navbutton-color">\n`;
  content += `  <meta content="${options.colors[0] ? options.colors[0] : ''}" name="apple-mobile-web-app-status-bar-style">${!options.colors || options.colors.length === 0  ? '-->' : ''}\n`;
  content += `  \n`;
  content += `  <title>${options.title}</title>\n`
  content += `  \n`;
  content += `  <!-- @Favicon -->\n`;
  content += `  <!-- <link href="img/favicon.ico" rel="shortcut icon"> -->\n`;


  content += `  <link href="css/materialize.min.css" rel="stylesheet">\n`;
  content += `  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">\n`;
  content += `  <link href="css/main.min.css" rel="stylesheet">\n`;
  content += `</head>\n`;
  content += `<body>\n`;
  content += `\n`;
  content += `  <!-- @NoScript -->\n`;
  content += `  <!-- <noscript>No script message</noscript> -->\n`;
  content += `\n`;
  content += `  <header></header>\n`;
  content += `\n`;
  content += `  <main>\n`;
  options.sections.forEach(section=>{
    content += `    <div class="section-${section.replace(/\s+/g, '-').toLowerCase()}"></div>\n`;
  });
  content += `  </main>\n`;
  content += `\n`;
  content += `  <footer></footer>\n`;
  content += `\n`;
  content += `\n`;
  if(options.jquery){
    content += `  <script src="js/jquery-3.4.1.min.js"></script>\n`;
  }
  content += `  <script src="js/materialize/materialize.min.js"></script>\n`;
  content += `  <script src="js/main.min.js"></script>\n`;
  content += `</body>\n`;
  content += `</html>`;


  var stream = fs.createWriteStream('./'+options.name+'/index.html');
  stream.once('open', function(fd) {
    stream.write(content);
    stream.end();
  });

}

/**
 * Generates the .htaccess file
 */
async function generateHtaccess(options){

  var content = '';
  content += `RewriteEngine On\n`;
  content += `RewriteCond %{HTTPS} !on\n`;
  content += `RewriteCond %{REQUEST_URI} !^/[0-9]+\\..+\\.cpaneldcv$\n`;
  content += `RewriteCond %{REQUEST_URI} !^/\\.well-known/pki-validation/[A-F0-9]{32}\\.txt(?:\\ Comodo\\ DCV)?$\n`;
  content += `RewriteRule (.*) https:\/\/%{HTTP_HOST}%{REQUEST_URI} [L,R=301]\n`;
  content += `<Files .htaccess>\n`;
  content += `order allow,deny\n`;
  content += `deny from all\n`;
  content += `</Files>\n`;
  content += `\n`;
  content += `Options All -Indexes`;

  var stream = fs.createWriteStream('./'+options.name+'/.htaccess');
  stream.once('open', function(fd) {
    stream.write(content);
    stream.end();
  });
}

/**
* Generates the sitemap.xml file
*/
async function generateSitemap(options){
 var content = '';

 content += `<?xml version="1.0" encoding="UTF-8"?>\n`;
 content += `<urlset\n`;
 content += `      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
 content += `      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
 content += `      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 \n                  http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n`;
 content += `<url>\n`;
 content += `  <loc>${options.url}</loc>\n`;
 content += `  <priority>1.00</priority>\n`;
 content += `</url>\n`;
 content += `\n`;
 content += `</urlset>`;

 var stream = fs.createWriteStream('./'+options.name+'/sitemap.xml');
 stream.once('open', function(fd) {
   stream.write(content);
   stream.end();
 });
}

/**
* Generates the robots.txt file
*/
async function generateRobots(options){
  var content = '';

  content += `User-agent: * \n`;
  content += `Disallow: `;

  var stream = fs.createWriteStream('./'+options.name+'/robots.txt');
  stream.once('open', function(fd) {
    stream.write(content);
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
