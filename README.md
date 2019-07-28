<div align="center">
  <p>
    <a href="https://nodei.co/npm/create-materialize-sass-project/"><img src="https://nodei.co/npm/create-materialize-sass-project.png"></a>
  </p>
</div>

## About
**create-materialize-sass-project** is an easy-to-use [Node.js](https://nodejs.org) CLI module that allows you to generate a quick [Materialize.css](https://materializecss.com/) project.

- Complete website creation
- Custom colors like the Materialize ones
- Sass files
- Responsive design breakpoints

## Installation
Use NPM to install.

```console
$ npm install create-materialize-sass-project -g
```

## Usage

Executes the package and pass a project name to launch the CLI

```console
$ create-materialize-sass-project example_project
```

You can also directly pass parameters to skip the questionning.

Optional arguments:

| Parameter                 | Default       | Description   |
| :------------------------ |:-------------:| :-------------|
| -y  --yes 	       |	/           | Skip the prompt and use the default values
| -t -–title 	       |	'New Materialize website'	            | Title of the website
| -d -–description 	       |	'Generated with @skiwa-materialize-boilerplate'	            | Meta description
| -u -–url 	       |	'www.example.com'	            | URL of the website
| -l  --lang          | 'en'           | Default language
| --direction 		           | 'ltr'             | Default read direction
| -o  -–opengraph 	        | y           | Insert the OpenGraph meta tags in the index
| -c --colors	         | /             | Custom colors as hex `#AABBCC`. Call it several times for multiple colors
| -s --sections	         | /             | Custom sections of the website. Call it several times for multiple sections
| -j --jquery	         | y             | Use JQuery
| -h --htaccess	         | y             | Generates a htaccess file
| -r --robots	         | y             | Generates a robots.txt file
| --sitemap	         | y             | Generates a sitemap file


Colors must be written as hexadecimal `#AABBCC`.
Sections and colors should be separated by spaces when prompted.

### Custom colors

Each custom color specified by the user will be converted to a name/pair value, using the [Color namer](https://www.npmjs.com/package/color-namer) package for a human-readable name.

When the .scss files is generated, custom classes are created, following the Materialize.css syntax.

For example :
```console
What are the main custom colors ? (Separate with space)
> #293462 #216583 #00818a #f7be16
```

will generate, in the `/sass/main.scss` file :
```css
/*------------------------------------*\
    $GLOBAL
\*------------------------------------*/
$rhino: #293462;
$elm: #216583;
$blue-lagoon: #00818a;
$lightning-yellow: #f7be16;

.rhino{background-color: $rhino !important;}
.rhino-text{color: $rhino !important;}
.elm{background-color: $elm !important;}
.elm-text{color: $elm !important;}
.blue-lagoon{background-color: $blue-lagoon !important;}
.blue-lagoon-text{color: $blue-lagoon !important;}
.lightning-yellow{background-color: $lightning-yellow !important;}
.lightning-yellow-text{color: $lightning-yellow !important;}
```

### Custom sections

Each custom section will be added to the HTML and will have its own isolated bloc in the scss file, so that the code remains clear and structured.

For example :
```console
What are the main custom sections ? (Separate with space)
> Portfolio Showcase About Contact
```

will generate, in the `index.html` file :
```html
<header></header>
  <main>
    <div class="section-portfolio"></div>
    <div class="section-showcase"></div>
    <div class="section-about"></div>
    <div class="section-contact"></div>
  </main>
<footer></footer>
```

and in the `sass/main.scss` file :
```css

/*------------------------------------*\
    $PORTFOLIO
\*------------------------------------*/
.section-portfolio{

}



/*------------------------------------*\
    $SHOWCASE
\*------------------------------------*/
.section-showcase{

}


[etc]
```

## Links
* [Personal website](https://jhaegman.com)
* [GitHub](https://github.com/Skiwa/create-materialize-sass-project)
* [NPM Repository](https://www.npmjs.com/package/create-materialize-sass-project.js)
