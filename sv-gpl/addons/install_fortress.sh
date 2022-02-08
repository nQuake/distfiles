#!/bin/bash

# nQuakesv Team Fortress addon installer bash script (for Linux)
# by Empezar

# Type --force to force install
if [ "$1" != "--force" ]; then
        echo "This addon is not yet ready for use."
        exit
fi

# Check if unzip is installed
unzip=`which unzip`
if [ "$unzip"  = "" ]
then
        echo "Unzip is not installed. Please install it and run the nQuakesv installation again."
        exit
fi

# Change folder to nQuakesv
cd `cat ~/.nquakesv/install_dir`

echo
echo "Welcome to the nQuakesv TF installer"
echo "===================================="
echo

# Download nquake.ini
mkdir tmp
cd tmp
wget --inet4-only -q -O nquake.ini https://raw.githubusercontent.com/nQuake/client-win32/master/etc/nquake.ini
if [ -s "nquake.ini" ]
then
        echo foo >> /dev/null
else
        echo "Error: Could not download nquake.ini. Better luck next time. Exiting."
        cd ..
        rm -rf tmp
        exit
fi

# Select a hostname
defaulthostname="Team Fortress Server"
read -p "Enter a descriptive hostname [$defaulthostname]: " hostname
if [ "$hostname" = "" ]
then
        hostname=$defaulthostname
fi
echo

# Select a port
defaultport="27700"
read -p "What port do you want to use? [$defaultport]: " port
if [ "$port" = "" ]
then
        port=$defaultport
fi
echo

# List all the available mirrors
echo "From what mirror would you like to download the TF addon?"
grep "[0-9]\{1,2\}=\".*" nquake.ini | cut -d "\"" -f2 | nl
read -p "Enter mirror number [random]: " mirror
mirror=$(grep "^$mirror=[fhtp]\{3,4\}://[^ ]*$" nquake.ini | cut -d "=" -f2)
if [ "$mirror" = "" ]
then
        echo;echo -n "* Using mirror: "
        RANGE=$(expr$(grep "[0-9]\{1,2\}=\".*" nquake.ini | cut -d "\"" -f2 | nl | tail -n1 | cut -f1) + 1)
        while [ "$mirror" = "" ]
        do
                number=$RANDOM
                let "number %= $RANGE"
                mirror=$(grep "^$number=[fhtp]\{3,4\}://[^ ]*$" nquake.ini | cut -d "=" -f2)
                mirrorname=$(grep "^$number=\".*" nquake.ini | cut -d "\"" -f2)
        done
        echo "$mirrorname"
fi
echo

# Download TF addon
echo "=== Downloading ==="
wget --inet4-only -O sv-fortress.zip $mirror/sv-fortress.zip

# Terminate installation if not all packages were downloaded
if [ -s "sv-fortress.zip" ]
then
        if [ "$(du sv-fortress.zip | cut -f1)" \> "0" ]
        then
                echo foo >> /dev/null
        else
                echo "Error: The TF addon failed to download. Better luck next time. Exiting."
                cd ..
                rm -rf tmp
                exit
        fi
else
        echo "Error: The TF addon failed to download. Better luck next time. Exiting."
        cd ..
        rm -rf tmp
        exit
fi

# Install updates
echo "=== Installing ==="
echo -n "* Extracting packages..."
unzip -qqo sv-fortress.zip 2> /dev/null;echo "done"
echo -n "* Setting permissions..."
find . -type f -exec chmod -f 644 {} \;
find . -type d -exec chmod -f 755 {} \;
echo "done"
# Convert DOS files to UNIX
echo -n "* Converting DOS files to UNIX..."
for file in $(find . -iname "*.cfg")
do
        if [ -f "$file" ]
        then
                awk '{ sub("\r$", ""); print }' $file > /tmp/.nquakesv.tmp
                mv /tmp/.nquakesv.tmp $file
        fi
