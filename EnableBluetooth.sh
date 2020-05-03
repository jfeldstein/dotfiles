#!/usr/bin/env osascript

tell application "System Preferences"

    set the current pane to pane id "com.apple.preferences.Bluetooth"

    tell application "System Events"

        tell process "System Preferences"

            tell window "Bluetooth"

                tell button 6

                    if name is "Turn Bluetooth On" then click

                end tell

            end tell

        end tell

    end tell

    quit

end tell
