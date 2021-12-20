                         nQuake Frequently Asked Questions
====================================================================================

Index

 1. What is the difference between nQuake and ezQuake?
 2. How do I save my config?
 3. Where is my config located?
 4. How do I convert my old config to nQuake?
 5. My teamsays get displayed with a "pla" in front of them. How do I change this?
 6. I've downloaded models, textures, skins etc. Where do I put them?
 7. Where can I download replacement models, textures, maps, etc?
 8. My downloaded models, textures, etc won't display ingame, what do I do?
 9. I want the old Quake models back. What files do I remove?
10. My binds seem to get mysteriously unbound, what's up with that?
11. How do I turn off colored lighting? Some maps won't respond to gl_loadlitfiles 0?
12. How do I turn off 24-bit world textures? I want the original ones.
13. How do I spectate a game?
14. How do I get in contact with other QuakeWorld players?
15. How do I update the game files?
16. I use Windows 8. Please help me.
17. Credits

====================================================================================

1. What is the difference between nQuake and ezQuake?

nQuake is a package that includes everything you need to play QuakeWorld. This
includes a client (ezQuake), custom maps, models, textures and other things that
makes it easier to get started. If you were to download ezQuake (the QuakeWorld
client) individually, you would have to spend several hours downloading extras
(maps, models, textures) before you were able to have anything resembling a modern
game. nQuake does this for you.

====================================================================================

2. How do I save my config?

By default, nQuake saves your config when you exit QuakeWorld to ./ezquake/configs/.
If you have a config you want to use, you need to place your config in that folder
and load it using "/cfg_load <config name>" in the console (unless you name it
config.cfg, then it will be loaded automatically.)

By default, nQuake saves your config automatically on exit. If you don't want this,
type "/cfg_save_onquit 0" in the console. Now whenever you've made changes to your
config (i.e. changed keybindings or other settings), you need to type "/cfg_save" in
order to save your changes to the config. If you have several users using your
QuakeWorld setup, you can also save the config as a different user. To do this, type
"/cfg_save <user>" where <user> can be e.g. "empezar". When you want to load this
config, simply type "/cfg_load empezar". The config that is saved when you do not
specify a user after issuing a "/cfg_save" is loaded automatically during startup.

NOTE: If you are running Windows 7 or higher and installed nQuake to the Program
Files folder, nQuake will not be able to save any changes to your config or any
demos, screenshots or logs. Unless you want to run nQuake as administrator every
time, it is advised you either move your nQuake folder to a different directory, or
type "/cfg_use_home 1" in the console. NQuake will then save your configs, demos,
screenshots and log files to ~/Documents/ezQuake/. However, it is recommended you
move your nQuake folder to C:\nQuake or similar.

====================================================================================

3. Where is my config located?

By default, nQuake saves your config to ./ezquake/configs/ unless you installed
nQuake in the Program Files folder. If you did, the config is instead located in
~/Documents/ezQuake/. The default config is named "config.cfg", and user saved
configs are named "<user>.cfg", e.g. "empezar.cfg".

====================================================================================

4. How do I convert my old config to nQuake?

Simply put it in the ./ezquake/configs/ folder and load it. The nQuake aliases will
be added to your config while all your personal settings will be untouched.

Make sure you set "cfg_save_unchanged" to 1 in your config and save it with cfg_save
BEFORE adding it to nQuake, otherwise nQuake will use nQuake defaults for values
instead of ezQuake defaults (which your old config most likely used).

====================================================================================

5. My teamsays get displayed with a "pla" in front of them. How do I change this?

It is changed by either issuing "/cl_fakename <name>" (three letter abbreviations
are usually used as fakename), or by changing the setting in the ezQuake menus
(Options -> Player -> Player Settings -> Teamchat Name).

====================================================================================

6. I've downloaded models, textures, skins etc. Where do I put them?

./qw/crosshairs/          Crosshairs
./qw/env/                 Skyboxes
./qw/gfx/                 Console backgrounds
./qw/lits/                Colored lighting files (i.e. ".lit" files)
./qw/maps/                Custom maps
./qw/progs/               Models
./qw/skins/               Player skins
./qw/sound/               Sounds
./qw/textures/            Map textures
./qw/textures/bmodels/    Healthbox and ammobox textures
./qw/textures/charsets/   Console characters
./qw/textures/levelshots/ Level screenshots (loading screen while loading a map)
./qw/textures/models/     Model textures (e.g. weapons, armors, projectiles)
./qw/textures/wad/        HUD textures (e.g. armor icons, health icons, big numbers)

If the folders doesn't exist, simply create them. You can also put these files in
the id1 folder or the ezquake folder instead of the qw folder. It is also possible
to package them into zip files, and change the file extension to ".pk3", making them
readable by ezQuake. The .pk3 files need to be located in the ezquake folder, the
id1 folder or the qw folder.

====================================================================================

7. Where can I download replacement models, textures, maps, etc?

