# 2. Especificação do Projeto

As personas foram criadas para representar os usuários típicos que interagem com o serviço de achados e perdidos na universidade. Cada persona sintetiza características, comportamentos, dores e necessidades específicas, oferecendo uma visão clara dos diferentes públicos que devem ser contemplados no projeto.

## 2.1. Personas

| Persona                                                                                                                                                                                                                                                               | Detalhes                                                                                                                                                                                                                                                                                                                                                                                                                 |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Laura Mendes, 20 anos**<br>_Hobby:_ Pinturas de quadros<br>_Trabalho:_ Aluna<br>_Personalidade:_ Comunicativa, ansiosa, distraída com frequência. Muito conectada com colegas via redes sociais.<br>_Sonhos:_ Se formar e abrir sua clínica de psicologia infantil. | **Objetos e lugares:** Fone bluetooth, celular, garrafa térmica, livros; usa muito WhatsApp, Instagram e o app da PUC. Está sempre entre salas, biblioteca e jardim.<br>**Objetivos chave:** Localizar objetos perdidos de forma rápida e fácil, sem precisar ir até a secretaria.<br>**Como devemos tratá-la:** Com empatia, agilidade e boa comunicação visual. Informações claras e diretas funcionam melhor com ela. |
| **Marcelo Cunha, 45 anos**<br>_Hobby:_ Ler<br>_Trabalho:_ Professor<br>_Personalidade:_ Prático, metódico, gosta de soluções tecnológicas.<br>_Sonhos:_ Prático, metódico, gosta de soluções tecnológicas.                                                            | **Objetos e lugares:** Notebook, data show, quadro digital. Usa o sistema interno da PUC. Circula entre salas e auditórios.<br>**Objetivos chave:** Ajudar os alunos devolvendo os objetos achados com eficiência.<br>**Como devemos tratá-lo:** Com clareza, rapidez e organização. Comunicação profissional e lógica.                                                                                                  |
| **Denise Carvalho, 38 anos**<br>_Trabalho:_ Funcionária da PUC<br>_Personalidade:_ Atenciosa, prática, organizada. Valoriza a ordem.<br>_Sonhos:_ Evoluir na carreira administrativa com reconhecimento e eficiência.                                                 | **Objetos e lugares:** Computador fixo, sistema da PUC, telefone e WhatsApp. Atua na recepção/secretaria.<br>**Objetivos chave:** Gerenciar com eficiência os objetos encontrados. Reduzir o retrabalho.<br>**Como devemos tratá-la:** Com respeito, oferecendo soluções práticas e suporte confiável.                                                                                                                   |
| **João Ribeiro, 33 anos**<br>_Trabalho:_ Palestrante, Ex Aluno<br>_Personalidade:_ Simples, simpático, direto. Valoriza soluções práticas.<br>_Sonhos:_ Inspirar pessoas por meio de projetos sociais e palestras.                                                    | **Objetos e lugares:** Notebook, mochila, celular. Vai à faculdade para eventos ou mentorias.<br>**Objetivos chave:** Localizar rapidamente algo que perdeu durante uma visita.<br>**Como devemos tratá-lo:** Com acolhimento, praticidade e comunicação clara. Evitar burocracia.                                                                                                                                       |

## 2.2. Histórias de Usuário

As histórias de usuários foram desenvolvidas a partir da análise das entrevistas e observações realizadas com membros da comunidade acadêmica. Elas descrevem de forma prática as necessidades e motivações dos diferentes perfis que utilizarão o sistema, orientando o desenvolvimento de funcionalidades que proporcionem uma experiência de uso simples, eficiente e adequada ao contexto universitário.

