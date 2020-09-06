// TODO: create token and get private repos (WARNING: still cant get private repos, see private.json as workaround)
// TODO: roll this to "better gh profile page???"

var axios = require("axios")
const fs = require('fs'); 
const parser = require('xml2json');

const JSON_FILE = "./artifacts/summary.json";
const HTML_FILE = "./public/index.html";
const MD_FILE = "./artifacts/podcast-summary.mdx";

const html1 = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width", initial-scale=1.0"/>
    <meta name="Description" content="Podcast Subscriptions">
    <meta name="theme-color" content="#d36060"/>
    <title>
    Podcast Subscriptions
    </title>
    <link rel="stylesheet" href="./style.css" />
    <link rel="manifest" href="./manifest.json" />
    <link rel="icon"
      type="image/png" 
      href="./favicon.ico" />
  </head>
  <body class="body">
    <main>
    <article class="page">
      <h1  id=\"top\">Podcast Subscriptions</h1>

      <div class="introduction">
      <p>
      This a summary of all my Podcast Subscriptions on the Overcast app. 
      This was derived from exporting the list from Overcast, parsing that list, and parsing each
      rss feed for various pieces of information.
      </p>
      <p>
      This list is generated from a tool called "node-overcast-rss" that can be found
      <a
        href="https://github.com/alpiepho/node-overcast-rss"
        target="_blank"
        rel="noreferrer"
      >here</a>.  This tool needs to be run manually after using the phone app to export and
      copy the subscription list (.ompl) file to this project.
      </p>
      </div>
`;

const html2 = `
    <div id=\"bottom\"></div>
    </article>
  </body>
</html>
`;

const md1 = `---
title: My Podcast Subscriptions
date: "2020-05-10"
description: "My Podcast Subscriptions"
---

(Warning: many images) This a summary of all my Podcast Subscriptions on the Overcast app. 
This was derived from exporting the list from Overcast, parsing that list, and parsing each
rss feed for various pieces of information.

