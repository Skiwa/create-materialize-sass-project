import arg from 'arg';
import inquirer from 'inquirer';
// import { skiwa-materialize-boilerplate } from './main';

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
      '-dir': '--direction',
      '--opengraph': Boolean,
      '-o': '--opengraph',
      '--colors': [String],
      '-c': '--colors',
      '--sections': [String],
      '-s': '--sections',
      '--jquery': Boolean,
      '-jq': '--jquery',
      '--htaccess': Boolean,
      '-ht': '--htaccess',
      '--robots': Boolean,
      '-r': '--robots',
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
    opengraph: args['--opengraph'] || false,
    colors: args['--colors'] || null,
    sections: args['--sections'] || null,
    jquery: args['--jquery'] || false,
    htaccess: args['--htaccess'] || false,
    robots: args['--robots'] || false,
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
    jquery: false,
    htaccess: true,
    robots: true
  };

  //User skips everything
  if (options.skipPrompts) {
    console.log("All options skipped, returning default preset")
    return {
        ...presets,
        name: options.name,
    }
  }

  const questions = [];

}


export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  options = await promptForMissingOptions(options);
  // await skiwaMaterializeBoilerplate(options);
}
