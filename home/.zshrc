bindkey "[D" backward-word
bindkey "[C" forward-word
bindkey "^[a" beginning-of-line
bindkey "^[e" end-of-line


# Misc exports
export HOMEBREW_CASK_OPTS="--appdir=/Applications" # `brew cask install` directly to /Applications
export NODE_ENV=development 
export EDITOR='subl -w' # Sublime Text as default editor for those that check this property

# Python friendlies
alias activate="source ./env/bin/activate"
PYTHONDONTWRITEBYTECODE=1

# Git friendlies
source ~/.gittools/git-completion.bash
source ~/.gittools/git-flow-completion.bash
source ~/.gittools/git-prompt.bash

# # QGIS
# export PATH="/usr/local/sbin:$PATH"
# export PYTHONPATH=/usr/local/opt/lib/python3.7/site-packages:/usr/local/opt/osgeo-qgis/lib/python3.7/site-packages:/usr/local/opt/osgeo-qgis/QGIS.app/Contents/Resources/python:/usr/local/opt/osgeo-gdal-python/lib/python3.7/site-packages:$PYTHONPATH

# Go
export GOPATH=$HOME/Go
export GOROOT=/usr/local/opt/go/libexec
export FIRST_GO_PATH=$GOPATH
PATH=$PATH:$GOPATH/bin
PATH=$PATH:$GOROOT/bin

# Version managers (last path changes)
export PATH="$PATH:$HOME/.rvm/bin"
export NVM_DIR="/Users/$(whoami)/.nvm"
[ -s "$HOME/.rvm/scripts/rvm" ] && . "$HOME/.rvm/scripts/rvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# This autoloads .nvmrc when changing directory
autoload -U add-zsh-hook
load-nvmrc() {
  local node_version="$(nvm version)"
  local nvmrc_path="$(nvm_find_nvmrc)"

  if [ -n "$nvmrc_path" ]; then
    local nvmrc_node_version=$(nvm version "$(cat "${nvmrc_path}")")

    if [ "$nvmrc_node_version" = "N/A" ]; then
      nvm install
    elif [ "$nvmrc_node_version" != "$node_version" ]; then
      nvm use
    fi
  elif [ "$node_version" != "$(nvm version default)" ]; then
    echo "Reverting to nvm default version"
    nvm use default
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc