import path from "path";
import rimraf from "rimraf";
import configObj from "./config";
import ejs from "ejs";
import _ from "lodash";
import unescape from "unescape";
import fs from "fs-extra";
import slugify from "slugify";

import marked from "meta-marked";
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});

import "songbird";

const META_DATA_KEY = "META_DATA";
const ROOT_DIR = path.resolve(process.cwd());

/*
* recurseively reads the contents folders and sub-folder and create a map of 
* folder-file path structure, for e.g. {"mywork": ["contents/mywork/file1.md", "contents/mywork/file2.md"]}
*/

const read = async (folder, contentFiles) => {
    const stat = await fs.promise.stat(folder)
    if (!stat.isDirectory()) {      
      // if its a ".DS_STORE folder ignore it"
      if (folder.indexOf(".DS_Store") !== -1) {
        return;
      }

    	const folderName = folder.substring(
    		folder.indexOf("/contents/") + 10,
    	 	folder.lastIndexOf("/"));     
      
      if(!contentFiles[folderName]) {
        contentFiles[folderName] = [];
      }
      contentFiles[folderName].push(folder);
      return;
    }

    const process = []
    const files = await fs.promise.readdir(folder)
    for (const item of files) {
        process.push(read(folder + '/' + item, contentFiles));
    }
    // execute all promises at once.
    await Promise.all(process)
}

const convertMarkdownToHTML = async (filePath) => {
  // read the .md file in that folder
  const mdString = await fs.promise.readFile(filePath, {encoding: "utf8"});   
  // get the content and meta-data in an object structure.
  return marked(mdString);    
};

const convertTemplateToHtml = async (templateName, tmplObj) => {  
  const templPath = path.join(__dirname, "templates", templateName + ".ejs");    
  try{
    const tmplStr = await fs.promise.readFile(templPath, {encoding: "utf8"});     
    const pageHtml = ejs.render(tmplStr, tmplObj, {
      filename: templPath
    });
    return _.unescape(pageHtml);  
  } catch(e) { console.log(e);}
}

const createHTMLPage = async (pageHtml, filePath) => {
  try{            
      await fs.promise.writeFile(filePath, pageHtml, 'utf8');
  } catch(e) { console.log(e) }
}

const constructHeaderObject = (contentFiles, activeFolder) => {
  const excludedMenuItems = configObj.excludedMenuItems;
  const resumeLink = configObj.resumeLink;
  const headerObj = {
    pageTitle: configObj.pageTitle,
    pageSubTitle: configObj.pageSubTitle,
    menuItems: []
  };

  for (let folder in contentFiles) {    
    let isAValidMenuItem = _.indexOf(excludedMenuItems, folder) === -1;
    if(isAValidMenuItem) {
      const folderName = folder.replace("%20", " ");
      let href = "/pages/" + folderName + ".html";
      const menuItemsOrder = configObj.menuItemsOrder || {};
      let order = 99;
      if(menuItemsOrder[folderName]) {
        order = menuItemsOrder[folderName];
      }
      if(folderName === "resume") {
        href = resumeLink;
      }

      headerObj.menuItems.push({
        displayName: folderName,
        href: href,
        isActive: folderName === activeFolder,
        order: order
      });
    }
  }
  // get the current menu items
  const currentMenuItems = headerObj.menuItems;
  // sort them based on the order
  const sortedMenuItems = _.sortBy(currentMenuItems, (mItem) => {
    return mItem.order;
  });
  // replace the menu Items list with sorted menu items list.
  headerObj.menuItems = sortedMenuItems;
  return headerObj;
}

const generateAStaticPage = async(filePath, folder, templateType, headerObj) => {
  let mainPageObj = _.extend({
  }, headerObj);

  const markdownObj = await convertMarkdownToHTML(filePath);      
  const fileNameWithExt = filePath.substring(filePath.lastIndexOf("/")+1, filePath.length);
  const fileName = fileNameWithExt.substring(0, fileNameWithExt.indexOf("."));
  mainPageObj.pageContent = markdownObj.html;
  const staticPageHtml = await convertTemplateToHtml("static-page", mainPageObj);
  await createHTMLPage(scrollingPageHtml, path.join(ROOT_DIR, "pages", fileName + ".html"));  
}

const generateAHomePage = async (filePaths, folder, templateType, headerObj) => {
  try {
  const displayDefaultHomePage = configObj.displayDefaultHomePage;
  let mainPageObj = _.extend({
    displayDefaultHomePage: displayDefaultHomePage
  }, headerObj);

  const markdownObj = await convertMarkdownToHTML(filePaths[0]);    
  const meta = markdownObj.meta || {}
  mainPageObj.profilePic = meta.profilePic || configObj.profilePic;
  mainPageObj.aboutMe = meta.aboutMe || configObj.aboutMe;
  mainPageObj.pageContent = markdownObj.html || "";
  const homePageHtml = await convertTemplateToHtml("home", mainPageObj);
  createHTMLPage(homePageHtml, path.join(ROOT_DIR, "index.html"));  
  }catch(e) {console.log(e);}
}

