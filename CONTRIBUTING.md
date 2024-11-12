# Contributing to 10k-Hours

Thanks for checking out 10k-Hours! We'd love for you to contribute. Whether you're a first-time open source contributor or an experienced developer, there are ways you can help make 10k-Hours great!

## Contributing Code

One of the best ways is to grab a bug report or feature suggestion that has been marked `accepted` and dig in. Please be wary of working on issues not marked as accepted. Just because someone has created an issue doesn't mean we'll accept a pull request for it. See [Where to Contribute](#where-to-contribute) below for more information.

### Pull requests

When you create a pull request you waive any patent or copyright claims you might have to the code you're contributing. (For example, you can't submit a PR and then sue 10k-Hours for using your code.)

## Filing Issues

If you have a bug to report or a feature to suggest, you may do so on our [issues page](https://github.com/kapil-zinda/kdLakshya/issues). Please carefully follow all instructions in the template for the given type of issue you're reporting.

We also ask that you search for existing issues, including closed ones! We're in the process of migrating. If someone has already reported a bug or requested the feature you have in mind, vote for it at the top.

For bugs, please verify that you're running the latest version of 10k-Hours. If you file an issue without providing detail, we may close it without comment.

## Build and Run From Source

If you want to understand how 10k-Hours works or want to debug an issue, you'll want to get the source, build it, and run it locally.

### Installing Prerequisites

You'll need git, a recent version of Node.JS (currently v16.X is recommended), npm.

```bash
git clone https://github.com/kapil-zinda/kdLakshya.git
cd kdLakshya
npm install
npm run dev      # to run web version
```

## Where to Contribute

Check out our [issues page](https://github.com/kapil-zinda/kdLakshya/issues) for all potential areas for contributions.

Note that just because a topic exists does not mean we will accept a contribution to the app. There are several reasons we may not accepts a pull requests, like:

- **Maintainability** - We're extremely wary of adding options and preferences for niche behaviors. Our general rule is that the code complexity of adding a preference isn't worth it unless the user base is fairly evenly divided about the desired behavior.

- **User experience** - We want to deliver a lightweight and smooth app, so UX and performance matter a lot. Please try to keep the design lines that are used in the application.

In short, if the issue you want to work on is not labelled with `accepted`, you can start a conversation about whether an external contribution will be considered.

## Code of Conduct

In order to keep the conversation clear and transparent, please limit discussion to English and keep things on topic with the issue. Be considerate to others and try to be courteous and professional at all times.
