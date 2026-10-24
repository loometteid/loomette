"use client";

import {
  type Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Konva from "konva";
import { Typography } from "@/components/ui/typography";
import { ITEM_SIZE_RATIO } from "@/domains/outfit/components/outfit-composition";
import type { CanvasItem, WardrobeOption } from "../types";

export type KonvaCanvasHandle = {
  addItem: (
    option: WardrobeOption,
    x?: number,
    y?: number,
    scale?: number,
  ) => void;
  deleteSelected: () => void;
  moveLayer: (direction: "up" | "down") => void;
  shuffle: (
    items: Array<{
      option: WardrobeOption;
      x: number;
      y: number;
      scale?: number;
    }>,
  ) => void;
  getItems: () => CanvasItem[];
  getSelectedId: () => string | null;
  clear: () => void;
};

export type KonvaCanvasProps = {
  ref?: Ref<KonvaCanvasHandle>;
  onSelectionChange?: (selectedId: string | null) => void;
  onItemsChange?: (items: CanvasItem[]) => void;
  className?: string;
};

type NodeMetadata = {
  wardrobeItemId: string;
  itemId: string;
  name: string | null;
  image_url: string | null;
};

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

export function KonvaCanvas({
  ref,
  onSelectionChange,
  onItemsChange,
  className,
}: KonvaCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const konvaContainerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [itemsState, setItemsState] = useState<CanvasItem[]>([]);

  const selectedIdRef = useRef<string | null>(null);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onItemsChangeRef = useRef(onItemsChange);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);

  useEffect(() => {
    onItemsChangeRef.current = onItemsChange;
  }, [onItemsChange]);

  // Helper: Collect current items from Konva scene graph including scale factor
  const collectItems = useCallback((): CanvasItem[] => {
    const stage = stageRef.current;
    const layer = layerRef.current;
    if (!stage || !layer) return [];

    const width = stage.width() || 1;
    const height = stage.height() || 1;

    const garmentNodes = layer.find<Konva.Image>(".garment-item");
    const list: CanvasItem[] = [];

    garmentNodes.forEach((node, index) => {
      const meta = node.getAttr("meta") as NodeMetadata | undefined;
      if (!meta) return;

      const nodeScale = Math.round(Math.abs(node.scaleX()) * 1000) / 1000 || 1;

      list.push({
        wardrobeItemId: meta.wardrobeItemId,
        itemId: meta.itemId,
        name: meta.name,
        image_url: meta.image_url,
        x: clamp01(node.x() / width),
        y: clamp01(node.y() / height),
        layerOrder: index,
        scale: nodeScale,
      });
    });

    return list;
  }, []);

  const syncItems = useCallback(() => {
    const current = collectItems();
    setItemsState(current);
    onItemsChangeRef.current?.(current);
  }, [collectItems]);

  const selectNode = useCallback((node: Konva.Image | null) => {
    const tr = transformerRef.current;
    const layer = layerRef.current;
    if (!tr || !layer) return;

    if (node) {
      tr.nodes([node]);
      tr.moveToTop();
      const meta = node.getAttr("meta") as NodeMetadata | undefined;
      const id = meta?.wardrobeItemId ?? node.id();
      selectedIdRef.current = id;
      setSelectedId(id);
      onSelectionChangeRef.current?.(id);
    } else {
      tr.nodes([]);
      selectedIdRef.current = null;
      setSelectedId(null);
      onSelectionChangeRef.current?.(null);
    }
    layer.batchDraw();
  }, []);

  // Create & add Konva.Image for a wardrobe option with optional scale
  const addGarmentToCanvas = useCallback(
    (option: WardrobeOption, normX = 0.5, normY = 0.5, scale = 1) => {
      const stage = stageRef.current;
      const layer = layerRef.current;
      const tr = transformerRef.current;
      if (!stage || !layer || !tr) return;

      const stageW = stage.width();
      const stageH = stage.height();

      // Check if item already exists on canvas
      const existing = layer.findOne<Konva.Image>(`#${option.wardrobeItemId}`);
      if (existing) {
        existing.position({
          x: normX * stageW,
          y: normY * stageH,
        });
        if (scale !== 1) {
          existing.scale({ x: scale, y: scale });
        }
        selectNode(existing);
        syncItems();
        return;
      }

      const size = Math.min(stageW, stageH) * ITEM_SIZE_RATIO;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = option.image_url ?? "";

      const createNode = () => {
        const konvaImage = new Konva.Image({
          id: option.wardrobeItemId,
          image: img,
          x: normX * stageW,
          y: normY * stageH,
          width: size,
          height: size,
          scaleX: scale,
          scaleY: scale,
          offsetX: size / 2,
          offsetY: size / 2,
          draggable: true,
          name: "garment-item",
        });

        konvaImage.setAttr("meta", {
          wardrobeItemId: option.wardrobeItemId,
          itemId: option.itemId,
          name: option.name,
          image_url: option.image_url,
        } satisfies NodeMetadata);

        // Interaction listeners
        konvaImage.on("pointerdown tap click", (e) => {
          e.cancelBubble = true;
          selectNode(konvaImage);
        });

        konvaImage.on("dragend", () => {
          syncItems();
        });

        konvaImage.on("transformend", () => {
          syncItems();
        });

        // Add image to layer and ensure transformer stays on top
        layer.add(konvaImage);
        tr.moveToTop();
        selectNode(konvaImage);
        syncItems();
        layer.batchDraw();
      };

      createNode();
      img.onload = () => {
        layer.batchDraw();
      };
    },
    [selectNode, syncItems],
  );

  // Imperative ref methods exposed to MixAndMatchCanvas parent
  useImperativeHandle(
    ref,
    () => ({
      addItem: (option, x = 0.5, y = 0.5, scale = 1) => {
        addGarmentToCanvas(option, x, y, scale);
      },
      deleteSelected: () => {
        const currentId = selectedIdRef.current;
        const layer = layerRef.current;
        if (!currentId || !layer) return;

        const node = layer.findOne(`#${currentId}`);
        if (node) {
          node.destroy();
          selectNode(null);
          syncItems();
        }
      },
      moveLayer: (direction: "up" | "down") => {
        const currentId = selectedIdRef.current;
        const layer = layerRef.current;
        const tr = transformerRef.current;
        if (!currentId || !layer || !tr) return;

        const node = layer.findOne(`#${currentId}`);
        if (!node) return;

        if (direction === "up") {
          node.moveUp();
        } else {
          node.moveDown();
        }
        tr.moveToTop();
        layer.batchDraw();
        syncItems();
      },
      shuffle: (newItems) => {
        const layer = layerRef.current;
        if (!layer) return;

        // Remove all existing garment items
        const existing = layer.find(".garment-item");
        existing.forEach((n) => n.destroy());
        selectNode(null);

        newItems.forEach(({ option, x, y, scale }) => {
          addGarmentToCanvas(option, x, y, scale ?? 1);
        });
      },
      getItems: () => collectItems(),
      getSelectedId: () => selectedIdRef.current,
      clear: () => {
        const layer = layerRef.current;
        if (!layer) return;
        const existing = layer.find(".garment-item");
        existing.forEach((n) => n.destroy());
        selectNode(null);
        syncItems();
      },
    }),
    [addGarmentToCanvas, collectItems, selectNode, syncItems],
  );

  // Initialize Konva Stage and Transformer on mount
  useEffect(() => {
    const container = konvaContainerRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    const stage = new Konva.Stage({
      container,
      width,
      height,
    });
    stageRef.current = stage;

    const layer = new Konva.Layer();
    stage.add(layer);
    layerRef.current = layer;

    // Figma-aligned Transformer: 4 corner handles with Slate (#444440) border
    const tr = new Konva.Transformer({
      rotateEnabled: true,
      keepRatio: true,
      enabledAnchors: [
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
      ],
      borderStroke: "#444440",
      borderStrokeWidth: 1.5,
      borderDash: [0],
      anchorStroke: "#444440",
      anchorFill: "#FAF8F5",
      anchorSize: 8,
      anchorCornerRadius: 2,
      boundBoxFunc: (oldBox, newBox) => {
        if (Math.abs(newBox.width) < 30 || Math.abs(newBox.height) < 30) {
          return oldBox;
        }
        return newBox;
      },
    });
    layer.add(tr);
    transformerRef.current = tr;

    // Click on background deselects
    stage.on("pointerdown tap click", (e) => {
      if (e.target === stage) {
        selectNode(null);
      }
    });

    // ResizeObserver to keep canvas stage responsive to fluid layout
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          const oldW = stage.width();
          const oldH = stage.height();

          if (oldW > 0 && oldH > 0 && (oldW !== newW || oldH !== newH)) {
            const scaleRatio = newW / oldW;
            const garments = layer.find<Konva.Image>(".garment-item");
            garments.forEach((g) => {
              const normX = g.x() / oldW;
              const normY = g.y() / oldH;
              const newSize = g.width() * scaleRatio;
              g.position({
                x: normX * newW,
                y: normY * newH,
              });
              g.width(newSize);
              g.height(newSize);
              g.offsetX(newSize / 2);
              g.offsetY(newSize / 2);
            });
          }

          stage.width(newW);
          stage.height(newH);
          layer.batchDraw();
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      stage.destroy();
      stageRef.current = null;
      layerRef.current = null;
      transformerRef.current = null;
    };
  }, [selectNode]);

  return (
    <div
      ref={containerRef}
      data-testid="mix-and-match__canvas"
      className={className}
    >
      {/* Dedicated mount target for Konva Stage to prevent mutating React DOM */}
      <div ref={konvaContainerRef} className="absolute inset-0" />

      {itemsState.length === 0 && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 text-center"
          data-testid="mix-and-match__empty-state"
        >
          <Typography
            variant="subtitle"
            className="text-muted-foreground text-xs lg:text-sm font-normal"
          >
            Tap or drag wardrobe items here to start your look.
          </Typography>
        </div>
      )}

      {/* DOM inspection mirrors for Vitest & automated BEM test selectors */}
      <div className="sr-only" aria-hidden="true">
        {itemsState.map((item) => (
          <div
            key={item.wardrobeItemId}
            data-testid="mix-and-match__canvas-item"
            data-entity-id={item.wardrobeItemId}
            data-selected={item.wardrobeItemId === selectedId ? "true" : "false"}
            data-scale={item.scale ?? 1}
          >
            {item.wardrobeItemId === selectedId && (
              <span data-testid="mix-and-match__selection-border" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
