# CausalPath Newt Webserver

CausalPath Webserver with new newt as a visualization tool.

### Requirements

- Node v14.x.x or higher

#### Check node version

- Enter `node --version` in your terminal and it should output `v14.x.x` or `v16.x.x`
- if you do not see such output in your terminal, then you have to install node JS

## Installing Node JS

### Linux

#### 1. Using [nvm](https://github.com/nvm-sh/nvm/blob/master/README.md)

```bash
sudo apt-get update
sudo apt-get upgrade
```

Installing curl

```bash
sudo apt install curl
```

Installing nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

Installing nvm using nvm

```bash
nvm install 16
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