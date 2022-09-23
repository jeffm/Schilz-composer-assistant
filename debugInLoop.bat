cls
echo off
echo Start %TIME%
echo.
REM node "c:\Schilz-composer-assistant\schilz.js" -g -p "C:\\Schilz-composer-assistant\\Projects\\Book 5 Harmony\\Chords and Progressions\\" -i "chords_1_input.json" -j "chords_1_output.json" -m "chords_1.midi" -v "info"
echo.
REM node "c:\Schilz-composer-assistant\pitchScaleHelper.js"
REM node "c:\Schilz-composer-assistant\schilz.js" -g -p "C:\\Schilz-composer-assistant\\Projects\\Book 3 Geometrical Projections\\Chapter 1\\" -i "inversion_1_input.json" -j "inversion_1_output.json" -m "inversion_1.midi" -v "info"
echo.
REM node "c:\Schilz-composer-assistant\schilz.js" -g -p "C:\\Schilz-composer-assistant\\Projects\\Book 5 Harmony\\Chords and Progressions\\" -i "chords_2_input.json" -j "chords_2_output.json" -m "chords_2.midi" -v "info"
echo.
node "c:\Schilz-composer-assistant\schilz.js" -g -p "C:\\Schilz-composer-assistant\\Projects\\Book 5 Harmony\\Chords and Progressions\\" -i "chords_3_input.json" -j "chords_3_output.json" -m "chords_3.midi" -v "info"
echo.

echo End %TIME%