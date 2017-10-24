NODEVER=7.4.0




# [[ -r ~/.profile ]] && source ~/.profile
# [[ -r ~/.bashrc ]] && source ~/.bashrc
# [[ -r ~/.corporate_profiles/learnist ]] && source ~/.corporate_profiles/learnist
# [[ -r ~/.corporate_profiles/academiaedu ]] && source ~/.corporate_profiles/academiaedu
[[ -r ~/.corporate_profiles/ga ]] && source ~/.corporate_profiles/ga

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
alias gd='git diff | subl'
alias gc='git commit -v'
alias gca='git commit -v -a'
alias gb='git branch'
alias gba='git branch -a'
alias ga='git add -i'
alias gsr='git svn rebase'
alias gsd='git svn dcommit'
alias undo='git reset HEAD~1'
alias d='git diff'
alias git='hub'
alias g="hub"
alias git-prune-origin="git checkout master && git fetch --prune && git branch -r --merged | grep -v master | sed 's/origin\///' | xargs -n 1 git push --delete origin"
alias git-prune-local="git checkout master && git branch --merged | grep -v '\*' | grep -v master | grep -v dev | xargs -n 1 git branch -d"
alias undo="git reset --soft 'HEAD^'"

# Python virtualenv alias
alias activate="source ./env/bin/activate"
# Suppress .pyc files
PYTHONDONTWRITEBYTECODE=1

# Postgres
alias pg_start="pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start"
alias pg_restart="pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log restart"
alias pg_stop="pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log stop"

# Chrome / Optimizely
alias scary-chrome="/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --user-data-dir=/tmp/tempchrome --allow-running-insecure-content &"



# http://fredkschott.com/post/2014/02/git-log-is-so-2005/
git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr)%C(bold blue)<%an>%Creset' --abbrev-commit"

git config --global alias.recent "for-each-ref --sort=-committerdate refs/heads/ --format='%(committerdate:short) %(authorname) %(refname:short)'"

# From git source. Adds completions for branches, among other treats
source ~/.gittools/git-completion.bash
source ~/.gittools/git-flow-completion.bash
source ~/.gittools/git-prompt.bash

