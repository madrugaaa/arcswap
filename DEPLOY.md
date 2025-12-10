# Deployment Guide

## Prerequisites
1. Install Foundry:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. Set environment variables:
```bash
# Windows PowerShell
$env:PRIVATE_KEY="your_private_key_without_0x"
$env:ARC_RPC_URL="https://rpc.testnet.arc.network"
```

## Deploy Contracts

```bash
forge script script/Deploy.s.sol --rpc-url %ARC_RPC_URL% --private-key %PRIVATE_KEY% --broadcast -vvvv
```

## After Deployment

Copy the deployed addresses and update `src/config/arc.ts`:
- FACTORY_ADDRESS
- ROUTER_ADDRESS
