# Diretrizes de Segurança: Pacotes NPM

Este documento descreve as especificações e boas práticas para proteger projetos Node.js, React Native e ReactJS contra vulnerabilidades e ataques baseados na cadeia de suprimentos (supply chain) de pacotes NPM.

## 1. Vetores de Ataque Comuns em NPM

*   **Typosquatting:** Atacantes publicam pacotes com nomes muito semelhantes aos de pacotes populares (ex: `react-dom` vs `react-don`), esperando que o desenvolvedor cometa um erro de digitação.
*   **Dependency Confusion:** Exploração da forma como os gerenciadores de pacotes resolvem dependências privadas vs públicas, enganando o sistema para baixar um pacote malicioso do registro público em vez do registro privado da empresa.
*   **Comprometimento de Mantenedores (Account Takeover):** Contas de desenvolvedores legítimos são invadidas (por falta de MFA/2FA) e versões maliciosas de pacotes populares são publicadas.
*   **Scripts de Instalação Maliciosos:** Pacotes NPM podem executar scripts arbitrários (como `preinstall`, `postinstall`) que rodam com os privilégios do usuário que está instalando o pacote.

## 2. Boas Práticas Gerais (Node.js, React Native, ReactJS)

### 2.1. Auditoria Contínua
*   Utilize comandos nativos de auditoria regularmente:
    ```bash
    npm audit
    # ou
    yarn audit
    ```
*   Incorpore ferramentas de análise de composição de software (SCA) no pipeline de CI/CD (ex: Snyk, Dependabot, Renovate) para alertar e bloquear PRs que introduzam vulnerabilidades conhecidas.

### 2.2. Gestão de Lockfiles
*   **Sempre comite os lockfiles** (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`). Eles garantem que a árvore de dependências seja exata e reprodutível em todos os ambientes.
*   Em ambientes de CI/CD e produção, utilize `npm ci` em vez de `npm install`. O `npm ci` instala estritamente o que está no lockfile e falha se houver divergências.

### 2.3. Controle de Scripts de Ciclo de Vida
*   Desabilite a execução automática de scripts de pacotes de terceiros caso não sejam estritamente necessários:
    ```bash
    npm install --ignore-scripts
    ```
*   Avalie dependências antes de instalá-las usando ferramentas como `npm-audit` ou inspecionando o código-fonte no repositório oficial.

### 2.4. Proteção contra Dependency Confusion
*   Registre escopos NPM (ex: `@minha-empresa/pacote-interno`) e associe-os estritamente ao seu registro privado.
*   Configure corretamente o arquivo `.npmrc` para garantir que pacotes de determinados escopos sejam buscados apenas no registro privado.

### 2.5. Autenticação e MFA
*   Se a sua equipe publica pacotes, force o uso de Autenticação de Múltiplos Fatores (MFA / 2FA) em todas as contas do NPM e repositórios de código.

## 3. Considerações Específicas por Ecossistema

### 3.1. Node.js (Backend)
*   No backend, pacotes maliciosos têm acesso direto ao sistema de arquivos, variáveis de ambiente (onde residem segredos e chaves de API) e rede.
*   Evite rodar a aplicação como `root`.
*   Monitore ou restrinja acesso à rede e ao sistema de arquivos no ambiente de execução (ex: usando containers isolados ou políticas de permissão do Node.js, como `--experimental-permission`).

### 3.2. React Native (Mobile)
*   Dependências maliciosas podem tentar exfiltrar dados sensíveis do dispositivo (tokens de autenticação, dados locais criptografados).
*   Tenha cuidado com pacotes que exigem linkagem de código nativo (Java/Kotlin, Objective-C/Swift), pois o código nativo malicioso pode contornar as restrições do ambiente JavaScript.
*   Revise cuidadosamente as permissões (ex: câmera, contatos, rede) solicitadas por bibliotecas de terceiros no `AndroidManifest.xml` e no `Info.plist`.

### 3.3. ReactJS (Frontend/Web)
*   No frontend, o maior risco de um pacote NPM malicioso (além de roubar variáveis de ambiente durante o *build*) é a injeção de código para ataques de XSS ou exfiltração de dados (como roubo de cookies, tokens JWT no LocalStorage ou interceptação de formulários).
*   Se carregar scripts via CDN, utilize **Subresource Integrity (SRI)** para garantir que o script não foi alterado.
*   Mantenha um CSP (Content Security Policy) rigoroso para mitigar tentativas de comunicação de pacotes maliciosos com servidores externos de atacantes.
