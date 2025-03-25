## Why this repository exists

In our Rhythm platform set up, each page within Rhythm has an input field under the advanced tab where we can add custom javascript to the site to modify the look or feel of the page. We also have an input available to add custom javascript to the entire site in Rhythm.
The all-pages.js file in this repository is the site wide js, all other files are javascript we add to specific pages in Rhythm and the code within those files is specific to that page.

We are creating CDNs for each javascript file in this repository via [JSDelivr](https://www.jsdelivr.com/github)

## Workflow for this repo

1. Create a new branch based off of Main.
2. When ready to merge your changes, create a new pull request against main.
3. Get your code changes reviewed and approved.
4. Merge pull request to main.
5. A github action will run that generates a new tag and publishes a new release after merging to main. So id the latest release is 1.1.48, the action will publish a new release for tag 1.1.49 automatically.
6. After a release is created by the github action, copy the file path blob from main that you want to update in the QA environment by copying the github url of the file.
7. go [here](https://www.jsdelivr.com/github) and paste the copied url into the first input. Replace the branch name "main" in the url with the version number of the latest published release. JSDelivr should automatically create a CDN url for the file basedon the version number you entered.
8. Replace the old CDN url in the QA environment with the new URL. Have interested parties review changes on the site as necessary.
