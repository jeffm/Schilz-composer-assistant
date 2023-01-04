cls
echo off
echo Start %TIME%
node "C:\Schilz-composer-assistant\schilz.js" generate -p "C:\\Users\\Jeff\\Documents\\Schilz\\sRhythm\\" -i "sRhythm01.json" -j "sRhythm01_out.json" -c "sRhythm01_out.html" -m "sRhythm01.mid" -v info
echo.
echo End %TIME%