| Usuário             | História                                                                                                                                                                                                                                                 |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Laura Mendes**    | Eu, como usuária que perdi um item, quero receber notificações automáticas e ver fotos dos objetos encontrados em uma interface.                                                                                                                         |
| **Marcelo Cunha**   | Eu, como professor que frequentemente encontra objetos perdidos pelos alunos, quero registrar facilmente os objetos achados em um sistema funcional e direto, para poder ajudar os alunos a recuperar seus itens com mais eficiência e sem complicações. |
| **Denise Carvalho** | Eu, como funcionária, gostaria de visualizar e atualizar facilmente as informações sobre os itens cadastrados que estão em nossa posse, para acompanhar o andamento dos casos e prestar um atendimento mais organizado e eficiente.                      |
| **João Ribeiro**    | Eu, como visitante eventual da faculdade, quero poder publicar que perdi um item mesmo sem ter acesso ao sistema da PUC, para aumentar as chances de alguém que tenha encontrado entrar em contato comigo e facilitar a devolução.                       |
| **Gustavo Lima**    | Eu, como aluno que costuma ver objetos esquecidos por colegas, quero poder registrar rapidamente um item encontrado, mesmo sem saber de quem é, para aumentar as chances do dono localizar o objeto e evitar que ele se perca definitivamente.           |
| **Renata Borges**   | Eu, como aluna, quero poder visualizar quais itens já foram recuperados e por quem, para ter mais segurança de que o objeto foi devolvido à pessoa certa e evitar que alguém mal-intencionado pegue algo que não é seu.                                  |

## 2.3. Requisitos

Com base nas necessidades identificadas nas entrevistas e na análise das personas, foram definidos os requisitos do projeto, divididos em funcionais, não funcionais e restrições.

### Requisitos Funcionais

| ID   | Descrição                                                                                                              | Prioridade |
| :--- | :--------------------------------------------------------------------------------------------------------------------- | :--------- |
| RF01 | O sistema deve permitir o cadastro de itens encontrados, com campos como: nome do item, descrição, local, data e foto. | Alta       |
| RF02 | O sistema deve permitir o cadastro de itens perdidos, com campos semelhantes aos do item encontrado.                   | Alta       |
| RF03 | O sistema deve permitir a busca por itens cadastrados, por meio de filtros como nome, data, local ou categoria.        | Alta       |
| RF04 | O sistema deve notificar o usuário caso algum item semelhante ao que ele perdeu for encontrado.                        | Alta       |
| RF05 | O sistema deve permitir o upload de imagens dos itens para facilitar identificação visual.                             | Média      |
| RF06 | O sistema deve ter uma seção com os últimos itens encontrados, em ordem cronológica.                                   | Alta       |
| RF07 | O sistema deve armazenar o histórico de movimentação/status dos itens cadastrados.                                     | Baixa      |
| RF08 | O sistema deve permitir a atualização do status de um item.                                                            | Média      |
| RF09 | O sistema deve exibir um painel com os itens já recuperados, com informações básicas (sem dados sensíveis).            | Média      |
| RF10 | O sistema deve gerar relatórios com estatísticas de itens cadastrados, devolvidos e pendentes.                         | Baixa      |
| RF11 | O sistema deve permitir a sinalização de itens que foram entregues a pessoas incorretas (abuso ou erro).               | Alta       |

### Requisitos não funcionais

| ID    | Descrição                                                                                                                                                                                             | Prioridade |
| :---- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------- |
| RNF01 | O sistema deve ter uma interface intuitiva, responsiva e acessível, facilitando o uso por alunos, professores, funcionários e visitantes, independentemente do nível de familiaridade com tecnologia. | Alta       |
| RNF02 | Em casos como cartões ou identidades, a exibição deve ser limitada a uma descrição genérica.                                                                                                          | Alta       |

### Restrições do Projeto

| ID   | Descrição                                                                                                                                  |
| :--- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| RP01 | O sistema deve limitar a criação repetitiva de itens semelhantes por um mesmo usuário em um curto período, a fim de evitar o uso indevido. |
| RP02 | O sistema não deve ser integrado aos sistemas da PUC, somente ao fluxo interno da universidade.                                            |
| RP03 | O sistema não deve aceitar cadastro de itens achados/perdidos fora das dependências da PUC.                                                |
