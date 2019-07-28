import arg from 'arg';
import inquirer from 'inquirer';
import { skiwaMaterializeBoilerplate } from './main';

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--yes': Boolean,
      '-y': '--yes',
      '--title': String,
      '-t': '--title',
      '--description': String,
      '-d': '--description',
      '--url': String,
      '-u': '--url',
      '--lang': String,
      '-l': '--lang',
      '--direction': String,
      // '-dir': '--direction',
      '--opengraph': Boolean,
      '-o': '--opengraph',
      '--colors': [String],
      '-c': '--colors',
      '--sections': [String],
      '-s': '--sections',
      '--jquery': Boolean,
      '-j': '--jquery',
      '--htaccess': Boolean,
      '-h': '--htaccess',
      '--robots': Boolean,
      '-r': '--robots',
      '--sitemap': Boolean,
      // '-s': '--sitemap',
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    skipPrompts: args['--yes'] || false,
    name: args._[0],
    title: args['--title'] || null,
    description: args['--description'] || null,
    url: args['--url'] || null,
    lang: args['--lang'] || null,
    direction: args['--direction'] || null,
    opengraph: args['--opengraph'] || null,
    colors: args['--colors'] || null,
    sections: args['--sections'] || null,
    jquery: args['--jquery'] || null,
    htaccess: args['--htaccess'] || null,
    robots: args['--robots'] || null,
    sitemap: args['--sitemap'] || null,
    };
}

async function promptForMissingOptions(options) {
  const defaultTemplate = 'javascript';
  var presets = {
    name: null,
    title: "Generated with @skiwa-materialize-boilerplate",
    description: null,
    url: null,
    lang: 'fr',
    direction: 'ltr',
    opengraph: true,
    colors: [],
    sections: [],
    jquery: true,
    htaccess: true,
    robots: true,
    sitemap: true
  };

  const questions = [];

  //User skips everything
  if (options.skipPrompts) {
    console.log("Toutes les options sont passées, le preset par défault va être appliqué.");
    return {
        ...presets,
        name: options.name,
    }
  }

  if (!options.title) {
    questions.push({
      type: 'input',
      name: 'title',
      message: 'Quel est le titre de l\'onglet principal ?',
      default: presets.title
    });
  }

  if (!options.description) {
    questions.push({
      type: 'input',
      name: 'description',
      message: 'Quelle description le site doit-il avoir ?'
    });
  }

  if (!options.url) {
    questions.push({
      type: 'input',
      name: 'url',
      message: 'Quelle est l\'url du site ?'
    });
  }

  if (!options.lang) {
    questions.push({
      type: 'input',
      name: 'lang',
      message: 'Quelle est la langue du site ?',
      default: presets.lang
    });
  }

  if (!options.direction) {
    questions.push({
      type: 'list',
      name: 'direction',
      message: 'Quelle est le sens de lecture du site ?',
      choices: ['ltr','rtl'],
      default: presets.dir
    });
  }

  if (!options.opengraph) {
    questions.push({
      type: 'confirm',
      name: 'opengraph',
      message: 'Le site a-t-il besoin d\'informations OpenGraph ?',
      default: presets.opengraph
    });
  }

  if (!options.colors) {
    questions.push({
      type: 'input',
      name: 'colors',
      message: 'Quelles sont les couleurs du site ? (Séparer via un espace)'
    });
  }

  if (!options.sections) {
    questions.push({
      type: 'input',
      name: 'sections',
      message: 'Quelles sont les différentes sections du site ? (Séparer via un espace)'
    });
  }

  if(!options.jquery){
    questions.push({
      type: 'confirm',
      name: 'jquery',
      message: 'Voulez-vous ajouter JQuery ?',
      default: presets.jquery
    });
  }

  if(!options.htaccess){
    questions.push({
      type: 'confirm',
      name: 'htaccess',
      message: 'Voulez-vous créer un fichier .htaccess ?',
      default: presets.htaccess
    });
  }

  if(!options.robots){
    questions.push({
      type: 'confirm',
      name: 'robots',
      message: 'Voulez-vous créer un fichier .robots.txt ?',
      default: presets.robots
    });
  }

  if(!options.sitemap){
    questions.push({
      type: 'confirm',
      name: 'sitemap',
      message: 'Voulez-vous créer un fichier sitemap.xml ?',
      default: presets.sitemap
    });
  }


  const answers = await inquirer.prompt(questions);
  return {
    ...options,
    title: options.title || answers.title,
    description: options.description || answers.description,
    url: options.url || answers.url,
    lang: options.lang || answers.lang,
    direction: options.direction || answers.direction,
    opengraph: options.opengraph || answers.opengraph,
    colors: options.colors || answers.colors,
    sections: options.sections || answers.sections,
    jquery: options.jquery || answers.jquery,
    htaccess: options.htaccess || answers.htaccess,
    robots: options.robots || answers.robots,
    sitemap: options.sitemap || answers.sitemap
  };
}


export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  options = await promptForMissingOptions(options);
  await skiwaMaterializeBoilerplate(options);
}
