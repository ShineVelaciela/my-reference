@echo off
if exist gulp.bat del gulp.bat
echo cd angle\master > gulp.bat
echo gulp >> gulp.bat
start gulp.bat