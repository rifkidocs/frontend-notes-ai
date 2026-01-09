import { Node } from 'prosemirror-model';

export interface LineCh {
  line: number;
  ch: number;
}

/**
 * Converts a ProseMirror document position to line/character coordinates.
 * We define a "line" as a textblock node (paragraph, heading, code block, etc.).
 * Nested textblocks are counted in document order (depth-first).
 */
export function getLineChFromPos(doc: Node, pos: number): LineCh {
  let lineIndex = 0;
  let result: LineCh | null = null;

  doc.descendants((node, nodePos) => {
    if (result) return false; // Stop traversal if found

    if (node.isTextblock) {
      // Check if the position is within this node
      // nodePos is the start of the node (before the open tag)
      // node.content.size is the size of the content
      // The content range is [nodePos + 1, nodePos + 1 + node.content.size]
      const start = nodePos + 1;
      const end = start + node.content.size;

      if (pos >= start && pos <= end) {
        result = {
          line: lineIndex,
          ch: pos - start,
        };
        return false;
      }
      lineIndex++;
    }
    return true; // Continue traversal
  });

  return result || { line: 0, ch: 0 };
}

/**
 * Converts line/character coordinates back to a ProseMirror document position.
 */
export function getPosFromLineCh(doc: Node, position: LineCh): number | null {
  let lineIndex = 0;
  let targetPos = 0;
  let found = false;

  doc.descendants((node, nodePos) => {
    if (found) return false;

    if (node.isTextblock) {
      if (lineIndex === position.line) {
        // Calculate position: start of content + ch
        // Clamp ch to node content size to be safe
        const safeCh = Math.min(Math.max(0, position.ch), node.content.size);
        targetPos = nodePos + 1 + safeCh;
        found = true;
        return false;
      }
      lineIndex++;
    }
    return true;
  });

  return found ? targetPos : null;
}
