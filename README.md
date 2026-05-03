# gerenciamento-figurinhas-copa-do-mundo-2026

## 1. Introdução do Projeto

**Álbum 2026** é uma aplicação web **mobile-first** que permite aos usuários gerenciar e acompanhar sua coleção de figurinhas de um álbum temático. O projeto nasce como uma POC (Proof of Concept) em HTML/CSS/JavaScript puro, demonstrando uma interface inovadora com visualizações de dados sofisticadas.

**Abordagem de Plataforma:**
- **Fase 1 (Atual)**: Aplicação web responsiva com design otimizado para mobile
- **Acesso**: Funciona perfeitamente em navegadores mobile e desktop com a mesma experiência
- **Fase 2 (Futuro)**: App mobile nativo (React Native/Flutter) quando a base for consolidada

A aplicação permite que usuários:
- Cataloguem e gerenciem figurinhas através de uma interface intuitiva
- Visualizem o progresso de sua coleção de múltiplas perspectivas (matriz, dashboard analítico)
- Capturem lotes de figurinhas simultaneamente via scanner de câmera
- Organizem dados por categorias (seleções/times) com diferentes status (tenho, faltam, repetidas)
- Acessem análises detalhadas do progresso através de gráficos e heatmaps
- Sincronizem dados entre dispositivos (desktop e mobile)

---

## 2. Principais Objetivos (Features)

### 2.1 Funcionalidades Essenciais (MVP)
- [ ] **Gestão de Coleção**: Adicionar, remover e gerenciar figurinhas com status (tenho/faltam/repetidas)
- [ ] **Visualização em Matriz**: Exibir 48 seleções (times) em grid responsivo com indicadores visuais de progresso
- [ ] **Busca e Filtros**: Filtrar seleções e figurinhas por nome, código, tipo e status
- [ ] **Dashboard Analítico**: Radar polar, distribuição de status, ranking de progresso e heatmap
- [ ] **Configurações Personalizáveis**: Modo motion, som, vibração, densidade visual, ciclo de status


## 4. Ideias Futuras...
- [ ] Sistema de autenticação com JWT
- [ ] Sincronização em nuvem com backup automático
- [ ] PWA (Progressive Web App) com suporte offline
- [ ] Testes E2E
- [ ] App mobile nativa (React Native ou Flutter)
- [ ] Sistema de negociação P2P entre usuários
- [ ] Integração com mercados de figurinhas (APIs de e-commerce)
- [ ] Dashboard administrativo para gerenciar catálogo
- [ ] Webhook para notificações em tempo real
- [ ] Suporte a múltiplos idiomas via i18n
- [ ] Analytics avançado com Google Analytics / Amplitude
- [ ] Marketplace integrado de figurinhas
- [ ] Sistema de pagamentos (Stripe, PayPal)
- [ ] Visão em Realidade Aumentada (AR) de figurinhas
- [ ] Machine Learning para recomendações personalizadas
- [ ] API pública com documentação e SDK
- [ ] Community features (fóruns, discussões, eventos)
- [ ] Integração com redes sociais (Twitter, Instagram, TikTok)
---

*Último atualizado: 2 de maio de 2026*


## Para rodar o projeto

rm -rf node_modules package-lock.json && npm install

npm run dev

