# Faction

Faction is a Discord clone/alternative built for group C's Software Engineering final in Spring 2026.  The name came from Thesaurus.com, and is labeled as a "similar word" to Discord.

## Team

- Micah Lindley [@micahlt](https://github.com/micahlt)
- Austin Day [@aaday96](https://github.com/aaday96)
- JD Phillips [@JDP7567](https://github.com/JDP7567)
- Caroline McCoy [@ccmccoy0327](https://github.com/ccmccoy0327)

## Workflow

> [!TIP]
> This repository is an [NPM Workspace](https://docs.npmjs.com/cli/v11/using-npm/workspaces), so most of the things you'll want to do, you can do with `npm` commands in the root of this repository.  Check out the `scripts` section of the [package.json file](/package.json) in this repository for the full list of provided npm scripts.

1. Install Node.js version 22 or above.  Follow the steps for your operating system [here](https://nodejs.org/en/download).
2. Clone this repository to your computer with `git clone https://github.com/micahlt/faction`
3. Open a terminal at the root of the project.
4. Run `npm install` to install dependencies
5. Run `npm run dev:server` to run the server.
6. In another terminal, run `npm run dev:web` to run the frontend.

Alternatively, you can also run `npm run dev` which will simultaneously start the server and the webapp.  However, this means you cannot restart the web app without restarting the server, and vice versa.

## Stack

All of the code lives in this monorepo.

**Frontend:**

- [React.js](https://react.dev) - webapp framework
- [Tanstack Router](https://tanstack.com/router/latest) - modern routing library for React
- [Socket.io](https://socket.io) - realtime communication client
- [Vite](https://vite.dev) - bundler & transpiler

**Backend:**

- [ImgBB](https://imgbb.com) - host for images
- [Node.js](https://nodejs.org) - JavaScript runtime for servers
- [Express.js](https://expressjs.com) - REST API server library
- [Socket.io](https://socket.io) - realtime communication server
- [MongoDB](https://mongodb.com) - database

**Notes:**

- The backend should _not_ serve the frontend files.  The frontend will be deployed as a static site.
- Socket.io should only be used for explicitly realtime communiciation, like message sending.  Anything else should run over a [REST](https://restfulapi.net/) API provided by Express.

## Git Cheatsheet

Here's Micah's basic Git cheat sheet:

***Rules:***

- **Always do your work in a branch.**  Don't commit to `master`.
- **Fetch and pull before branching.**  Don't forget this, as it'll cause merge conflicts down the line.
- **Keep commits contextual.**  For readability's sake, don't do a TON of work in a single commit.  If you're done with a small fix or feature addition, go ahead and commit to your branch, then make another commit for the next change.

***Workflow:***

1. Branch from `master`.  Make sure you're on the `master` branch (see the bottom right of VSCode), and that there is nothing to be pulled from GitHub.  Then open the command palette (**Ctrl+Shift+P**) and run the **Git: Create branch...** command.  Name your branch something like `feature/add-image-sending` or `fix/missing-login-username`, based on whether or not it's a feature or a bugfix.  The current branch in the bottom right of VSCode should show your new branch name.
2. Make changes to your code, and save each of your files (**Ctrl+S**).
3. Stage the changes to be committed.  In the Source Control panel, hover over changes until the plus icon appears.  It should say **Stage All Changes** when you hover over it.  Click it.  Alternatively, you can choose which files you want to commit.  This is good for when you accidentally forgot to commit and need to separate your changes into two or more commits.
4. Commit the changes.  Write a good commit message that describes what you changed.  Then click the big **Commit** button with a checkmark in it.
5. Push your changes to GitHub.  Click the big **Sync Changes** button.
6. When your branch is ready to be merged, create a **pull request**.  Go to the GitHub page for this repository, click the branch dropdown that probably says **master** with a branch icon beside it, and select your branch.  When the page switches to your branch, click the **Contribute** button and click **Open pull request**.  Change the title and description to be descriptive of what your branch adds to the project.
7. Wait for review (*probably*).  If your code modifies important sections of the codebase, or if there are merge conflicts, talk to Micah first.  He can review the pull request (or **PR**) to make sure that everything gets merged in a way that nothing gets broken.  If it's clear that your pull request is ok to merge, go ahead and find the button that says **Merge pull request**.  This will apply your changes to the `master` branch.
8. Start your next large-scale feature or fix by starting over and creating a new branch from `master` (as in step 1).  Do this by switching back to the `master` branch by clicking the name of your branch in the bottom right of VSCode, and then clicking the `master` branch from the list that pops up at the top of the window.  *Alternatively*, you can merge `master` into your branch to get it up to date, but that's more complex.
g` or `fix/type-error`, based on whether or not it's a feature or a bugfix.  The current branch in the bottom right of VSCode should show your new branch name.
2. Make changes to your code, and save each of your files (**Ctrl+S**).
3. Stage the changes to be committed.  In the Source Control panel, hover over changes until the plus icon appears.  It should say **Stage All Changes** when you hover over it.  Click it.  Alternatively, you can choose which files you want to commit.  This is good for when you accidentally forgot to commit and need to separate your changes into two or more commits.
4. Commit the changes.  Write a good commit message that describes what you changed.  Then click the big **Commit** button with a checkmark in it.
5. Push your changes to GitHub.  Click the big **Sync Changes** button.
6. When your branch is ready to be merged, create a **pull request**.  Go to the GitHub page for this repository, click the branch dropdown that probably says **master** with a branch icon beside it, and select your branch.  When the page switches to your branch, click the **Contribute** button and click **Open pull request**.  Change the title and description to be descriptive of what your branch adds to the project.
7. Wait for review (*probably*).  If your code modifies important sections of the codebase, or if there are merge conflicts, talk to Micah first.  He can review the pull request (or **PR**) to make sure that everything gets merged in a way that nothing gets broken.  If it's clear that your pull request is ok to merge, go ahead and find the button that says **Merge pull request**.  This will apply your changes to the `master` branch.
8. Start your next large-scale feature or fix by starting over and creating a new branch from `master` (as in step 1).  Do this by switching back to the `master` branch by clicking the name of your branch in the bottom right of VSCode, and then clicking the `master` branch from the list that pops up at the top of the window.  *Alternatively*, you can merge `master` into your branch to get it up to date, but that's more complex.
