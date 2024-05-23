# This Repo contains the javascript written by TrimarkUSA's Product Team for the TriMarketPlace Site

## Why this repository exists
In our Rhythm platform set up, each page within Rhythm has an input field under the advanced tab where we can add custom javascript to the site to modify the look or feel of the page. We also have an input available to add custom javascript to the entire site in Rhythm.
The all-pages.js file in this repository is the site wide js, all other files are javascript we add to specific pages in Rhythm and the code within those files is specific to that page.

We are creating CDNs for each javascript file in this repository via [JSDelivr](https://www.jsdelivr.com/github)

## Managing file changes with JSDelivr
We currently have a QA environment and production environment for Rhythm. We want to be able to test new features on QA to committed code without effecting production. So how do does JSDelivr help us manage that workflow process?
When a feature is ready to be tested on QA go through the following steps in order:
1. Create a new branch based off of Main.
2. When you think you think you are ready to merge your changes, create a new pull request against main.
3. Get your code changes reviewed and approved.
4. Merge pull request to main.
5. Create a new tag for the repository. Using version tags will allow us to create a new release version for the repo. JSDelivr needs to know there is a new release in the repo so we can purge the caches of the files we want updated on the site.
6. After creating a new release version for the repository, copy the file you want to update in qa by copying the github url of the file.
7. go [here](https://www.jsdelivr.com/github) and paste the copied url into the first input. Replace the branch name "main" with the version number of the tag you just created.
8. Replace the old CDN url in the QA environment with the new URL. Have interested parties review changes on the site as necessary.

If your changes made to the latest version on QA are approved by the interested parties, go [here](https://www.jsdelivr.com/tools/purge) and purge the url of the file using @latest as the version. The file in the production enviornment should update after a few moments.




