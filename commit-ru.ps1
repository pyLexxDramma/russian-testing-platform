param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$msgFile = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($msgFile, $Message, $utf8NoBom)

git commit -F $msgFile

Remove-Item $msgFile
