#!/usr/bin/bash

mkdir -p ~/Downloads; cd ~/Downloads

sudo apt-get update

sudo apt-get -y install xfce4
sudo apt-get -y install xfce4-goodies
sudo apt-get -y install -y gnome-system-tools

#x2go remote desktop
sudo apt-get install -y x2goserver x2goclient x2goserver-xsession

#set up for automatic unattended upgrades; important for security
sudo apt-get install -y unattended-upgrades

#popular revision control system
sudo apt-get install -y git 

#basic devel packages
sudo apt-get install -y software-properties-common build-essential libssl-dev
sudo apt-get install -y clang
sudo apt-get install -y apt-transport-https xz-utils wget curl
sudo apt-get install -y jq

#ruby
sudo apt-get install -y ruby

#zig
curl -fsSL \
 https://ziglang.org/builds/zig-x86_64-linux-0.15.0-dev.1380+e98aeeb73.tar.xz \
     > zig.tar.xz
xzcat zig.tar.xz | tar -xf -
sudo cp zig-x86_64-linux*/zig /usr/local/bin
sudo cp -r zig-x86_64-linux*/lib /usr/local/lib/zig
rm -rf zig*

#editors
sudo apt-get install -y xauth emacs gedit vim

#atom no longer supported
#<https://forum.snapcraft.io/t/atom-snap-fails-on-ubuntu-24-04/40916/2>
#sudo snap install atom --classic

#visual studio code
#<https://code.visualstudio.com/docs/setup/linux#_install-vs-code-on-linux>
# install apt-get repo and signing key
echo "code code/add-microsoft-repo boolean true" | sudo debconf-set-selections
sudo apt-get install -y wget gpg
wget -qO- https://packages.microsoft.com/keys/microsoft.asc \
    | gpg --dearmor > microsoft.gpg
sudo install -D -o root -g root -m 644 microsoft.gpg /usr/share/keyrings/microsoft.gpg
rm -f microsoft.gpg
echo 'Types: deb
URIs: https://packages.microsoft.com/repos/code
Suites: stable
Components: main
Architectures: amd64,arm64,armhf
Signed-By: /usr/share/keyrings/microsoft.gpg'  \
     | sudo tee /etc/apt/sources.list.d/vscode.sources >/dev/null
sudo apt-get update -y; sudo apt-get install code

#sublime: <https://www.sublimetext.com/docs/linux_repositories.html>
wget -qO - https://download.sublimetext.com/sublimehq-pub.gpg \
    | sudo tee /etc/apt/keyrings/sublimehq-pub.asc > /dev/null
echo -e 'Types: deb\nURIs: https://download.sublimetext.com/\nSuites: apt/stable/\nSigned-By: /etc/apt/keyrings/sublimehq-pub.asc' \
    | sudo tee /etc/apt/sources.list.d/sublime-text.sources
sudo apt-get update -y && sudo apt-get install -y sublime-text

#google-chrome <https://itsfoss.com/install-chrome-ubuntu/>
sudo apt-get install -y xdg-utils
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt-get install -y fonts-liberation
sudo dpkg -i google-chrome-stable_current_amd64.deb

#firefox
#<https://support.mozilla.org/en-US/kb/install-firefox-linux#w_install-firefox-deb-package-for-debian-based-distributions-recommended>
# set up keyrings dir
sudo install -d -m 0755 /etc/apt/keyrings
# get signing key
wget -q https://packages.mozilla.org/apt/repo-signing-key.gpg -O- | sudo tee /etc/apt/keyrings/packages.mozilla.org.asc > /dev/null
# update sources list
echo "deb [signed-by=/etc/apt/keyrings/packages.mozilla.org.asc] https://packages.mozilla.org/apt-get mozilla main" | sudo tee -a /etc/apt/sources.list.d/mozilla.list > /dev/null
# prioritize Mozilla repo
echo '
Package: *
Pin: origin packages.mozilla.org
Pin-Priority: 1000
' | sudo tee /etc/apt/preferences.d/mozilla
# update package repos and install
sudo apt-get update -y && sudo apt-get install -y firefox

#remote desktop vnc
sudo apt-get install -y tightvncserver xtightvncviewer

#install autocutsel for VNC copy text between client and server
sudo apt-get install -y autocutsel

#<https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/>
sudo apt-get install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg \
	--dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" \
    | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
sudo apt-get update -y
sudo apt-get install -y mongodb-org
sudo apt-get install -y mongodb-mongosh
sudo systemctl enable mongod

## install rust within $HOME
# curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y


## install nodejs within $HOME
## get nvm
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
## install current version
# nvm install 24

## install typescript under node global ($HOME above)
# npm install -g typescript
# npm install -g ts-node

##install bun
#curl -fsSL https://bun.sh/install | bash




#https://linuxconfig.org/ubuntu-22-04-system-backup-and-restore>
#sudo apt-get install -y timeshift
#TIMESHIFT_DEV=/dev/mapper/ubuntu--vg-ubuntu--lv
#sudo timeshift --create --snapshot-device $TIMESHIFT_DEV
#sudo timeshift --list --snapshot-device $TIMESHIFT_DEV


#sudo timeshift --create --snapshot-device $TIMESHIFT_DEV
#sudo timeshift --list --snapshot-device $TIMESHIFT_DEV
