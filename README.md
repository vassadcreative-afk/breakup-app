# 💔 Breakup PWA — Deploy no Vercel

App de controle financeiro com IA, funciona como app no celular (PWA).

---

## 🚀 Como publicar (passo a passo)

### Pré-requisitos
- Conta gratuita no [GitHub](https://github.com) 
- Conta gratuita no [Vercel](https://vercel.com)

---

### 1. Suba o projeto no GitHub

1. Acesse [github.com](https://github.com) e clique em **"New repository"**
2. Dê um nome: `breakup-app`
3. Marque **Public** e clique em **Create repository**
4. Faça upload da pasta do projeto:
   - Clique em **"uploading an existing file"**
   - Arraste todos os arquivos desta pasta
   - Clique em **Commit changes**

> 💡 Ou, se tiver o Git instalado, rode no terminal:
> ```bash
> git init
> git add .
> git commit -m "primeiro commit"
> git remote add origin https://github.com/SEU_USUARIO/breakup-app.git
> git push -u origin main
> ```

---

### 2. Deploy no Vercel

1. Acesse [vercel.com](https://vercel.com) e clique em **"Add New Project"**
2. Conecte sua conta do GitHub (botão "Continue with GitHub")
3. Selecione o repositório `breakup-app`
4. O Vercel detecta automaticamente que é React — clique em **Deploy**
5. Aguarde ~2 minutos

Pronto! Você vai receber uma URL do tipo: `https://breakup-app.vercel.app`

---

### 3. Instalar no celular como app

#### Android (Chrome):
1. Abra a URL no Chrome do celular
2. Toque no menu (⋮) no canto superior direito
3. Toque em **"Adicionar à tela inicial"**
4. Confirme — o ícone do Breakup aparece na tela!

#### iPhone (Safari):
1. Abra a URL no Safari
2. Toque no botão de compartilhar (📤)
3. Role e toque em **"Adicionar à Tela de Início"**
4. Confirme — pronto!

---

## 🔑 Chave de API (Anthropic)

O app usa IA para analisar comprovantes e gerar relatórios. Para funcionar:

1. Acesse [console.anthropic.com](https://console.anthropic.com)
2. Crie uma conta e gere uma API Key
3. No Vercel, vá em **Settings → Environment Variables**
4. Adicione: `REACT_APP_ANTHROPIC_KEY` = `sk-ant-...`

> ⚠️ O app já funciona sem a chave para controle manual de gastos. A IA é opcional.

---

## 📁 Estrutura do projeto

```
breakup-pwa/
├── public/
│   ├── index.html       # HTML principal com config PWA
│   ├── manifest.json    # Metadados do app (nome, ícone, cor)
│   ├── sw.js            # Service Worker (modo offline)
│   ├── icon-192.png     # Ícone do app
│   └── icon-512.png     # Ícone do app (grande)
├── src/
│   ├── index.js         # Entrypoint React + registro do SW
│   └── App.jsx          # Todo o app
├── package.json
└── vercel.json          # Config de rotas do Vercel
```
