# As Torres · API mobile

Cópia independente do backend dedicada ao gerenciamento de personagens. Mantém Next.js, MongoDB Atlas, validação Zod e o contrato de fichas usado pelo site. Autores: **Enzo Schiavo e Giovanni Toccoli Bassetti**.

Se configurar o mesmo banco do projeto web, as contas e fichas serão compartilhadas: alterações feitas no celular também aparecem no site. Para uma cópia isolada, use outro `MONGODB_DB`; nesse caso, cadastre uma conta pelo aplicativo. As credenciais do Atlas nunca devem entrar no frontend.

## Rotas disponíveis

| Método | Rota | Finalidade |
| --- | --- | --- |
| POST | `/api/auth/register` | Cadastro com `email` e `password` (mínimo de 10 caracteres) |
| POST | `/api/auth/login` | Login; retorna `token` e `expires` |
| POST | `/api/auth/logout` | Revoga a sessão |
| GET | `/api/agents` | Lista os personagens próprios; aceita `q` e `before`, até 100 por página |
| POST | `/api/agents` | Cria personagem |
| GET | `/api/agents/:id` | Consulta personagem próprio |
| PUT | `/api/agents/:id` | Substitui os dados completos da ficha |
| DELETE | `/api/agents/:id` | Exclui personagem próprio |

Cadastro e login são públicos. As outras rotas exigem `Authorization: Bearer TOKEN`. A sessão expira em 24 horas. POST e PUT recebem o conteúdo de `data`, conforme `examples/agent.json`.

Apenas autenticação e personagens são expostos; as rotas de campanhas, ameaças e homebrew retornam 404. `records` mantém `kind: agents`, `owner` e `data`. Os vínculos de inventário existentes são validados e preservados. Um personagem ainda vinculado a uma campanha no banco compartilhado não pode ser excluído (409); remova o vínculo pelo sistema web primeiro.