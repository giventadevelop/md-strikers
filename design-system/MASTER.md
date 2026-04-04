# Maryland Strikers — design system (entry point)

The **canonical** persisted output from **ui-ux-pro-max** (`--persist -p "Maryland Strikers"`) lives here:

**[./maryland-strikers/MASTER.md](./maryland-strikers/MASTER.md)**

Use that file as the global source of truth. Page-specific overrides belong in `design-system/pages/<page>.md` (create as needed); they override the master per the skill workflow.

**Regenerate:**

```bash
python .cursor/skills/ui-ux-pro-max/scripts/search.py "sports soccer football club" --design-system --persist -p "Maryland Strikers"
```
