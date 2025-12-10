# Foundry Installation - Windows

## Method 1: Using PowerShell (Recommended)

1. **Download foundryup**:
```powershell
# Download the installer
Invoke-WebRequest -Uri https://foundry.paradigm.xyz/foundryup/install.ps1 -OutFile foundryup.ps1

# Run the installer
.\foundryup.ps1
```

## Method 2: Using Git Bash or WSL

If you have Git Bash or WSL installed:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Method 3: Manual Installation

1. Download from GitHub releases:
   https://github.com/foundry-rs/foundry/releases

2. Extract and add to PATH

## Verify Installation

After installation, verify:
```powershell
forge --version
cast --version
anvil --version
```

## Troubleshooting

If you get "command not found", you may need to:
1. Restart PowerShell
2. Add Foundry to PATH manually:
   - Default location: `C:\Users\<YourUser>\.foundry\bin`