* http://gfx.quakeworld.nu

  This website contains console characters, console backgrounds, configs,
  crosshairs, HUD items, models, textures, skins and maps. It has a little bit of
  everything.


* http://quakeone.com/files/

  Although this website is for Quake1 (not QuakeWorld), it still contains a few
  downloads worth downloading. This includes textures, sounds, models and maps.

====================================================================================

8. My downloaded models, textures, etc won't display ingame, what do I do?

Most of nQuake's built in models, textures, sounds etc are built into pk3 files
in the /qw/ folder. Pk3 files are actually zip files that can be opened with for
example WinRAR without a problem. Simply click the pk3 file and choose to open it
with WinRAR.

Inside the pk3 file, look for duplicates of the models/textures that you downloaded
and remove them. If you don't want to remove them, move them out of the pk3 file
and store them outside the /qw/ folder. Perhaps in a /backup/ folder in the nQuake
root folder? Be sure to keep the folder structure intact so you can easily add it
back into the /qw/ folder if you don't like the new models/textures that you
downloaded.

====================================================================================

9. I want the old Quake models back. What files do I remove?

To remove the newer Quake models, remove the file /qw/models.pk3. Please note that
if you do this, your Quake will no longer function unless you have copied pak1.pak
from the full Quake installation to your /id1/ folder.

You can buy Quake on Steam for a few bucks: http://store.steampowered.com/app/2310/

====================================================================================

10. My binds seem to get mysteriously unbound, what's up with that?

This may be due to the fact that nQuake executes the config /ezquake/configs/dm.cfg
when entering a server. It will only unbind keys after having joined a CTF server
and after that a DM server. Edit this file or remove the "exec configs/dm.cfg" from
the alias "on_enter" (by typing "aliasedit on_enter" in the console) to get rid of
this unbinding problem. But be warned that if you remove the file, CTF binds may
stay active even after leaving the CTF server. To avoid this, restart the client
after leaving a CTF server.

====================================================================================

11. How do I turn off colored lighting? Some maps won't respond to gl_loadlitfiles 0?

Type "/gl_loadlitfiles 0" in the console.

====================================================================================

12. How do I turn off 24-bit world textures? I want the original ones.

Type "/gl_externalTextures_world 0" in the console.

====================================================================================

13. How do I spectate a game?

If the game you want to spectate is on one of the servers listed on http://qtv.quakeworld.nu,
simply click "Watch" on the game you want to spectate and Windows will recognise 
the QW:// links and automatically launch the ezQuake client.

Another similar site is http://badplace.eu which also acts as a server browser.

If the game is not listed on qtv.quakeworld.nu, copy the IP address, open ezQuake and
type "/qtvplay <ip>:<port>", and that's it.

If the server doesn't have QTV support (unlikely, but possible), you can connect as
a spectator by typing "/observe <ip>:<port>". You may only do this if the server has
enough open spectator ports.

====================================================================================

14. How do I get in contact with other QuakeWorld players?

The easiest way to get in contact with other players is to join the QuakeWorld Discord
server on http://discord.quake.world and start chatting to fellow QuakeWorld players.

Besides this live chat, you can interact with other QuakeWorld players using the
QuakeWorld.nu forum at http://www.quakeworld.nu/forum/.

====================================================================================

15. How do I update the game files?

nQuake's game files are very seldom updated nowadays since it has had a very long
time to mature. Though if you would like to have a completely updated nQuake, follow
these steps:

1) Uninstall nQuake using the "Only remove files installed by nQuake that have not
   been modified since" option.
2) Move all remaining files in your nQuake directory to a temporary directory,
   this could be achieved by renaming the nQuake directory to e.g. "nQuake-tmp".
3) Download the latest nQuake installer from nquake.com and run it.
4) Install nQuake into its own directory.
5) Move all files from your "nQuake-tmp" directory back into the nQuake directory,
   overwriting all existing files.
6) Your nQuake has now been updated.

====================================================================================

16. I use Windows 8. Please help me.

If you use Windows 8, you could run into problems.

"Could not load OpenGL subsystem"

This issue is usually resolved by downloading updated drivers. Try the beta drivers
too before giving up on this issue.

====================================================================================

17. Credits

Notable credits (alphabetically ordered):

Aquashark — testing, brainstorming, GPL maps
bps — website design and logo (for old and new site)
catwell — artwork for installer welcome/finish page (http://catwell.deviantart.com/)
delete — website design (for new site)
disconnect — testing
hifi — nQonline launch code
JohnNy_cz — interim project leader, testing, brainstorming
mushi — testing, brainstorming
niomic — testing, usability, brainstorming, copywriting
nylon — promotional video
ruskie — testing, brainstorming
Sassa — testing, brainstorming
Spirit — testing, brainstorming
Tonik — testing, brainstorming, GPL maps
Zalon — interim project leader

A full (hopefully) updated list of credits can be found here:
http://wiki.quakeworld.nu/NQuake_credits

-
Last updated on 2017-10-09