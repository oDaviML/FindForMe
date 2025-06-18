# 4. Metodologia

## 4.1. Organização

A equipe foi estruturada para garantir a divisão equilibrada de funções, promovendo colaboração contínua e eficiência no desenvolvimento do projeto de achados e perdidos. A organização dos papéis ficou definida da seguinte forma:

- **Scrum Master:** Eduardo Braga Bonfim
- **Product Owner:** Samuel Ribeiro Simonetti
- **Equipe de Desenvolvimento:**
  - André Nicolas Ferreira Neri
  - Davi Martins Lage
  - Eduardo Augusto da Costa Cezar
  - Lucas Gomes Lisboa

Cada membro é também responsável por manter atualizado o quadro de tarefas (Kanban), realizar revisões de código no repositório GitHub e participar ativamente das reuniões ágeis do projeto.

## 4.2. Controle de Tarefas

A equipe adota práticas ágeis para a organização das tarefas, utilizando o método Kanban como forma de visualizar o progresso e promover a gestão contínua do trabalho. O quadro de tarefas está organizado da seguinte forma:

- **Backlog:** Lista geral de todas as tarefas levantadas durante o projeto, ainda sem prioridade definida para execução imediata.
- **A Fazer:** Tarefas priorizadas para o próximo ciclo de desenvolvimento.
- **Em Andamento:** Tarefas que estão sendo desenvolvidas no momento.
- **Revisão de Código:** Tarefas concluídas, mas aguardam a validação e aprovação de código por outro membro da equipe.
- **Concluído:** Tarefas totalmente finalizadas, aprovadas e entregues.

![Quadro Trello](./images/Quadro%20trello.png)
_Figura: Tela do quadro no Trello_

## 4.3. Gerenciamento do Código-fonte

O gerenciamento do código-fonte será realizado através do GitHub, adotando o modelo de fluxo de trabalho conhecido como GitHub Flow. Trata-se de uma abordagem leve e contínua de versionamento, adequada para equipes que buscam agilidade e integração frequente de novas funcionalidades.

O fluxo ocorrerá da seguinte maneira:

- Toda nova funcionalidade, correção ou melhoria será desenvolvida em uma branch criada a partir da `main`.
- As branches seguirão o padrão de nomenclatura clara: `feature/nome-da-funcionalidade`, `fix/nome-do-bug`, ou `hotfix/nome-do-ajuste`.
- Após o desenvolvimento, será aberto um Pull Request (PR) para revisão de código.
- A funcionalidade será revisada por pelo menos um outro membro da equipe antes de ser mesclada na `main`.
- A branch `main` conterá sempre uma versão funcional e pronta para produção.

## 4.4. Relação de Ambientes de Trabalho

| Ambiente                    | Plataforma | Link de Acesso                                                                                                                                                                                                                         |
| :-------------------------- | :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repositório de código-fonte | Github     | [https://github.com/oDaviML/FindForMe](https://github.com/oDaviML/FindForMe)                                                                                                                                                           |
| Kanban                      | Trello     | [https://trello.com/b/SvYM6KQg](https://trello.com/b/SvYM6KQg)                                                                                                                                                                         |
| Interfaces                  | Figma      | [https://www.figma.com/design/wZEecyreVDyH4Vut5tU12J/Projeto-de-interfaces---TIAW?node-id=0-1&t=qQ5BQklY08MEwD30-1](https://www.figma.com/design/wZEecyreVDyH4Vut5tU12J/Projeto-de-interfaces---TIAW?node-id=0-1&t=qQ5BQklY08MEwD30-1) |
