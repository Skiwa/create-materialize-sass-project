import arg from "arg";
import inquirer from "inquirer";
import { skiwaMaterializeBoilerplate } from "./main";

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      "--yes": Boolean,
      "-y": "--yes",
      "--title": String,
      "-t": "--title",
      "--description": String,
      "-d": "--description",
      "--url": String,
      "-u": "--url",
      "--lang": String,
      "-l": "--lang",
      "--direction": String,
      // '-dir': '--direction',
      "--opengraph": Boolean,
      "-o": "--opengraph",
      "--colors": [String],
      "-c": "--colors",
      "--sections": [String],
      "-s": "--sections",
      "--jquery": Boolean,
      "-j": "--jquery",
      "--htaccess": Boolean,
      "-h": "--htaccess",
      "--robots": Boolean,
      "-r": "--robots",
      "--sitemap": Boolean
      // '-s': '--sitemap',
    },
    {
      argv: rawArgs.slice(2)
    }
  );
  return {
    skipPrompts: args["--yes"] || false,
    name: args._[0],
    title: args["--title"] || null,
    description: args["--description"] || null,
    url: args["--url"] || null,
    lang: args["--lang"] || null,
    direction: args["--direction"] || null,
    opengraph: args["--opengraph"] || null,
    colors: args["--colors"] || [],
    sections: args["--sections"] || [],
    jquery: args["--jquery"] || null,
    htaccess: args["--htaccess"] || null,
    robots: args["--robots"] || null,
    sitemap: args["--sitemap"] || null
  };
}

async function promptForMissingOptions(options) {
  const defaultTemplate = "javascript";
  var presets = {
    name: null,
    title: "New Materialize website",
    description: "Generated with @skiwa-materialize-boilerplate",
    url: "www.example.com",
    lang: "en",
    direction: "ltr",
    opengraph: true,
    colors: [],
    sections: ["first", "second", "third"],
    jquery: true,
    htaccess: true,
    robots: true,
    sitemap: true
  };

  const questions = [];

  //User skips everything
  if (options.skipPrompts) {
    console.log("Options skipped, the default preset will be applied.");
    return {
      ...presets,
      name: options.name
    };
  }

  if (!options.title) {
    questions.push({
      type: "input",
      name: "title",
      message: "What's the website's title ?",
      default: presets.title
    });
  }

  if (!options.description) {
    questions.push({
      type: "input",
      name: "description",
      message: "What is the website's description  ?",
      default: presets.description
    });
  }

  if (!options.url) {
    questions.push({
      type: "input",
      name: "url",
      message: "What URL does it have ?",
      default: presets.url
    });
  }

  if (!options.lang) {
    questions.push({
      type: "input",
      name: "lang",
      message: "What is the main language ?",
      default: presets.lang
    });
  }

  if (!options.direction) {
    questions.push({
      type: "list",
      name: "direction",
      message: "What's the reading direction ?",
      choices: ["ltr", "rtl"],
      default: presets.dir
    });
  }

  if (!options.opengraph) {
    questions.push({
      type: "confirm",
      name: "opengraph",
      message: "Does the website needs OpenGraph tags ?",
      default: presets.opengraph
    });
  }

  if (!options.colors) {
    questions.push({
      type: "input",
      name: "colors",
      message: "What are the main custom colors ? (Separate with space)"
    });
  }

  if (!options.sections) {
    questions.push({
      type: "input",
      name: "sections",
      message: "What area the main sections ? (Separate with space)"
    });
  }

  if (!options.jquery) {
    questions.push({
      type: "confirm",
      name: "jquery",
      message: "Does the website needs JQuery ?",
      default: presets.jquery
    });
  }

  if (!options.htaccess) {
    questions.push({
      type: "confirm",
      name: "htaccess",
      message: "Do you want to generate an .htaccess file ?",
      default: presets.htaccess
    });
  }

  if (!options.robots) {
    questions.push({
      type: "confirm",
      name: "robots",
      message: "Do you want to generate a robots.txt file ?",
      default: presets.robots
    });
  }

  if (!options.sitemap) {
    questions.push({
      type: "confirm",
      name: "sitemap",
      message: "Do you want to generate a sitemap file ?",
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
    colors: options.colors || answers.colors.split(" ") || [],
    sections: options.sections || answers.sections.split(" ") || [],
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
