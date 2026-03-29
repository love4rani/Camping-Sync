@echo off
setlocal
echo ==========================================
echo  Camping-Sync: Source Code Recovery Tool
echo ==========================================
echo.
echo [1] Show Recent Commits (Checkpoints)
echo [2] Rollback to a specific commit (SHA)
echo [3] Hard Reset to Last Stable State
echo [q] Quit
echo.
set /p opt="Select an option: "

if "%opt%"=="1" (
    git log --oneline -n 15
    pause
    goto :eof
)
if "%opt%"=="2" (
    set /p sha="Enter the SHA hash to rollback to: "
    echo Restoring to %sha%...
    git reset --hard %sha%
    echo Restore complete.
    pause
    goto :eof
)
if "%opt%"=="3" (
    echo Are you sure you want to reset all changes to the last commit?
    set /p confirm="[y/n]: "
    if "%confirm%"=="y" (
        git reset --hard HEAD
        echo Reset complete.
    )
    pause
    goto :eof
)
if "%opt%"=="q" exit /b