A full summary with more details can be found [here](https://alpiepho.github.io/node-overcast-rss/).

#### top

`;

const md2 = `

#### bottom
`;

function sortByKey(array, key) {
  return array.sort(function (a, b) {
    var x = a[key].toLowerCase()
    var y = b[key].toLowerCase()
    return x < y ? -1 : x > y ? 1 : 0
  })
}

function build_html(data) {
  // generate artifacts from data - html
  let htmlStr = html1;
  today = new Date()
  htmlStr += "<sup><sub>(updated " + today + ")</sub></sup>\n"
  htmlStr += "\n"
  htmlStr += "      <br/><p>Total Subscriptions: " + data['list'].length + "</p><br/>\n\n";
  htmlStr += "      <ul>\n";
  data['list'].forEach(entry => {
    htmlStr += "            <li>\n";
    htmlStr += "              <ul>\n";
    htmlStr += "                <li>\n";

    if (entry['image']) {
      htmlStr += "                  <p><img src=\"" + entry['image'] + "\"</img></p>\n";
    }

    htmlStr += "                  <a target=\"_blank\" href=\"" + entry['link'] + "\">\n";
    htmlStr += "                    " + entry['title'] + "\n";
    htmlStr += "                  </a>\n";
    htmlStr += "                <span class=\"categories\">(" + entry['categories'].join(', ') + ")\n";
    htmlStr += "                </li>\n";
    if (entry['subtitle']) {
      htmlStr += "                <li class=\"subtitle\"><i>" + entry['subtitle'] + "</i></li>\n";
    }
    htmlStr += "                <li class=\"description\">" + entry['description'] + "</li>\n";
    htmlStr += "                <li class=\"topbottom\"><a href=\"#top\">top</a> / <a href=\"#bottom\">bottom</a></li>\n";
    htmlStr += "              </ul>\n";
    htmlStr += "            </li>\n";
  });
  htmlStr += "      </ul>";
  htmlStr += html2;
  fs.writeFileSync(HTML_FILE, htmlStr);
}


function build_md(data) {
  // generate markdown (.mdx) for blog
  let mdStr = md1;
  mdStr += "Total Subscriptions: " + data['list'].length + "\n";
  mdStr += "<br/>\n";
  mdStr += "<br/>\n";
  mdStr += "<br/>\n";
  mdStr += "\n";
  data['list'].forEach(entry => {
    mdStr += "\n";
    if (entry['image']) {
      mdStr += "![](" + entry['image'] + ")\n";
    }
    mdStr += "\n";
    mdStr += "[" + entry['title'] + "](" + entry['link'] + ")\n";
    if (entry['subtitle'] && entry['subtitle'] != entry['title'] && entry['subtitle'] != entry['description']) {
      mdStr += "- Subtitle: " + entry['subtitle'] + "\n";
    }
    mdStr += "- Description: " + entry['description'] + "\n";
    mdStr += "- Categories: " + entry['categories'].join(', ') + "\n";
    mdStr += "- [top](#top) / [bottom](#bottom)\n";

    mdStr += "<br/>\n";
    mdStr += "<br/>\n";
    mdStr += "<br/>\n";
      mdStr += "\n";
  });
  mdStr += md2;
  fs.writeFileSync(MD_FILE, mdStr);
}


function main() {
  let data = {};
  data['list'] = [];

  // Read overcast.opml
  const contents = fs.readFileSync('./overcast.opml', {encoding:'utf8', flag:'r'});
  json = JSON.parse(parser.toJson(contents))

  // parse all xmlUrl values
  // add each to data
  for (i=0; i<json['opml']['body']['outline'].length; i++) {
    entry = {};
    entry['title'] = json['opml']['body']['outline'][i]['title'];
    entry['link'] = json['opml']['body']['outline'][i]['htmlUrl'];
    entry['rss'] = json['opml']['body']['outline'][i]['xmlUrl'];
    if (entry['rss'].includes('feeds.feedburner.com')) {
      // from: https://feeds.feedburner.com/WorklifeWithAdamGrant
      // to:   https://feeds.feedburner.com/WorklifeWithAdamGrant?format=xml
      entry['rss'] = entry['rss'] + "?format=xml";
    }
    entry['categories'] = [];
    data['list'].push(entry);
  }
    
  let promises = []
  Promise.all(promises).then(() => {
    //DEBUG: if you skip README check
    //finish(header, jsonData)
    let promises = []
    data['list'].forEach(element => {
      promises.push(
        axios.get(element['rss']).then((response) => {
          // for each xmlUrl, read page and gather:
          //    title, link, description, image, itunes:category (s)
          console.log(element['rss'])
          //element.partial = response.data.slice(0,30);
          let feedJson = JSON.parse(parser.toJson(response.data));
          element['description'] = feedJson['rss']['channel']['description'];
          element['description'] = element['description'].replace('<br>', '<br/>');
          if (feedJson['rss']['channel']['image']) {
            element['image'] = feedJson['rss']['channel']['image']['url'];
          }
          if (feedJson['rss']['channel']['itunes:image']) {
            element['image'] = feedJson['rss']['channel']['itunes:image']['href'];
          }
          if (feedJson['rss']['channel']['itunes:subtitle']) {
            if (typeof(feedJson['rss']['channel']['itunes:subtitle']) == "string") {
              subtitle = feedJson['rss']['channel']['itunes:subtitle'];
              if (subtitle.slice(0, 30) != element['description'].slice(0, 30)) {
                element['subtitle'] = feedJson['rss']['channel']['itunes:subtitle'];
              }
            }
          }
          if (feedJson['rss']['channel']['itunes:category']) {
            // NOTE: ignoring sub-categoty lists
            let category = feedJson['rss']['channel']['itunes:category'];
            if (category instanceof Array) {
              category.forEach(c => {
                element['categories'].push(c['text']);
              })
            } else {
              element['categories'].push(category['text']);
            }
          }         
        })
        .catch(error => { console.log(error); })
      )
    })
    Promise.all(promises).then(() => {
      data['list'] = sortByKey(data['list'], "title")

      fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2));
      build_html(data);
      build_md(data);
    
      // TODO add steps to deploy
    })
  })  
}


main();