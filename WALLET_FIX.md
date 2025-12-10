# Resolvendo Conflito de Carteiras

## Problema
Você tem múltiplas extensões de carteira instaladas (ex: MetaMask + outra) que estão conflitando.

## Solução

### Opção 1: Desabilitar Outras Carteiras (Recomendado)
1. Abra `chrome://extensions` (ou `edge://extensions`)
2. Desabilite TODAS as extensões de carteira EXCETO MetaMask
3. Recarregue a página (Ctrl+F5)

### Opção 2: Usar Modo Anônimo
1. Abra uma janela anônima
2. Ative APENAS a MetaMask nessa janela
3. Acesse http://localhost:3000

### Opção 3: Perfil Limpo do Chrome
1. Crie um novo perfil no Chrome
2. Instale apenas MetaMask
3. Use esse perfil para desenvolvimento

## Após Resolver
1. Acesse http://localhost:3000
2. Abra o console (F12)
3. Clique em "Connect Wallet"
4. Você deve ver os logs: 🔵 🔍 📡 ✅

## Verificar se Funcionou
No console, você deve ver:
```
🔵 Connect button clicked!
🔍 Ethereum object: Found
📡 Requesting accounts...
✅ Connected: 0x...
```

Se aparecer erro, me envie o log completo!
