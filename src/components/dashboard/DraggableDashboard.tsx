import { useState, useCallback, useEffect, useRef, ReactNode } from "react";
import GridLayout, { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { GripVertical, RotateCcw, LayoutDashboard, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePersonalization } from "@/contexts/PersonalizationContext";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/* ─── Types ─── */
export interface DashboardCardDef {
  id: string;
  defaultLayout: { x: number; y: number; w: number; h: number; minW?: number; minH?: number };
  content: ReactNode;
}

interface DraggableDashboardProps {
  cards: DashboardCardDef[];
  /** externally controlled edit mode */
  editMode: boolean;
  onEditModeChange: (v: boolean) => void;
}

/* ─── Helpers ─── */
function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

const DEBOUNCE_MS = 800;

/* ─── Component ─── */
export function DraggableDashboard({ cards, editMode, onEditModeChange }: DraggableDashboardProps) {
  const { dashboardLayout, setDashboardLayout, resetDashboardLayout } = usePersonalization();
  const { toast } = useToast();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(windowWidth);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Measure actual container width */
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  /* Build active layout: saved → default */
  const buildDefaultLayout = useCallback((): Layout[] => {
    return cards.map(c => ({
      i: c.id,
      x: c.defaultLayout.x,
      y: c.defaultLayout.y,
      w: c.defaultLayout.w,
      h: c.defaultLayout.h,
      minW: c.defaultLayout.minW ?? 2,
      minH: c.defaultLayout.minH ?? 1,
    }));
  }, [cards]);

  const [layout, setLayout] = useState<Layout[]>(() => {
    if (dashboardLayout && dashboardLayout.length > 0) {
      // Merge saved with defaults — skip any saved id no longer in cards
      const cardIds = cards.map(c => c.id);
      const validSaved = dashboardLayout.filter(l => cardIds.includes(l.i));
      const savedIds = validSaved.map(l => l.i);
      const newCards = cards
        .filter(c => !savedIds.includes(c.id))
        .map(c => ({ i: c.id, ...c.defaultLayout, minW: c.defaultLayout.minW ?? 2, minH: c.defaultLayout.minH ?? 1 }));
      return [...validSaved, ...newCards];
    }
    return buildDefaultLayout();
  });

  /* Sync when PersonalizationContext changes (e.g. on user switch) */
  useEffect(() => {
    if (!dashboardLayout || dashboardLayout.length === 0) {
      setLayout(buildDefaultLayout());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardLayout]);

  /* Debounced save */
  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    setLayout(newLayout);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDashboardLayout(newLayout.map(({ i, x, y, w, h }) => ({ i, x, y, w, h })));
    }, DEBOUNCE_MS);
  }, [setDashboardLayout]);

  /* Exit edit mode — show toast */
  const handleExitEdit = useCallback(() => {
    onEditModeChange(false);
    toast({
      title: "Layout saved ✓",
      description: "Your dashboard arrangement has been saved.",
      duration: 2000,
    });
  }, [onEditModeChange, toast]);

  /* Reset */
  const handleReset = useCallback(() => {
    resetDashboardLayout();
    setLayout(buildDefaultLayout());
    setResetDialogOpen(false);
    toast({ title: "Layout reset", description: "Default layout restored.", duration: 2000 });
  }, [resetDashboardLayout, buildDefaultLayout, toast]);

  const isDraggable = editMode && !isMobile;
  const isResizable = false; // resize disabled — drag-only

  /* Card lookup map */
  const cardMap = Object.fromEntries(cards.map(c => [c.id, c]));

  return (
    <div className={`relative transition-all duration-300 ${editMode ? "edit-mode edit-mode-bg rounded-xl p-2" : ""}`}>

      {/* Edit mode banner */}
      {editMode && (
        <div className="mb-3 flex items-center justify-between gap-3 bg-primary/8 border border-primary/20 rounded-xl px-4 py-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5 text-sm text-primary font-medium">
            <GripVertical className="h-4 w-4 animate-pulse" />
            <span>Drag to rearrange cards · Changes save automatically</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs border-rose-300 text-rose-600 hover:bg-rose-50 gap-1.5"
              onClick={() => setResetDialogOpen(true)}
            >
              <RotateCcw className="h-3 w-3" />
              Reset to Default
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs gap-1.5 bg-primary text-white hover:brightness-110"
              onClick={handleExitEdit}
            >
              <CheckCircle className="h-3 w-3" />
              Done
            </Button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div ref={containerRef}>
        {isMobile ? (
          <div className="flex flex-col gap-4 pb-4">
            {[...layout]
              .sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x)
              .map(l => {
                const card = cardMap[l.i];
                if (!card) return null;
                return (
                  <div key={l.i} className="w-full">
                    {card.content}
                  </div>
                );
              })}
          </div>
        ) : (
          containerWidth > 0 && (
            <GridLayout
              className="layout"
              layout={layout}
              cols={12}
              rowHeight={140}
              width={containerWidth}
              margin={[16, 16]}
              containerPadding={[0, 0]}
              compactType="vertical"
              preventCollision={false}
              isDraggable={isDraggable}
              isResizable={isResizable}
              draggableHandle=".drag-handle"
              onLayoutChange={handleLayoutChange}
            >
              {layout.map(l => {
                const card = cardMap[l.i];
                if (!card) return null;
                return (
                  <div key={l.i} className="card-wrapper relative group">
                    {/* Drag handle — only rendered in edit mode */}
                    {editMode && (
                      <div className="drag-handle" title="Drag to reorder">
                        <GripVertical className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div className="h-full w-full overflow-hidden">
                      {card.content}
                    </div>
                  </div>
                );
              })}
            </GridLayout>
          )
        )}
      </div>

      {/* Reset confirmation dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset dashboard layout?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the default arrangement for your role. Your current customization will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={handleReset}
            >
              Reset Layout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ─── Standalone toggle button for dashboard header ─── */
export function CustomizeLayoutButton({ editMode, onToggle }: { editMode: boolean; onToggle: () => void }) {
  return (
    <Button
      variant={editMode ? "default" : "outline"}
      size="sm"
      className={`hidden md:flex gap-1.5 text-xs h-8 transition-all ${editMode ? "bg-primary text-white shadow-md" : ""}`}
      onClick={onToggle}
    >
      <LayoutDashboard className="h-3.5 w-3.5" />
      {editMode ? "Editing Layout..." : "Customize Layout"}
    </Button>
  );
}
