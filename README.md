# Audio Echo - Microfone Mobile

Este repositório contém o aplicativo mobile do projeto **Audio Echo** (Microfone Mobile), desenvolvido em React Native com Expo. Ele permite transformar o seu dispositivo móvel em um microfone sem fio, transmitindo áudio de alta qualidade em tempo real para um servidor rodando em seu computador através da rede local.

---

## Funcionalidades

- **Transmissão em Tempo Real**: Captura o áudio do microfone do celular e envia instantaneamente via WebSockets para o computador.
- **Conexão Rápida via QR Code**: Basta apontar a câmera do celular para o QR Code gerado pelo servidor no computador para conectar instantaneamente.
- **Descoberta Automática (Auto Discovery)**: Varre a rede local à procura do servidor ativo para facilitar a conexão sem necessidade de digitação.
- **Histórico de Conexões**: Armazena os últimos IPs e portas utilizados para que você possa se reconectar com apenas um toque.
- **Interface Moderna**: UI moderna com tema escuro (Dark Mode) e feedback visual em tempo real sobre o estado da transmissão e conexão.

---

## Tecnologias Utilizadas

O projeto foi construído utilizando as seguintes tecnologias e bibliotecas:

- **[React Native](https://reactnative.dev/) & [Expo](https://expo.dev/)**: Plataforma e framework para o desenvolvimento mobile multiplataforma de forma ágil e moderna.
- **[TypeScript](https://www.typescriptlang.org/)**: Linguagem de programação que adiciona tipagem estática e segurança ao desenvolvimento JavaScript.
- **[Tailwind CSS (twrnc)](https://github.com/nandorojo/twrnc)**: Biblioteca que permite utilizar as classes utilitárias do Tailwind no React Native para estilização moderna e consistente.
- **WebSockets**: Canal de comunicação duplex para garantir baixa latência na transmissão contínua do áudio.
- **Expo Camera**: Utilizado para acessar a câmera e realizar a leitura de códigos de barras (QR Code) de conexão.
- **Expo Network**: Utilizado para identificar as informações de IP do dispositivo e viabilizar o escaneamento automático da rede.
- **React Native WebView**: Utilizado sob o capô (`HiddenRecorder`) para gerenciar a captação estável de áudio através de Web Audio API, otimizando o consumo de bateria e evitando as restrições nativas em background.
- **[Biome](https://biomejs.dev/)**: Ferramenta rápida de linting e formatação de código usada para garantir consistência e qualidade no projeto.

---

## Compatibilidade de Dispositivos

De acordo com o **Expo SDK 56.0.0** e o **React Native 0.85**, os requisitos mínimos de sistema operacional suportados são:

| Plataforma | Versão Mínima Suportada | Nível de API / Detalhes |
| :--- | :--- | :--- |
| **Android** | Android 7.0 (Nougat) ou superior | API Level 24+ (`compileSdkVersion` 36 / `targetSdkVersion` 36) |
| **iOS** | iOS 16.4 ou superior | Compilação com Xcode 26.4+ |
| **Web** | Navegadores modernos | Suporte a WebSockets e Web Audio API |

---

## Como Rodar o Projeto

### Pré-requisitos
Certifique-se de ter o **Node.js** e o **npm** (ou **yarn**) instalados em sua máquina, além do aplicativo **Expo Go** instalado no seu celular (disponível na Google Play Store e Apple App Store) se for testar no modo de desenvolvimento.

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Iniciar o servidor do Expo**:
   ```bash
   npm run start
   ```

3. **Conectar ao celular**:
   - Abra o aplicativo **Expo Go** no seu celular e escaneie o QR Code gerado no terminal.
   - Certifique-se de que o celular e o computador rodando o servidor do receptor de áudio estejam conectados à **mesma rede local (Wi-Fi)**.
