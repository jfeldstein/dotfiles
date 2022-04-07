bindkey "[D" backward-word
bindkey "[C" forward-word
bindkey "^[a" beginning-of-line
bindkey "^[e" end-of-line

# VSCode's "code" command
export PATH="$PATH:/Applications/Visual\ Studio\ Code.app/Contents/Resources/app/bin"

# Misc exports
export NODE_ENV=development
export EDITOR='subl -w' # Sublime Text as default editor for those that check this property

# Python friendlies
alias activate="source ./env/bin/activate"
PYTHONDONTWRITEBYTECODE=1

# Git friendlies
. ~/.gittools/git-prompt.sh
setopt PROMPT_SUBST ; PS1='[%n@%m %c$(__git_ps1 " (%s)")]\$ '
autoload -Uz compinit && compinit

# Go
export GOPATH=$HOME/Go
export GOROOT=/usr/local/opt/go/libexec
export FIRST_GO_PATH=$GOPATH
PATH=$PATH:$GOPATH/bin
PATH=$PATH:$GOROOT/bin

# Pyenv
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
if command -v pyenv 1>/dev/null 2>&1; then
  eval "$(pyenv init --path)"
  eval "$(pyenv init -)"
  eval "$(pyenv virtualenv-init -)"
fi

# Version managers (last path changes)
export PATH="$PATH:$HOME/.rvm/bin"
export PATH="/opt/homebrew/bin:$PATH" 
export NVM_DIR="/Users/$(whoami)/.nvm"
[ -s "$HOME/.rvm/scripts/rvm" ] && . "$HOME/.rvm/scripts/rvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
[ -s "./.nvmrc" ] && nvm use

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

