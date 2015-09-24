# neo
A opinionated static portfolio site generator.

# Getting started

### When setting up neo for the first time.

- Clone the repository: `git clone https://github.com/neo-blog/neo.git`
- Install `NodeJS` if not already installed. See http://nodejs.org/
- cd into the root directory: `cd neo`
- Install dependencies: `npm install`

### Generating site and loading preview

All the pages for your static sites are located inside of contents folder. They are categorized into sub-folder, and each folder has a markdown file (except the resume folder which has a resume pdf). These markdown files get converted into html pages. Run the below commands from the root directory of the project.

- In order to compile styles and generate html pages: `npm run generate`. Once complete you should see an output like below.
```
➜  neo git:(chore-initial-commit) ✗ `npm run generate`

> neo@0.0.1 generate /projs/repos/neo
> npm run generate-styles && babel-node --optional strict --stage 1 -- index.js


> neo@0.0.1 generate-styles /Users/projs/repos/neo
> stylus styles/styl/main.styl --out styles/css/

  compiled styles/css/main.css
**** Starting page generation ****
-    Generating extras pages
-    Generating home pages
-    Generating my work pages
-    Generating writing pages
**** Page generation complete ****
```

- In order to see a preview, run: `npm run start`  or simply `npm start`. This should start up a local server on port `9292`, your can preview the generated site at [http://localhost:9292/](http://localhost:9292/).

- To stop the server simple hit `ctrl + c` command. (this is on mac)

### Site generation guide lines:

#### Adding pages: 
As mentioned above, all pages are located in `contents` folder. Each page is represented by a `markdown` file. Our `npm run generate` script will convert them into html pages automatically for your. So most of the time you would be simply creating files in the sub folders of the `contents` directory. 

The markdown files also has ability to recognize html iside of it, so the text inside of these files can be plan markdown text or html.

There are already some sample markdown files for your reference. As you may have noticed, each markdown file starts with a header, which looks like this

```
---
title: Article 100 - Hello this is a sample article
shortDescription: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean vestibulum vestibulum eleifend. Curabitur aliquam pharetra purus et tempor.
---
```

this is meta data of the file, that `neo` uses for page generations, possible values in here are

1) title
2) shortDescription
3) profilePic: images/profile-pic.jpg
4) aboutMe: Ad leggings keytar, brunch id art party dolor labore. Pitchfork yr enim lo-fi before they sold out qui.

`profilePic` and `aboutMe` are used only for home page so they are optional.

#### Editing Styles:

Neo uses the [stylus](http://learnboost.github.io/stylus/) pre-processor, and twitter bootstrap as a base styles. Most of the times you would never need to edit any styles, but if you want to add custom stylus to your page just cd into `styles/styl/` folder, and copy paste your styles inside custom.styl folder and save it.

When we are generating the site by running `npm run generate` the script will automatically pickup your custom styles and bundle them to the `main.css` generated file.


### Git workflow

If you are adding changes and pushing to your site, follow the feature branch workflow for the site generation.

- cd into root directory
- git checkout master
- git pull
- git checkout -b your-branch-name
- make your changes
- git add .
- git commit -m "commit message"
- git push -u origin your-branch-name
- then from the github ui, open a PR into master branch and merge it via github.

This workflow is only a recommendation to avoid unnecessary merge conflicts.


### Contributors
- The basic site template has been designed by: [Kamakshi Sirisha](https://github.com/kamakshipathapati)
- Developed by: [Nikhilesh Katakam](https://github.com/kamakshipathapati)




