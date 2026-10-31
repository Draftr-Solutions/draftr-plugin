# Draftr plugin

Connects your coding agent to [Draftr](https://draftr.top), a structured UI design editor. The agent can read your designs, build screens from components and starter blocks, answer comments, wire prototypes and export finished work, while people in the file see it in presence.

The plugin holds no code that runs on your machine. It adds two things:

- the Draftr MCP server at `https://app.draftr.top/mcp`, reached over Streamable HTTP;
- the `design` skill, which tells the agent how to work with Draftr documents safely.

## Before you install

Create a token at [app.draftr.top](https://app.draftr.top) under **Account settings**, **Agent access tokens**. Choose **Read documents**, or **Read and edit documents** if the agent should change designs. A token acts within your own document permissions, expires in 7 to 90 days and can be revoked in the same dialog.

## Claude Code

```bash
claude plugin marketplace add Draftr-Solutions/draftr-plugin
```

```bash
claude plugin install draftr@draftr
```

Then open Claude Code, run `/plugin configure draftr@draftr` and paste the token. Claude Code keeps it in the system credential store, not in `settings.json`. Ask for your Draftr designs, or run `/draftr:design`.

## Codex

```bash
codex plugin marketplace add Draftr-Solutions/draftr-plugin
```

```bash
codex plugin add draftr@draftr
```

Codex reads the token from the `DRAFTR_TOKEN` environment variable, so set it where Codex starts, for example in your shell profile or a secret manager:

```bash
export DRAFTR_TOKEN="<your token>"
```

Check the connection with `codex mcp list`, restart Codex and ask for your Draftr designs. Draftr marks `apply_commands` as destructive, so Codex needs your approval to edit a design: `codex exec` cannot ask and cancels those calls, so edit from an interactive session.

## What leaves your machine

Tool calls, with the design content and uploaded files they carry, go to `app.draftr.top` together with your token. The plugin sends nothing anywhere else and has no hooks or scripts. Draftr records which tools a token calls, as its [privacy policy](https://draftr.top/privacy) describes. See also the [terms](https://draftr.top/terms).

## Troubleshooting

- **The Draftr tools are missing:** the token is not set. Claude Code does not start the server until `/plugin configure` has it; in Codex, check `DRAFTR_TOKEN`.
- **401 Unauthorized:** the token is wrong, expired or revoked. Create a new one.
- **403 INSUFFICIENT_SCOPE:** the token is read-only. Create one with **Read and edit documents**.

Support: [support@draftr.top](mailto:support@draftr.top).
