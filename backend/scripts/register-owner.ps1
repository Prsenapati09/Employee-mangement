
$ErrorActionPreference = "Stop"

function Convert-SecureStringToPlainText {
    param(
        [Parameter(Mandatory = $true)]
        [System.Security.SecureString] $SecureValue
    )

    $pointer = [IntPtr]::Zero
    try {
        $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureValue)
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    }
    finally {
        if ($pointer -ne [IntPtr]::Zero) {
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
        }
    }
}

Write-Host "`nHRMPro - Trusted Owner Onboarding" -ForegroundColor Cyan
Write-Host "Only a local API endpoint is permitted."
Write-Host "No existing account or organization will be intentionally overwritten.`n"

$apiBase = "http://localhost:4000/api/v1"

$organizationName = (Read-Host "Organization name").Trim()
$organizationSlug = (Read-Host "Organization slug (example: acme-hr)").Trim().ToLowerInvariant()
$email = (Read-Host "Owner email").Trim().ToLowerInvariant()

if ($organizationName.Length -lt 2 -or $organizationName.Length -gt 120) {
    throw "Organization name must be 2-120 characters."
}

if ($organizationSlug.Length -gt 80 -or $organizationSlug -notmatch '^[a-z0-9]+(?:-[a-z0-9]+)*$') {
    throw "Invalid organization slug."
}

try {
    $mailAddress = [System.Net.Mail.MailAddress]::new($email)
    if ($mailAddress.Address -ne $email -or $email.Length -gt 254) {
        throw "Invalid email."
    }
}
catch {
    throw "Enter a valid email address."
}

$secretSecure = Read-Host "Backend owner provisioning secret (hidden)" -AsSecureString
$passwordSecure = Read-Host "Initial owner password (hidden, minimum 12 characters)" -AsSecureString

$secret = $null
$password = $null
$body = $null
$headers = $null
$response = $null

try {
    $secret = Convert-SecureStringToPlainText $secretSecure
    $password = Convert-SecureStringToPlainText $passwordSecure

    if ([string]::IsNullOrWhiteSpace($secret) -or $secret.Length -lt 32) {
        throw "Provisioning secret must be configured and at least 32 characters."
    }

    if ($password.Length -lt 12 -or $password.Length -gt 128) {
        throw "Password must be 12-128 characters."
    }

    $headers = @{ "x-owner-provisioning-key" = $secret }
    $body = @{
        organizationName = $organizationName
        organizationSlug = $organizationSlug
        email = $email
        password = $password
    } | ConvertTo-Json

    Write-Host "`nSubmitting request to local backend..." -ForegroundColor Yellow

    $response = Invoke-RestMethod `
        -Uri "$apiBase/auth/register-owner" `
        -Method Post `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 30

    if (-not $response.success -or -not $response.data) {
        throw "Backend did not confirm successful registration."
    }

    Write-Host "`nOwner registration succeeded." -ForegroundColor Green
    Write-Host "Organization: $($response.data.organization.name)"
    Write-Host "Organization slug: $($response.data.organization.slug)"
    Write-Host "Owner email: $($response.data.user.email)"
    Write-Host "Access token was not printed or saved."
}
catch {
    Write-Host "`nRegistration was not confirmed." -ForegroundColor Red
    Write-Host "Check backend status, configuration, and whether the slug already exists."
    Write-Host "If the request timed out, check the database before retrying."
    exit 1
}
finally {
    $secret = $null
    $password = $null
    $body = $null
    $headers = $null
    $response = $null
    $secretSecure.Dispose()
    $passwordSecure.Dispose()
}
