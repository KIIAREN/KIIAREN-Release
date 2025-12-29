# Third-Party Code Attribution

This project uses code and concepts from the following open-source projects:

## Excalidraw

**Source:** https://github.com/excalidraw/excalidraw
**License:** MIT License
**Copyright:** Copyright (c) 2020 Excalidraw
**Usage:** The KIIAREN platform integrates Excalidraw via the published npm package `@excalidraw/excalidraw` for whiteboard functionality.

**MIT License Text:**
```
MIT License

Copyright (c) 2020 Excalidraw

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Notion Clone (Zotion)

**Source:** https://github.com/adityaphasu/notion-clone
**Author:** Aditya Phasu (via CodewithAntonio tutorial)
**License:** Not specified (tutorial project)
**Usage:** The KIIAREN docs feature was inspired by this Notion clone implementation. We extracted the concept of using BlockNote editor for document editing but did not copy source code. Instead, we:
- Installed BlockNote packages directly (`@blocknote/core`, `@blocknote/react`, `@blocknote/mantine`)
- Implemented our own document management using Convex backend
- Adapted the UI design to match KIIAREN's monochrome aesthetic

**Acknowledgment:**
Thanks to CodewithAntonio for the educational tutorial that inspired the document editing feature architecture.

---

## BlockNote

**Source:** https://github.com/TypeCellOS/BlockNote
**License:** MPL-2.0 (Mozilla Public License 2.0)
**Usage:** KIIAREN uses BlockNote editor (`@blocknote/core`, `@blocknote/react`, `@blocknote/mantine`) as the rich text editor for the Docs feature.

---

## Convex

**Source:** https://convex.dev
**License:** Commercial/Proprietary (SaaS)
**Usage:** KIIAREN uses Convex as the backend database and real-time synchronization layer.

---

## Other Dependencies

For a complete list of all npm dependencies and their licenses, run:
```bash
npm list --all
```

Or check `package-lock.json` in the repository root and workspace directories.
