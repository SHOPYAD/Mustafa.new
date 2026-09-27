#!/usr/bin/env bash
# Cleanup old locks
killall -9 Xvfb x11vnc websockify 2>/dev/null
rm -f /tmp/.X99-lock /tmp/.X11-unix/X99

# Start virtual display
Xvfb :99 -screen 0 1920x1080x24 -nolisten tcp &
sleep 2

# Set safe open file limits to avoid x11vnc looping over 1B file descriptors
ulimit -n 2048

# Start x11vnc on :99
x11vnc -display :99 -forever -shared -nopw -rfbport 5999 -noxdamage -nap -wait 50 &
sleep 1

# Start websockify for noVNC
exec websockify --web /usr/share/novnc 6080 127.0.0.1:5999
