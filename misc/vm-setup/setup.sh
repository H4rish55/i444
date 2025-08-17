#!/usr/bin/sh

mkdir -p ~/Downloads; cd ~/Downloads

sudo apt-get update

#https://linuxconfig.org/ubuntu-22-04-system-backup-and-restore>
sudo apt-get install -y timeshift
TIMESHIFT_DEV=/dev/mapper/ubuntu--vg-ubuntu--lv
sudo timeshift --create --snapshot-device $TIMESHIFT_DEV
sudo timeshift --list --snapshot-device $TIMESHIFT_DEV

sudo apt-get install -y curl

#<https://wiki.lxde.org/en/Installation>
#installing lubuntu-core did not work
#following command worked but snap firefox hung.
sudo apt-get -y install lxde
sudo apt-get -y install xfce4
sudo apt-get -y install xfce4-goodies
sudo apt-get install -y gnome-system-tools

#x2go remote desktop
#sudo apt-add-repository ppa:x2go/stable
#sudo apt-get update
sudo apt-get install -y x2goserver x2goclient x2goserver-xsession

#set up for automatic unattended upgrades; important for security
sudo apt-get install -y unattended-upgrades

#popular revision control system
sudo apt-get install -y git 

#install packages which may be necessary in building native js modules
sudo apt-get install -y software-properties-common build-essential libssl-dev
sudo apt-get install -y apt-transport-https

#install nodejs
curl -fsSL https://deb.nodesource.com/setup_23.x | sudo -E bash - &&\
sudo apt-get install -y nodejs

#install npm
#sudo apt-get install -y npm
sudo npm install -g npm

#install bun
#sudo snap install bun-js

#<https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/>
sudo apt-get install gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg \
	--dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
sudo apt-get update -y
sudo apt-get install -y mongodb-org
sudo apt-get install -y mongodb-mongosh
sudo systemctl enable mongod

#json query / pretty-printer
sudo apt-get install -y jq

#typescript for global playing-around (project-specific preferred)
sudo npm install -g typescript
sudo npm install -g ts-node

#editors
sudo apt-get install -y xauth emacs gedit vim

#atom no longer supported
#<https://forum.snapcraft.io/t/atom-snap-fails-on-ubuntu-24-04/40916/2>
#sudo snap install atom --classic

#visual studio code
#<https://code.visualstudio.com/docs/setup/linux>
sudo snap install --classic code

#sublime: <https://www.sublimetext.com/docs/linux_repositories.html>
wget -qO - https://download.sublimetext.com/sublimehq-pub.gpg | \
    gpg --dearmor | \
    sudo tee /etc/apt/trusted.gpg.d/sublimehq-archive.gpg > /dev/null
echo "deb https://download.sublimetext.com/ apt/stable/" \
    | sudo tee /etc/apt/sources.list.d/sublime-text.list
sudo apt-get update -y && sudo apt-get install -y sublime-text

#remote desktop vnc
sudo apt-get install -y tightvncserver xtightvncviewer

#install autocutsel for VNC copy text between client and server
sudo apt-get install -y autocutsel

#google-chrome <https://itsfoss.com/install-chrome-ubuntu/>
sudo apt-get install -y xdg-utils
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt-get install -y fonts-liberation
sudo dpkg -i google-chrome-stable_current_amd64.deb

#ruby
sudo apt-get install -y ruby

#zig
curl -fsSL \
 https://ziglang.org/builds/zig-linux-x86_64-0.14.0-dev.2627+6a21d18ad.tar.xz \
     > zig.tar.xz
xzcat zig.tar.xz | tar -xf -
sudo cp zig-linux*/zig /usr/local/bin
sudo cp -r zig-linux*/lib /usr/local/lib/zig
rm -rf zig*

#firefox
#<https://askubuntu.com/questions/1516223/how-to-install-firefox-from-official-mozilla-repository-on-ubuntu-24-04>
wget -q https://packages.mozilla.org/apt/repo-signing-key.gpg -O- | gpg --dearmor | sudo tee /etc/apt/keyrings/packages.mozilla.org.gpg > /dev/null
cat <<EOF | sudo tee /etc/apt/sources.list.d/mozilla.sources > /dev/null
Types: deb
URIs: https://packages.mozilla.org/apt
Suites: mozilla
Components: main
Signed-By: /etc/apt/keyrings/packages.mozilla.org.gpg
EOF
cat <<EOF | sudo tee /etc/apt/preferences.d/mozilla > /dev/null
Package: firefox*
Pin: origin packages.mozilla.org
Pin-Priority: 1001
EOF
cat <<EOF | sudo tee /etc/apt/apt.conf.d/51unattended-upgrades-firefox \
		 > /dev/null
Unattended-Upgrade::Origins-Pattern { "archive=mozilla"; };
EOF
sudo snap remove firefox
sudo apt-get remove -y firefox
sudo apt-get update -y
sudo apt-get install -y firefox

sudo timeshift --create --snapshot-device $TIMESHIFT_DEV
sudo timeshift --list --snapshot-device $TIMESHIFT_DEV
