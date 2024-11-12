# Contributing to 10k-Hours

Thanks for your interest in contributing to 10k-Hours! Whether you're a first-time open source contributor or an experienced developer, your help is valuable. Here’s a guide to get you started.

## How to Contribute

There are a few ways you can contribute to the 10k-Hours project:

- **Reporting bugs** and **suggesting features** on our [issues page](https://github.com/kapil-zinda/kdLakshya/issues).
- **Contributing code** to address accepted issues.
- **Improving documentation** to help others use the project more effectively.

### Getting Started

To start contributing code, you'll want to fork the repository, create a branch, and submit a pull request (PR). Here's a quick guide:

1. **Fork and Clone the Repository**

   ```bash
   git clone https://github.com/kapil-zinda/kdLakshya.git
   cd kdLakshya
   npm install
   npm run dev      # to run the web version locally
   ```

2. **Create a New Branch from Master**
   All new branches should be created from the `master` branch. Do not create branches from other branches. Your branch name should follow one of these conventions based on the purpose of the branch:

   - **Features**: `ftr/branch_name`
   - **Bugs**: `bug/branch_name`
   - **Fixes**: `fix/branch_name`

   For example:

   ```bash
   git checkout master
   git checkout -b ftr/new-feature
   ```

3. **Write Meaningful Commits**
   Clear, descriptive commit messages make it easier for others to understand what each change does. Use the imperative mood (e.g., “Add feature X” or “Fix bug Y”).

4. **Submit Pull Requests (PR)**
   - **Staging PR**: First, submit a PR from your feature branch to the `staging` branch. This will allow testing and validation before it goes to production.
   - **Master PR**: After testing is completed on `staging`, submit a PR from your branch to `master`. This merge will trigger the code to be tested on production.

## Contributing Code

One of the best ways to start contributing code is to address issues marked with the `accepted` label. **Please do not work on issues without this label**, as we may not accept PRs for those issues.

### Pull Requests

When you create a pull request, you waive any patent or copyright claims to the code you're contributing. You cannot submit a PR and later take legal action against 10k-Hours for using your code.

### Code Review Process

Your PR will go through a review process to ensure it meets the project’s standards. Please be receptive to feedback, as it helps maintain code quality and ensure alignment with project goals.

## Filing Issues

To report bugs or suggest features, please follow these steps:

1. **Check Existing Issues**: Before filing a new issue, please check the [issues page](https://github.com/kapil-zinda/kdLakshya/issues) to avoid duplicates.
2. **Follow the Template**: When creating an issue, please fill out the template completely.
3. **Reproduce the Issue**: For bugs, make sure you are running the latest version of 10k-Hours and provide steps to reproduce the issue. Without sufficient detail, we may close the issue without further comment.

## Building and Running from Source

If you’re interested in understanding how 10k-Hours works or debugging an issue, you can build and run the app locally. Prerequisites include `git`, `Node.js` (v16.X recommended), and `npm`.

```bash
git clone https://github.com/kapil-zinda/kdLakshya.git
cd kdLakshya
npm install
npm run dev
```

## Where to Contribute

Visit our [issues page](https://github.com/kapil-zinda/kdLakshya/issues) to find areas where contributions are needed.

Please note that even if an issue exists, it does not guarantee that a contribution for that issue will be accepted. Reasons include:

- **Maintainability** - We're extremely wary of adding options and preferences for niche behaviors. Our general rule is that the code complexity of adding a preference isn't worth it unless the user base is fairly evenly divided about the desired behavior.

- **User experience** - We want to deliver a lightweight and smooth app, so UX and performance matter a lot. Please try to keep the design lines that are used in the application.

In short, if the issue you want to work on is not labelled with `accepted`, you can start a conversation about whether an external contribution will be considered.

## Code of Conduct

In order to keep the conversation clear and transparent, please limit discussion to English and keep things on topic with the issue. Be considerate to others and try to be courteous and professional at all times.
