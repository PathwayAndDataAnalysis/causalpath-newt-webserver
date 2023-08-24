# CausalPath Newt Webserver

CausalPath Webserver with new newt as a visualization tool.

This tool is live at: https://causalpath.cs.umb.edu/

### Requirements

- Node v14.x.x
- Unzip (get it with `sudo apt install unzip`)
- Java (preferably Java 11, get it with `sudo apt install openjdk-11-jdk`)

#### Check node version

- Enter `node --version` in your terminal and it should output `v14.x.x`
- if you do not see such output in your terminal, then you have to install node JS

## Install [Node JS](https://nodejs.org/)

### Linux

#### 1. Using [nvm](https://github.com/nvm-sh/nvm/blob/master/README.md)

```bash
sudo apt-get update
sudo apt-get upgrade
```

Install [curl](https://curl.se/)

```bash
sudo apt install curl
```

Install nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

Installing nvm using nvm

```bash
nvm install 14
```

Check version

```bash
node --version
```

### Windows

- Visit https://nodejs.org/en/ and download installation file and install it

### MacOS

- Install using homebrew:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node
node --version
```

## Getting Started

```bash
git clone https://github.com/PathwayAndDataAnalysis/causalpath-newt-webserver.git
cd causalpath-newt-webserver
npm install

npm start
```
