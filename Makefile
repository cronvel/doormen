


# User rules

# The first rule is the default rule, when invoking "make" without argument...
# Build every buildable things
all: install doc browser

# Just install things so it works, basicaly: it just performs a "npm install --production" ATM
install: log/npm-install.log

# Just install things so it works, basicaly: it just performs a "npm install" ATM
dev-install: log/npm-dev-install.log

# Build
build: browser

# Build the browser lib
browser: browser/doormen.js browser/doormen.min.js browser/doormen-light.js browser/doormen-light.min.js

# This run the JsHint & Mocha BDD test, display it to STDOUT & save it to log/mocha.log and log/jshint.log
test: log/jshint.log log/mocha.log

# This run the JsHint, display it to STDOUT & save it to log/jshint.log
lint: log/jshint.log

# This run the Mocha BDD test, display it to STDOUT & save it to log/mocha.log
unit: log/mocha.log

# Performs the browser tests
browser-test: log/testling.log

# This build the doc and README.md
doc: README.md

# This publish to NPM and push to Github, if we are on master branch only
publish: check-if-commited browser README.md build-commit log/npm-publish.log log/github-push.log

# Clean temporary things, or things that can be automatically regenerated
clean: clean-all



# Variables

MOCHA=mocha -c
BROWSERIFY=browserify
UGLIFY=uglifyjs



# Files rules

# Build the browser lib
browser/doormen.js: lib/*.js
	${BROWSERIFY} lib/browser.js -i buffer -i mongodb -s doormen -o browser/doormen.js

# Build the browser minified lib
browser/doormen.min.js: browser/doormen.js
	${UGLIFY} browser/doormen.js -o browser/doormen.min.js -m

# Build the browser lib
browser/doormen-light.js: lib/*.js
	${BROWSERIFY} lib/browser-light.js -i buffer -i mongodb -s doormen -o browser/doormen-light.js

# Build the browser minified lib
browser/doormen-light.min.js: browser/doormen-light.js
	${UGLIFY} browser/doormen-light.js -o browser/doormen-light.min.js -m

# JsHint STDOUT test
log/jshint.log: log/npm-dev-install.log lib/*.js test/*.js
	${JSHINT} lib/*.js test/*.js | tee log/jshint.log ; exit $${PIPESTATUS[0]}

# Mocha BDD STDOUT test
log/mocha.log: log/npm-dev-install.log lib/*.js test/*.js
	${MOCHA} test/*.js -R spec | tee log/mocha.log ; exit $${PIPESTATUS[0]}

# README
README.md: documentation.md
	cat documentation.md > README.md

# Mocha Markdown BDD spec
bdd-spec.md: log/npm-dev-install.log lib/*.js test/*.js
	${MOCHA} test/*.js -R markdown > bdd-spec.md

# Publish to NPM
log/npm-publish.log: check-if-master-branch upgrade-package-version
	npm publish | tee log/npm-publish.log ; exit $${PIPESTATUS[0]}

# Push to Github/master
log/github-push.log: check-if-master-branch lib/*.js test/*.js package.json
	#'npm version patch' create the git tag by itself... 
	#git tag v`cat package.json | grep version | sed -r 's/.*"([0-9.]*)".*/\1/'`
	git push origin master --tags | tee log/github-push.log ; exit $${PIPESTATUS[0]}

# NPM install
log/npm-install.log: package.json
	npm install --production | tee log/npm-install.log ; exit $${PIPESTATUS[0]}

# NPM install for developpement usage
log/npm-dev-install.log: package.json
	npm install | tee log/npm-dev-install.log ; exit $${PIPESTATUS[0]}



# PHONY rules

.PHONY: clean-all check-if-master-branch check-if-commited build-commit upgrade-package-version

# Delete files, mostly log and non-versioned files
clean-all:
	rm -rf log/*.log README.md bdd-spec.md node_modules

# This will fail if we are not on master branch (grep exit 1 if nothing found)
check-if-master-branch:
	git branch | grep  "^* master$$"

# This will fail if there are change not commited (grep exit 1 if nothing found)
check-if-commited:
	git status | grep  "^nothing to commit" || ( echo -ne "\x1b[31mYou should commit first!\x1b[0m\n" ; exit 1 )
	
# Commit an automatic build
build-commit:
	git commit -am "Build" || exit 0

# Upgrade version in package.json
upgrade-package-version:
	npm version patch -m "Upgrade package.json version to %s"




