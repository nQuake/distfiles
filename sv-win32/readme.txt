                         nQuake Frequently Asked Questions
====================================================================================

Index

1. How do I start a server?
2. How do I create extra ports for a server?
3. Credits

====================================================================================

1. How do I start a server?

To start a server, simply go to the start menu (if you chose to install start menu
items) and click the port you want to start.

====================================================================================

2. How do I create extra ports for a server?

If you want extra ports (perhaps for Team Fortress or some other mod that only comes
with one port installed), simply go to the /shortcuts/ folder in your nQuakesv
folder and copy the shortcut for the server you want extra ports for. Rename the
port to a suiting name (e.g. fortress 27701), then right click the new shortcut and
select Properties. Edit the Target to look like this:

"C:\nQuakesv\mvdsv.exe -port 27701 -game fortress +exec port2.cfg"

(Where C:\nQuakesv\ is the path where you installed nQuakesv)

This will create a new Team Fortress port (-game fortress), with port address 27701
(-port 27701) and execute the config port2.cfg to load settings (+exec port2.cfg).

To finish the installation of a new port, go to the /fortress/ folder and copy
port1.cfg and name it port2.cfg. Change the following setting:

qtv_streamport                  "27700" // stream qtv to this tcp port

Change this to 27701 or whatever port you wish to run your new server on.

The other modifications can be changed by the same procedure:

Mod             Gamedir         Ports
Clan Arena      cace            27800-27810
Free For All    ffa             27500-27510
Team Fortress   fortress        27700-27710
KTX             ktx             28500-28510

Don't forget to open the respective ports in your firewall!

====================================================================================