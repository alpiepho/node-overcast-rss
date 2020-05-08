(original was a subdirectory in [my-blog2](https://github.com/alpiepho/my-blog2))

This is a simple utilty to build the post "podcast-summary.mdx".  It uses node and axois.

This utility is specific to the iOS potdast app "Overcast".  I works from an export list
of podcast subscriptions, follows those links for details, and builds a .mdx page
that can be copied to my blog site.

### How to generate overcast.opml

Here is how to the export
the list of subscriptions in an .opml file:

https://thesweetsetup.com/export-podcast-subscriptions-overcast-workouts/


### Workaround to see file clearer

The .opml file is basically an xml file.  I quick and dirty way to inspect it is:

- copy to .html
- use VS Code to format
- use the following to get a count
- cat overcast.html | grep title= | wc -l

Wow...I thought I was at 50ish....82 at this writing!


### How to run

```
npm install
npm start  > podcast-summary.mdx
```
 
### TODO

- FINISH converting build_summary.js (from node-repodata) to read overcast.opml and visit links)
- build json
  - title
  - htmlUrl
  - xmlUrl
  - imageUrl
  - itunes:category (multi, sub)
  - description
  - subtitle
- build .mdx (podcast-summary.mdx)
- generate html (like pup-learning)
- refactor with main.js
- add GH Action
