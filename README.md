# team065-Data Pirates
This is a template for CS411 project repository. Please make sure that your title follows the convention: [TeamID]-[YourTeamName]. All TeamID should have a three digit coding (i.e. if you are team 20, you should have `team020` as your ID.). You should also make sure that your url for this repository is [fa23-cs411-team000-teamname.git] so TAs can correctly clone your repository and keep them up-to-date.

Once you setup your project, please remember to submit your team formation to the team form.

## Permission
You should make sure you allow TAs to access your repository. You can add TA(s) as a collaborator to your repository.

## Preparing for your release
Eash submission should be in it's own [release](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases). Release are specific freezes to your repository. You should submit your commit hash on canvas or google sheet. When tagging your stage, please use the tag `stage.x` where x is the number to represent the stage.

## HOW TO RUN
### Run Application locally:
- Start SQL instance within GCP
- Go to /tubetrendzserver within project
- Run node app.js or npm run start, either will work
- Visit http://localhost:3000/ to view website

### Using VM:
- Start SQL instance within GCP
- Go to Compute Engine within GCP menu -> VM instance
- Start tubetrends-server VM instance, click on 3 dots
- Add VM’s external IP address to SQL instance’s network
- Click SSH
- Cd tubeserver
- Cd to /tubetrendzserver within GIT project
- Run node app.js or npm run start, either will work
- Visit http://[vm’s external ip address]:3000/ to view website

### **MUST DO FIRST TO USE VM IF NOT DONE BEFORE”
- Granting Local IP Firewall Access to VM:
- Go to VPC Network within GCP menu
- Click Firewall
- Click on firewall policy labeled, public-ips
- Click edit policy
- Add you IP to “Source IPv4 ranges”
- Press “Save”

