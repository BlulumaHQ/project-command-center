<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Keep authenticated dashboard data in the browser-only Query hooks in the data store; external RLS enforces access and no server loader should query this client.
- Use client-only route guards and a single root auth subscriber for the external Auth session; clear private Query caches on sign-out.

- Keep task-view grouping and recent-activity ranking in browser-safe data helpers; the shared store exposes results so views and tests use identical rules.

## HQ house rules (Sony)

- No new tabs. New features go into an existing page or into the 晨報 (`hq-morning` edge function).
- New skill / automation = one `pcc_agents` row (fun `name`, `name_zh`, `avatar`, `department_id`). New department = one `pcc_departments` row with `duty`, `schedule`, `output`, `escalate` filled (部門說明卡). The 團隊 office animation draws a room per department and a desk per agent from these rows, so nothing else needs editing. New avatar ids get art in `RobotAvatar.tsx` + a body colour in `AgentOffice.tsx` `BODY`.
- Only items on the shared 叫醒老闆清單 (`pcc_meta` key `escalation`) may push-notify Sony; everything else waits for the 晨報.
- Leads live in `pcc_leads` (業務部, hourly scheduled task). Client emails from Sony's own brands are Gmail drafts only — never sent automatically.
