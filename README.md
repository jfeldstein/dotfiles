Installation
--------------

# Generate a new ssh key for the machine
```
ssh-keygen -t rsa -C "bdefore@gmail.com"
ssh-add ~/.ssh/id_rsa
pbcopy < ~/.ssh/id_rsa.pub
```

# signup/log into github, add new machine's ssh key
```
open https://github.com/settings/ssh
```

# run .setup
```
curl https://github.com/bdefore/dofiles/.setup | sudo sh 
```