cls
echo off
echo Start %TIME%
echo.
REM node "c:\Schilz-composer-assistant\schilz.js" -g -p "C:\\Schilz-composer-assistant\\Projects\\Book 5 Harmony\\Chords and Progressions\\" -i "chords_1_input.json" -j "chords_1_output.json" -m "chords_1.midi" -v "info"
echo.
REM node "c:\Schilz-composer-assistant\pitchScaleHelper.js"
REM node "c:\Schilz-composer-assistant\schilz.js" -g -p "C:\\Schilz-composer-assistant\\Projects\\Book 3 Geometrical Projections\\Chapter 1\\" -i "inversion_1_input.json" -j "inversion_1_output.json" -m "inversion_1.midi" -v "info"
echo.
REM node "c:\Schilz-composer-assistant\schilz.js" -g -p "C:\\Schilz-composer-assistant\\Projects\\Book 5 Harmony\\Chords and Progressions\\" -c "C_Blues_chart.html" -i "C_Blues_input.json" -m "C_Blues.midi" -j "C_Blues_output.json" -v "info"
echo.
REM node "c:\Schilz-composer-assistant\schilz.js" -g -p "C:\\Schilz-composer-assistant\\Projects\\Book 5 Harmony\\Chords and Progressions\\" -c "chords_3_chart.html" -i "chords_3_input.json" -j "chords_3_output.json" -m "chords_3.midi" -v "info"
echo.
REM node "c:\Schilz-composer-assistant\schilz.js" -g -p "C:\\Schilz-composer-assistant\\Projects\\Book 5 Harmony\\Chords and Progressions\\" -i "chords_2_input.json" -j "chords_2_output.json" -m "chords_2.midi" -v "info"
echo.
REM node "c:\Schilz-composer-assistant\schilz.js" -g -p "C:\\Schilz-composer-assistant\\Projects\\Book 5 Harmony\\Chords and Progressions\\" -i "chords_4_input.json" -j "chords_4_output.json" -m "chords_4.midi" -v "info"
echo.

node "c:\Schilz-composer-assistant\schilz.js" -g -p "C:\\Users\\Jeff\\Documents\\Schilz\\" -i "autumn_1.json" -j "autumn_1_output.json" -m "autumn_1.midi" -c "autumn_1_chart.html" -v "info"
echo.

echo End %TIME%