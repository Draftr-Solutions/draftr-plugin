---
name: design
description: Required workflow for the Draftr MCP tools. Load this skill before the first Draftr tool call of a task, even a simple one, whenever the user asks to create, change, review, prototype or export a design in Draftr, shares an app.draftr.top link, or asks about comments on a design. Edits made without it skip the agent task that shows people what you are doing.
---

# Working in Draftr

Draftr documents are structured: pages hold frames and layers with stable IDs. People may be in the same file while you work, and they see you in presence.

## Before you start

The Draftr tools come from the plugin's `draftr` MCP server, and the user signs in through the browser. If they are missing or fail with `401`, the user is not signed in, or disconnected this application. Then:

- Claude Code: run `/mcp`, choose `draftr` and sign in.
- Codex: run `codex mcp login draftr`, or select Authenticate in the desktop app.

Never ask the user to paste a token or a password into the chat, and never write one to a file.

`403 INSUFFICIENT_SCOPE` means this connection is read-only: say so and ask the user to connect again and allow editing. Quota errors mean the account's daily limit of agent calls is reached: stop and tell the user.

## Find the design

1. `list_documents` shows recent designs. A link such as `https://app.draftr.top/editor?document=<id>` holds the ID.
2. `get_document` returns the pages, tokens, styles and current `revision`. Large files are heavy: for one area prefer `find_nodes` and `read_nodes`, or `get_design_context` for a selection. All of them take the `pageId` they look at.
3. `get_design_screenshot` shows what the page really looks like. Look at it before you change anything. It needs `documentId` and `pageId`, and takes an optional `region`.

## Change the design

1. Call `start_agent_task` with `documentId`, a new `operationId`, `baseRevision`, a short `title` and the `task`. Keep the returned `taskId`.
2. Call `apply_commands` with `documentId`, `taskId`, `baseRevision`, a new unique `operationId` and `commands`. A batch is atomic. Use the revision from the last response for the next batch.
3. Check with `get_design_screenshot` after each visible step and fix what you see. `read_nodes` gives computed bounds.
4. Call `complete_agent_task` with `outcome` `completed` or `failed`, a one-line `result` and a new `operationId`, so people stop seeing you in presence.

A top-level frame takes `pageId`. Create each child with a command of its own, with the frame as `parentId`, no `pageId` and empty `children`:

```json
[
  {
    "type": "node.create",
    "pageId": "<page id>",
    "node": {
      "id": "card",
      "type": "frame",
      "name": "Card",
      "parentId": null,
      "x": 0,
      "y": 0,
      "width": 390,
      "height": 200,
      "fill": "#111111",
      "opacity": 1,
      "visible": true,
      "locked": false,
      "children": []
    }
  },
  {
    "type": "node.create",
    "node": {
      "id": "card-title",
      "type": "text",
      "name": "Title",
      "parentId": "card",
      "x": 24,
      "y": 24,
      "width": 342,
      "height": 32,
      "fill": "#ffffff",
      "opacity": 1,
      "visible": true,
      "locked": false,
      "children": [],
      "text": "Hello",
      "fontSize": 24,
      "fontAssetId": null
    }
  }
]
```

Retry after a network failure only with the same `operationId` and the same request. On `REVISION_CONFLICT` someone changed the same layers: read them again and decide again, do not force your version. `undo_agent_task` reverts a whole task as one action.

If a Draftr tool call is refused or cancelled, stop and tell the user: the client may be waiting for their approval of that tool. Do not reach the design another way, such as through a browser.

Ask before you delete a page or layers you did not create, or before you restyle the whole file.

## Build fast and stay editable

- Start pages from blocks: `list_blocks`, then `insert_block`. Stack them in a column auto-layout frame and edit copy, images and tokens.
- Use `search_icons` and `insert_icon` for icons and `import_svg` for SVG files. Do not draw icons point by point.
- Use `list_fonts` for the 34 built-in families. Upload a font only when nothing is close.
- Use components, variants and properties for repeats, collections for data lists, and tokens and styles instead of raw values.
- Use auto layout, not absolute positions, for anything that should reflow. Give desktop screens breakpoints.
- Mark missing photos with `placeholder`. Never fake a photo with flat shapes.

## Other jobs

- Comments: `list_comments`, change the design, `reply_comment` with what you changed, then `resolve_comment`.
- Prototypes: `get_prototype`, `update_prototype`, and `get_prototype_frame` to check a screen at a moment.
- Matching a reference: `upload_document_asset`, set the frame `reference`, then `compare_with_reference` after each round and work on its `worstRegions`.
- Delivery: `export_design` writes PNG, SVG or PDF.

## Full rules

The editing rules are long and clients may cut server instructions short. Before you use a feature for the first time in a task, read its entry in [references/editing-rules.md](references/editing-rules.md): search that file for the feature's name, such as `Masks`, `Components`, `Grid frames`, `Text`, `Breakpoints` or `Motion`, instead of guessing the command format.
