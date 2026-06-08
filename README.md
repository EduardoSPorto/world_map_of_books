# Atlas of Books - Explorador de Mapas de Idiomas

Uma aplicação web interativa desenvolvida em React + Vite que permite aos usuários pesquisar livros e visualizar, em um mapa-múndi dinâmico, os países soberanos associados aos idiomas da obra selecionada.

Esta aplicação consome as seguintes APIs:

1. **Open Library API** para resultados ricos de busca de livros.
2. **REST Countries API** para a correlação entre idioma e país.
3. **Leaflet & React Leaflet** para visualizações geoespaciais com estilos de camadas personalizados.

---

Utilizei a IDE recomendada Antigravity, inicialmente com o Gemini 3.5, mas depois mudei para o Claude Sonnet 4.6 para corrigir um problema com o foco do projeto.

O processo foi simples: escrevi uma descrição do que eu queria baseada estritamente nas orientações do professor e, em seguida, pedi ao modelo que fizesse um plano e pensasse detalhadamente sobre como implementá-lo.

Após revisar a proposta, li algumas das perguntas que o modelo/agente levantou e corrigi alguns conceitos.

Em seguida, pedi ao modelo que construísse a solução passo a passo; isso não foi seguido à risca, mas a configuração padrão da IDE força o modelo a solicitar autorização para as ações que pode executar, o que me ajudou a entender o que estava acontecendo.

Testei a versão, que estava tecnicamente completa; no entanto, continha um erro conceitual: o projeto listava todas as traduções do livro em vez de focar no idioma original. Esse comportamento estava visível no *prompt* que eu havia fornecido e poderia ter sido evitado com uma revisão mais cuidadosa.

Solicitei então um segundo plano focado no idioma original do livro, mantendo a listagem acidental de traduções como uma funcionalidade secundária.

Essa segunda versão ficou muito próxima do que eu esperava.

Todo o uso do modelo foi feito em inglês.

A cota de uso do modelo foi totalmente consumida, e um tempo de espera (*cooldown*) foi aplicado quase imediatamente após a conclusão do código.

---

## 🚀 Instruções de Execução

Para rodar a aplicação localmente na sua máquina, execute os seguintes comandos no diretório do projeto:

1. **Instalar dependências:**
```bash
npm install

```


2. **Iniciar o servidor de desenvolvimento:**
```bash
npm run dev

```


3. **Abrir a aplicação:**
Navegue até o endereço local exibido no terminal (geralmente `http://localhost:5173`).

---

## 🛠️ Decisões de Design e Arquitetura

### 1. Estruturação do Projeto e Segurança

O projeto foi inicializado usando o *scaffolding* do `vite` com o template `react` (JavaScript). Para preservar os arquivos existentes do repositório git (diretório `.git`, etc.), o ambiente inicial foi criado em um diretório temporário e movido com segurança para a raiz da área de trabalho.

### 2. Tradução de Códigos de Idioma (Ponte de APIs)

As buscas na Open Library retornam códigos bibliográficos de idioma com 3 letras, em conformidade com a ISO 639-2/B (ex: `fre` para francês, `ger` para alemão, `chi` para chinês, `rum` para romeno). No entanto, o endpoint de busca de idiomas da REST Countries API (`/lang/{lang}`) espera códigos na terminologia padrão ISO 639-3 (ex: `fra` para francês, `deu` para alemão, `zho` para chinês, `ron` para romeno).

* **Solução:** Um mapeador de dicionário explícito `LANGUAGE_CODE_MAP` foi implementado em `src/services/api.js` para converter automaticamente os códigos bibliográficos em consultas de terminologia padrão, garantindo alta precisão nas requisições e prevenindo erros de resposta 404.

### 3. Assets Padrão do Leaflet e Marcadores Personalizados

O empacotamento padrão de assets do Vite aplica *hashes* nos arquivos de imagem originais, o que frequentemente quebra os ícones de marcadores padrão do Leaflet, resultando em erros vazios no console ou marcadores invisíveis.

* **Solução:** Ignoramos completamente a renderização de ícones padrão e implementamos marcadores HTML pulsantes e personalizados (`L.divIcon`) em `src/components/BookMap.jsx`. Esses marcadores incorporam a bandeira do respectivo país diretamente dentro de um pino de mapa circular brilhante, melhorando drasticamente a integração com o tema e a estética da visualização.

### 4. Controle Dinâmico de Zoom do Mapa (Fit Bounds Controller)

Quando um idioma de livro é selecionado, a lista de países que o falam pode variar de um único país até dezenas (ex: espanhol, inglês). Como o contêiner de mapa padrão do Leaflet não se recentraliza reativamente quando as listas de coordenadas dos marcadores filhos sofrem mutação:

* **Solução:** Construímos um subcomponente `MapController` que se conecta ao contexto do mapa usando `useMap()`. Ao ocorrer mudanças de estado na lista de países ativos, ele calcula as coordenadas da caixa delimitadora (*bounding box*) via `L.latLngBounds()` e aciona uma transição suave com `.fitBounds()` para focar automaticamente a janela de visualização do mapa.

### 5. Interface Escura Premium e Tema *Glassmorphism*

A aplicação evita cores básicas e templates de estilo em favor de um layout de *dashboard* escuro e elegante:

* **Layout com Painel Lateral:** Permite que os usuários visualizem os campos de pesquisa e as informações detalhadas do livro à esquerda, mantendo o mapa visível à direita. Em telas de dispositivos móveis/formato retrato, o layout é empilhado verticalmente.
* **CartoDB Dark Matter:** Utiliza camadas de *tiles* com tema escuro para combinar com o visual premium *dark theme*.
* **Estados Visuais e *Skeletons*:** Foram implementados *skeletons* personalizados (`SkeletonList`) para evitar mudanças estruturais no layout durante as consultas, juntamente com ilustrações claras e amigáveis para resultados de buscas vazias, exibição de capas indisponíveis e erros de rede/offline.
