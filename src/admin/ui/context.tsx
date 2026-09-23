import React, { createContext, useContext } from 'react';

/**
 * Whether the person looking at a section may change it. Every field reads
 * this, so a section opened by a Viewer shows its values with the inputs
 * switched off, without each field being told separately.
 */
const EditContext = createContext(true);

export function EditScope({ canEdit, children }: { canEdit: boolean; children: React.ReactNode }) {
  return <EditContext.Provider value={canEdit}>{children}</EditContext.Provider>;
}

export function useCanEdit(): boolean {
  return useContext(EditContext);
}

/** The width the content area has, measured by the shell. */
const WidthContext = createContext(360);

export function ContentWidth({ width, children }: { width: number; children: React.ReactNode }) {
  return <WidthContext.Provider value={width}>{children}</WidthContext.Provider>;
}

export function useContentWidth(): number {
  return useContext(WidthContext);
}

/**
 * Where each tool's panel is on the page, so opening a tool from search can
 * scroll straight to it and mark it for a moment.
 */
export type Anchors = {
  register: (id: string, node: React.RefObject<unknown>) => () => void;
  highlighted: string | null;
};

const AnchorContext = createContext<Anchors | null>(null);

export const AnchorProvider = AnchorContext.Provider;

export function useAnchors(): Anchors | null {
  return useContext(AnchorContext);
}

/** How many columns a grid of panels should use at the current width. */
export function useColumns(min = 340, max = 3): number {
  const width = useContentWidth();
  return Math.max(1, Math.min(max, Math.floor(width / min)));
}