done
echo "done"
# Install run files
echo -n "* Creating run files..."
echo "#!/bin/sh" >> ../run/fortress1.sh
echo "while true ; do" >> ../run/fortress1.sh
echo "  ./mvdsv -port $port -game fortress +exec port1.cfg +exec maps.cfg" >> ../run/fortress1.sh
echo "done" >> ../run/fortress1.sh
echo "#end of script" >> ../run/fortress1.sh
chmod 755 ../run/fortress1.sh
# Fix start_servers.sh script
echo >> ../start_servers.sh
echo "echo -n \"* Starting mvdsv (port $port)...\"" >> ../start_servers.sh
echo "if ps ax | grep -v grep | grep \"mvdsv -port $port\" > /dev/null" >> ../start_servers.sh
echo "then" >> ../start_servers.sh
echo "echo \"[ALREADY RUNNING]\"" >> ../start_servers.sh
echo "else" >> ../start_servers.sh
echo "./run/fortress1.sh > /dev/null &" >> ../start_servers.sh
echo "echo \"[OK]\"" >> ../start_servers.sh
echo "fi" >> ../start_servers.sh
# Fix stop_servers.sh script
echo >> ../stop_servers.sh
echo "# Kill $port" >> ../stop_servers.sh
echo "pid=\`ps ax | grep -v grep | grep \"/bin/sh ./run/fortress1.sh\" | awk '{print \$1}'\`" >> ../stop_servers.sh
echo "if [ \"\$pid\" != \"\" ]; then kill -9 \$pid; fi;" >> ../stop_servers.sh
echo "pid=\`ps ax | grep -v grep | grep \"mvdsv -port $port\" | awk '{print \$1}'\`" >> ../stop_servers.sh
echo "if [ \"\$pid\" != \"\" ]; then kill -9 \$pid; fi;" >> ../stop_servers.sh
echo "done"
# Move files into place
echo -n "* Moving files into place..."
mv fortress/ ../
mv thundervote/ ../
echo "done"
# Update configuration files
echo -n "* Updating configuration files..."
cd ../fortress/
echo $hostname >> ~/.nquakesv/hostname_fortress
safe_pattern=$(printf "%s\n" "$hostname" | sed 's/[][\.*^$/]/\\&/g')
sed -i "s/NQUAKESV_HOSTNAME/${safe_pattern}/g" port1.cfg
admin=`cat ~/.nquakesv/admin`
safe_pattern=$(printf "%s\n" "$admin" | sed 's/[][\.*^$/]/\\&/g')
sed -i "s/NQUAKESV_ADMIN/${safe_pattern}/g" port1.cfg
remote_ip=`cat ~/.nquakesv/ip`
safe_pattern=$(printf "%s\n" "$remote_ip:$port" | sed 's/[][\.*^$/]/\\&/g')
sed -i "s/NQUAKESV_IP/${safe_pattern}/g" port1.cfg
safe_pattern=$(printf "%s\n" "$port" | sed 's/[][\.*^$/]/\\&/g')
sed -i "s/NQUAKESV_PORT/${safe_pattern}/g" port1.cfg
hostdns=`cat ~/.nquakesv/hostdns`
echo "qtv $hostdns:$port" >> ../qtv/qtv.cfg
echo "done"
# Create symlinks
echo -n "* Creating symlinks..."
ln -s ../ktx/mvdsv.cfg mvdsv.cfg
ln -s ../ktx/pwd.cfg pwd.cfg
ln -s ../ktx/ban_ip.cfg ban_ip.cfg
ln -s ../ktx/vip_ip.cfg vip_ip.cfg
echo "done"

# Remove temporary directory
echo -n "* Cleaning up..."
cd ..
rm -rf tmp
echo "done"

echo;read -p "Do you want to start the server? [n]: " start
if [ "$start" == "y" ]; then
        ./run/fortress1.sh
fi

echo;echo "Installation complete."
echo
