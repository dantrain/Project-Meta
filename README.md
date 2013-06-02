Project Meta
============

[projectmeta.herokuapp.com](http://projectmeta.herokuapp.com/)

A web app for finding new music worth listening to.

Prerequisites
-------------

[Node.js](http://nodejs.org/) and [MongoDB](http://mongodb.org/) should be installed.

Build & Run
-----------

To install dependencies with npm, run: `npm install`.

To run the app, start a local MongoDB instance and run `node serverdev.js`. This will run from the `public/` directory. The app expects data in a collection named `albums` within a DB named `metadb`.

To build, which minifies and concatenates JavaScript and CSS, run `node r.js -o app.build.js`. To run the app from the `public-built/` directory, run `node server.js`.

Tests
-----

The functional tests require [PhantomJS](http://phantomjs.org/) to be installed and in your PATH. They also require the [Mocha](http://visionmedia.github.io/mocha/) test framework: `npm install -g mocha`.

The tests use their own collection `albumstest` in the local MongoDB instance, which must be available. To run the tests: `mocha -R spec tests`.