##################################################
# Fancy PWD display function from https://wiki.archlinux.org/index.php/Color_Bash_Prompt
##################################################
# The home directory (HOME) is replaced with a ~
# The last pwdmaxlen characters of the PWD are displayed
# Leading partial directory names are striped off
# /home/me/stuff          -> ~/stuff               if USER=me
# /usr/share/big_dir_name -> ../share/big_dir_name if pwdmaxlen=20
##################################################
bash_prompt_command() {
    # How many characters of the $PWD should be kept
    local pwdmaxlen=40
    # Indicate that there has been dir truncation
    local trunc_symbol=".."
    local dir=${PWD##*/}
    pwdmaxlen=$(( ( pwdmaxlen < ${#dir} ) ? ${#dir} : pwdmaxlen ))
    NEW_PWD=${PWD/#$HOME/\~}
    local pwdoffset=$(( ${#NEW_PWD} - pwdmaxlen ))
    if [ ${pwdoffset} -gt "0" ]
    then
        NEW_PWD=${NEW_PWD:$pwdoffset:$pwdmaxlen}
        NEW_PWD=${trunc_symbol}/${NEW_PWD#*/}
    fi
}

bash_prompt() {
    local NONE="\[\033[0m\]"    # unsets color to term's fg color
    local ID_COLOR="\[\033[1;36m\]"
    local PWD_COLOR="\[\033[1;33m\]"
    local UC=$W                 # user's color
    [ $UID -eq "0" ] && UC=$R   # root's color

    PS1="\n${ID_COLOR}${UC}\h:${PWD_COLOR} \${NEW_PWD}${UC}${NONE}"
}

PROMPT_COMMAND=bash_prompt_command
bash_prompt
unset bash_prompt

# Show current git branch at bash prompt:
# PS1='\u@\h \W$(__git_ps1 " (%s)")\$ '
PS1=$PS1'$(__git_ps1 " (%s)") \n→ '

# PS1 suggestions from https://wiki.archlinux.org/index.php/Color_Bash_Prompt:
#PS1='\e[1;33;47m\u \e[1;32;47mon \h \e[1;35;47m\d \@\e[0;0m\n\e[1;34m[dir.= \w] \# > \e[0;0m'
#PS1='\e[1;31;47m\u \e[1;32;47mon \h \e[1;35;47m\d \@\e[0;0m\n\e[1;31m[dir.= \w] \# > \e[0;0m'
export ANDROID_SDK_ROOT=/usr/local/share/android-sdk
export ANDROID_NDK_HOME=/usr/local/opt/android-ndk
# export ANDROID_HOME=/Applications/Android\ Studio.app/sdk
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
PATH=$PATH:/Users/$(whoami)/.nvm/versions/node/v$NODEVER/bin # to enable sublimelinter finding eslint

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

# After each command, append to the history file and reread it. Preserves history across all terminal windows
# export PROMPT_COMMAND="${PROMPT_COMMAND:+$PROMPT_COMMAND$'\n'}history -a; history -c; history -r"

export HOMEBREW_CASK_OPTS="--appdir=/Applications"

alias prof="subl ~/.bash_profile"
# alias tar="tar -cvzf"

# Pretty display recursively
alias tree="ls -R | grep ":$" | sed -e 's/:$//' -e 's/[^-][^\/]*\//--/g' -e 's/^/   /' -e 's/-/|/'"

# Required for Alchemy dev
#source ~/Sync/Code/SDK/alchemy/alchemy-setup

export NODE_ENV=development
# export JAVA_HOME="/Library/Internet Plug-Ins/JavaAppletPlugin.plugin/Contents/Home"

# an android studio 1.0 / os x 10.10 workaround
# export STUDIO_JDK="/Library/Java/JavaVirtualMachines/jdk1.8.0_31.jdk"

export PATH

# {{{
# Node Completion - Auto-generated, do not touch.
# shopt -s progcomp
# for f in $(command ls ~/.node-completion); do
#   f="$HOME/.node-completion/$f"
#   test -f "$f" && . "$f"
# done
# }}}

### Added by the Heroku Toolbelt
export PATH="/usr/local/heroku/bin:$PATH"

# Autocorrect on the command line
# shopt -s cdspell

# Enable some Bash 4 features when possible:
# * `autocd`, e.g. `**/qux` will enter `./foo/bar/baz/qux`
# * Recursive globbing, e.g. `echo **/*.txt`
for option in autocd globstar; do
    shopt -s "$option" 2> /dev/null
done

# Import autujump indexing
[[ -s `brew --prefix`/etc/autojump.sh ]] && . `brew --prefix`/etc/autojump.sh

# Switch to fish terminal. Do this rather than chsh so as to migrate exports
# Things that don't work with fish:
# - any aliases in .bash_profile (some have been migrated to .config/fish/config.fish)
# - rvm?
# - ssh?!
# fish

[[ -s "$HOME/.rvm/scripts/rvm" ]] && . "$HOME/.rvm/scripts/rvm"  # This loads RVM into a shell session.

source ~/.nvm/nvm.sh
nvm use > /dev/null 2>&1 # expects ~/.nvmrc to define version
nvm alias default $NODEVER # TODO: have this derived from nvmrc. is needed for sublimelinter to function

# http://vijayskotecha.blogspot.com/2015/08/2-methods-to-speed-up-you-nodejs-npm.html
alias npmi="time npm i --cache-min=1000000"
# alias npmi="if test npm i --cache-min=1000000; then terminal-notifier -title 'npm' -message 'Install completed successfully' ; else terminal-notifier -title 'npm' -message 'Install failed!' ; fi"