const generateAScrollingPage = async (filePaths, folder, templateType, headerObj) => {
  let mainPageObj = _.extend({
    projects: [],
    sections: []
  }, headerObj);

  for(let i=0; i<filePaths.length; i++) {
    const markdownObj = await convertMarkdownToHTML(filePaths[i]);
    const meta = markdownObj.meta || {};
    const title = meta.title || "";
    const sectionId = slugify(title).toLowerCase();
    const filePath = filePaths[i];
    const fileNameWithExt = filePath.substring(filePath.lastIndexOf("/")+1, filePath.length);    
    const fileName = fileNameWithExt.substring(0, fileNameWithExt.indexOf(".")); 
    mainPageObj.sections.push({
      sectionId: sectionId,
      sectionName: fileName
    });    
    mainPageObj.projects.push(markdownObj.html);
  }
  mainPageObj.sectionsString = JSON.stringify(mainPageObj.sections);
  const scrollingPageHtml = await convertTemplateToHtml("scrolling-page", mainPageObj);
  createHTMLPage(scrollingPageHtml, path.join(ROOT_DIR, "pages", folder + ".html"));
}

const generateAMasterDetailPage = async (filePaths, folder, templateType, headerObj) => {  
  let mainPageObj = _.extend({
    detailItems: []
  }, headerObj);


  for(let i=0; i<filePaths.length; i++) {
    const filePath = filePaths[i];
    const markdownObj = await convertMarkdownToHTML(filePath);    
    const fileNameWithExt = filePath.substring(filePath.lastIndexOf("/")+1, filePath.length);    
    const fileName = fileNameWithExt.substring(0, fileNameWithExt.indexOf("."));    
    const metaData = markdownObj.meta || {};
    const title = metaData.title || "";
    const shortDescription = metaData.shortDescription || "";
    const fileLink = "/pages/" + fileName + ".html";
    mainPageObj.detailItems.push({
      title: title,
      shortDescription: shortDescription,
      moreInfoLink: fileLink 
    });    
    // create all the child link pages
    let childPageObj = _.extend({}, headerObj);    
    childPageObj.pageContent = markdownObj.html;
    const pageHtml = await convertTemplateToHtml("static-page", childPageObj);
    createHTMLPage(pageHtml, path.join(ROOT_DIR, "pages", fileName + ".html"));
  }

  // create the main master-detail page.
  const masterPageHtml = await convertTemplateToHtml("master-detail", mainPageObj);
  createHTMLPage(masterPageHtml, path.join(ROOT_DIR, "pages", folder + ".html"));
}

const generateHTML = async (filePaths, folder, templateType, headerObj) => {
  if(templateType === "master-detail") {
    generateAMasterDetailPage(filePaths, folder, templateType, headerObj);
  } else if(templateType === "scrolling-page") {
    await generateAScrollingPage(filePaths, folder, templateType, headerObj);
  } else if(templateType === "home") {
    await generateAHomePage(filePaths, folder, templateType, headerObj);
  } else {
    for (let i=0; i< filePaths.length; i++) {
      await generateAStaticPage(filePaths[i], folder, "static-page", headerObj);
    }    
  }
}

const generatePages = async (contentFiles) => {
  const knownTemplateMappings = configObj.knownTemplateMappings;
  const excludedGeneratedPages = configObj.excludedGeneratedPages;  
  for (let folder in contentFiles) {    
    const filePaths = contentFiles[folder];    
    let isAllowedForPageGeneration = _.indexOf(excludedGeneratedPages, folder) === -1;

    if(isAllowedForPageGeneration) {
      const headerObj = constructHeaderObject(contentFiles, folder);        
      const templateType = knownTemplateMappings[folder];
      console.log(`-    Generating ${folder} pages`);
      await generateHTML(filePaths, folder, templateType, headerObj);
    }
  } 
}

const initGenerate = async () => {
	//remove the existing index.html file
  await rimraf.promise(path.join(ROOT_DIR, "index.html"));
  
  const pagesFolder = path.join(ROOT_DIR, "pages");
  // remove the existing pages folder
	await rimraf.promise(pagesFolder);
  
  // re-create the pages folder
  await fs.promise.mkdir(pagesFolder);

  // locate the contents folder
  const contentsFolderPath = path.join(ROOT_DIR, "contents");
  const contentFiles = {};  

  // read the directory structre in contents folder
  await read(contentsFolderPath, contentFiles); 
  console.log("**** Starting page generation ****");
  await generatePages(contentFiles);
  // generage pages
  // console.log(JSON.stringify(contentFiles));
  console.log("**** Page generation complete ****"); 
}


initGenerate();

