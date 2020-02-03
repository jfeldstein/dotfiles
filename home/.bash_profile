# Terminal coloring
export CLICOLOR=1
export LSCOLORS=gxfxcxdxbxegedabagacad
alias ls="ls -la"

# Sublime Text as default editor for those that check this property
export EDITOR='subl -w'

# Git Aliases
alias gs='git status'
# alias gl='git pull'
alias gp='git push'
alias g="hub"
alias fr='foreman run'
alias git-prune-origin="git checkout master && git fetch --prune && git branch -r --merged | grep -v master | sed 's/origin\///' | xargs -n 1 git push --delete origin"
alias git-prune-local="git checkout master && git branch --merged | grep -v '\*' | grep -v master | grep -v dev | xargs -n 1 git branch -d"
alias undo="git reset --soft 'HEAD^'"

# https://gist.github.com/jacobvosmaer/3187346#gistcomment-387174
alias fix="subl `git diff --name-only | uniq`"

# Python virtualenv alias
alias activate="source ./env/bin/activate"
# Suppress .pyc files
PYTHONDONTWRITEBYTECODE=1

# Postgres
alias pg_start="pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start"
alias pg_restart="pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log restart"
alias pg_stop="pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log stop"

# Fast edit of this file
alias prof="subl ~/.bash_profile"

# Chrome / Optimizely
alias scary-chrome="/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --user-data-dir=/tmp/tempchrome --allow-running-insecure-content &"

# http://fredkschott.com/post/2014/02/git-log-is-so-2005/
git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr)%C(bold blue)<%an>%Creset' --abbrev-commit"
git config --global alias.recent "for-each-ref --sort=-committerdate refs/heads/ --format='%(committerdate:short) %(authorname) %(refname:short)'"
git config --global alias.cam "commit . -m "
git config --global alias.cob "checkout -b "

# From git source. Adds completions for branches, among other treats
source ~/.gittools/git-completion.bash
source ~/.gittools/git-flow-completion.bash
source ~/.gittools/git-prompt.bash

# Show current git branch at bash prompt:
# PS1='\u@\h \W$(__git_ps1 " (%s)")\$ '
PS1=$PS1'$(__git_ps1 " (%s)") \n→ '

export ANDROID_SDK_ROOT=/usr/local/share/android-sdk
export ANDROID_NDK_HOME=/usr/local/opt/android-ndk
export ANDROID_HOME=$ANDROID_SDK_ROOT

PATH=$PATH:/usr/local/share/npm/bin
PATH=/usr/local/bin:$PATH:/usr/bin:/bin:/usr/sbin:/sbin:/usr/X11/bin
PATH=$PATH:/Applications/Postgres.app/Contents/MacOS/bin
PATH=$PATH:$ANDROID_HOME/tools
PATH=$PATH:$ANDROID_HOME/platform-tools
PATH=$PATH:/opt/local/bin
PATH=$PATH:/opt/local/sbin
PATH=$PATH:/usr/local/mysql/bin
PATH=$PATH:/usr/local/git/bin
PATH=$PATH:/Applications/mongodb/bin
PATH=$PATH:/Developer/usr/bin
#PATH=$PATH:/Users/$(whoami)/.nvm/versions/node/v$NODEVER/bin # to enable sublimelinter finding eslint
PATH="/usr/local/opt/postgresql@9.6/bin:$PATH" # Find PG 9.6
PATH="/usr/local/opt/python/libexec/bin:$PATH" # brew install python3

# QGIS
export PATH="/usr/local/sbin:$PATH"
export PYTHONPATH=/usr/local/opt/lib/python3.7/site-packages:/usr/local/opt/osgeo-qgis/lib/python3.7/site-packages:/usr/local/opt/osgeo-qgis/QGIS.app/Contents/Resources/python:/usr/local/opt/osgeo-gdal-python/lib/python3.7/site-packages:$PYTHONPATH

export PATH

# Go
export GOPATH=$HOME/Go
export GOROOT=/usr/local/opt/go/libexec
export FIRST_GO_PATH=$GOPATH
PATH=$PATH:$GOPATH/bin
PATH=$PATH:$GOROOT/bin


# http://blog.macromates.com/2008/working-with-history-in-bash/
export HISTCONTROL=ignoredups:erasedups
export HISTSIZE=1000000
shopt -s histappend

# Install directly to /Applications
export HOMEBREW_CASK_OPTS="--appdir=/Applications"

# Autocorrect on the command line
# shopt -s cdspell

source ~/.nvm/nvm.sh
nvm use > /dev/null 2>&1 # expects ~/.nvmrc to define version
NODEVER=$(node --version)
nvm alias default $NODEVER > /dev/null 2>&1

export NODE_ENV=development
export PATH="/usr/local/heroku/bin:$PATH"

# Load other profiles (sometimes dev tools add to these)
[[ -r ~/.profile ]] && source ~/.profile
[[ -r ~/.bashrc ]] && source ~/.bashrc

export PATH="$PATH:$HOME/.rvm/bin"
[[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm" # Load RVM into a shell session *as a function*
