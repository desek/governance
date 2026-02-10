---
name: llms-txt-prompt
description: Instructions for creating an llms.txt file for LLM-friendly documentation structure.
metadata:
  copyright: Copyright Daniel Grenemark 2026
  version: "0.0.1"
---

Create an llms.txt file for the documentation in the `docs/` folder.

<context>
The llms.txt format is a standardized way to provide documentation structure for LLM consumption. It uses markdown with a hierarchical structure of headers and bullet-point links.
</context>

<reference_examples>
Use these existing llms.txt files as style and format references:
- @docs/llms-txt/fasthtml-llms.txt
</reference_examples>

<instructions>
1. Read all markdown files in `docs/` to understand the content (include files even if `docs/` is in .gitignore)
2. Create a new file at `docs/llms.txt`
3. Structure the llms.txt with:
   - A title header describing the documentation
   - A brief description of what the docs covers
   - Organized sections grouping related documents
   - Bullet-point links to each document with concise descriptions
4. Follow the format pattern from the reference examples:
   - Use `# Title` for the main header
   - Use `## Section` for groupings
   - Use `- [Document Name](path): Description` for links
</instructions>

<output_format>
The resulting llms.txt should be:
- Concise but informative
- Well-organized by topic
- Include brief descriptions for each linked document
- Use relative paths for file links
</output_format>