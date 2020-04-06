tell application "System Preferences"

    tell anchor "effects" of pane "com.apple.preference.sound" to reveal

    tell application "System Events" to tell process "System Preferences"
        set s to slider "Alert volume:" of tab group 1 of window 1
        repeat while value of s is less than 0.5
            increment s
        end repeat
        repeat while value of s is greater than 0.5
            decrement s
        end repeat
    end tell

end tell
