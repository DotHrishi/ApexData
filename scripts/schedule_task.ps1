$Action = New-ScheduledTaskAction -Execute "python.exe" -Argument '"C:\Users\Hrishikesh Kali\ApexData\scripts\auto_pipeline_update.py"'
$Trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At 11:00pm
Register-ScheduledTask -TaskName "ApexData_F1_AutoRetrain" -Action $Action -Trigger $Trigger -Description "Automated post-race F1 telemetry update and MLOps model retraining" -Force
Write-Host "✅ ApexData F1 Auto-Retrain task scheduled successfully for every Sunday at 11:00 PM!"
